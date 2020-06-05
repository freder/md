const path = require('path');

const R = require('ramda');

const {
	removeFileExt,
	getExecStdout,
	getFileContent,
	getFrontmatterFromString,
} = require('./utils.js');


const getLinksFromFile =
module.exports.getLinksFromFile = (files, file, fileContent) => {
	const matches = Array.from(
		fileContent.matchAll(/\[\[(.*?)\]\]/ig)
	);
	const _links = matches.map(
		(match) => {
			const relativeToFile = `${match[1]}.md`;
			const relativeToRoot = path.normalize(
				path.join(
					path.dirname(file),
					relativeToFile
				)
			);
			return {
				relativeToFile,
				relativeToRoot,
			};
		}
	);

	const links = [];
	const brokenLinks = [];
	_links.forEach((link) => {
		if (files.includes(link.relativeToRoot)) {
			links.push(link);
		} else {
			brokenLinks.push(link);
		}
	});

	return {
		links,
		brokenLinks,
	};
};


// const withBacklinks =
module.exports.withBacklinks = (linkItems) => {
	// map file name to data
	const nameToData = {};
	linkItems.forEach((item) => {
		nameToData[item.file] = {
			...item,
			backLinks: [],
		};
	});

	// add backLinks
	linkItems.forEach(({ file, links }) => {
		linkItems.forEach((other) => {
			if (file === other.file) { return; }
			if (other.links.includes(file)) {
				if (!links.includes(other.file)) {
					nameToData[file].backLinks.push(other.file);
				}
			}
		});
	});

	// convert back to list
	return R.pipe(
		R.toPairs,
		R.map(([file, data]) => data) // eslint-disable-line no-unused-vars
	)(nameToData);
};


const makeSubstitutionPattern =
module.exports.makeSubstitutionPattern = (oldPath, newPath) => {
	const prep = (x) => removeFileExt(x)
		.replace(/\//ig, '\\/')
		.replace(/\./ig, '\\.');
	const a = prep(oldPath);
	const b = prep(newPath);
	return `s/\\[\\[${a}/\\[\\[${b}/ig`;
};


// const updateLinkInFiles =
module.exports.updateLinkInFiles = async (rootDir, files, oldPath, newPath) => {
	const promises = (await getDocumentsData(rootDir, files))
		// figure out which docs need to be updated:
		.map((doc) => {
			const links = [
				...doc.links,
				...doc.brokenLinks,
			];
			return [
				doc,
				links.filter(
					(link) => link.relativeToRoot === oldPath
				),
			];
		})
		.map(([doc, links]) => {
			if (!links.length) { return; }
			const oldLink = links[0].relativeToFile;
			const newLink = path.relative(
				path.dirname(doc.file),
				newPath
			);
			const substitutionPattern = makeSubstitutionPattern(oldLink, newLink);
			const command = [
				/* eslint-disable indent */
				'gsed',
					`--in-place "${substitutionPattern}"`,
					`"${path.join(rootDir, doc.file)}"`
				/* eslint-enable indent */
			].join(' ');
			return getExecStdout(command);
		});
	await Promise.all(promises);
};


const getDocumentsData =
module.exports.getDocumentsData = (rootDir, files) => {
	const promises = files.map(async (file) => {
		const fileContent = await getFileContent(rootDir, file);
		const frontmatter = getFrontmatterFromString(fileContent);
		const { links, brokenLinks } = getLinksFromFile(files, file, fileContent);
		return {
			file,
			frontmatter,
			links,
			brokenLinks,
		};
	});
	return Promise.all(promises);
};
