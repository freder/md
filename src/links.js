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
	const lookup = {};
	const _links = matches.map(
		(match) => {
			const m = match[1];
			const linkedFile = `${m}.md`;
			const p = path.join(
				path.dirname(file),
				linkedFile
			);
			lookup[p] = m;
			// in the end all paths are relative to the root dir
			return path.normalize(p);
		}
	);
	const links = [];
	const brokenLinks = [];
	const brokenLinksOriginal = [];
	_links.forEach((l) => {
		if (files.includes(l)) {
			links.push(l);
		} else {
			brokenLinks.push(l);
			brokenLinksOriginal.push(lookup[l]);
		}
	});
	return {
		links,
		brokenLinks,
		brokenLinksOriginal,
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


// const globallyUpdateLink =
module.exports.globallyUpdateLink = async (rootDir, oldPath, newPath) => {
	const substitutionPattern = makeSubstitutionPattern(oldPath, newPath);
	/* eslint-disable indent */
	const command = [
		'find',
			`"${rootDir}"`,
			'-type f',
			'-iname "*.md"',
			'-exec',
				'gsed',
					`--in-place "${substitutionPattern}"`,
					'{}',
					'\\;'
	].join(' ');
	/* eslint-enable indent */
	return getExecStdout(command);


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
