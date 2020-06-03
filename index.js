const fsPromise = require('fs/promises');
const fs = require('fs');
const path = require('path');

const fse = require('fs-extra');
const R = require('ramda');
const matter = require('gray-matter');

const utils = require('./utils.js');


async function getTagsHistogram(rootDir) {
	const command = [
		'ag',
			'--only-matching',
			'--no-filename',
			'--nonumbers',
			'-i \'#[a-z]+\'',
			`"${rootDir}"`,
				'| awk NF', // remove empty lines
				'| sort',
				'| uniq -c',
				'| sort --reverse', // most frequent first
	].join(' ');

	const parseLine = (line) => {
		const [count, label] = line.trim().split(/[ \t]+/g);
		return {
			count: parseInt(count, 10),
			label,
		};
	};

	return utils.getExecStdout(command)
		.then((lines) => lines.map(parseLine));
}


function getLinksFromFile(files, file, fileContent) {
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
}


function getFrontmatterFromFile(fileContent) {
	return matter(fileContent).data;
}


async function getFileContent(rootDir, file) {
	const filePath = path.join(rootDir, file);
	return (
		await fsPromise.readFile(filePath)
	).toString();
}


async function getFilesData(rootDir, files) {
	const promises = files.map(async (file) => {
		const fileContent = await getFileContent(rootDir, file);

		const frontmatter = getFrontmatterFromFile(fileContent);
		const { links, brokenLinks } = getLinksFromFile(files, file, fileContent);

		return {
			file,
			frontmatter,
			links,
			brokenLinks,
		};
	});
	return Promise.all(promises);
}


function addBacklinks(linkItems) {
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
		R.map(([file, data]) => data)
	)(nameToData);
}


function makeSubstitutionPattern(oldPath, newPath) {
	const prep = (x) => x.replace(/\.md$/i, '')
		.replace(/\//ig, '\\/')
		.replace(/\./ig, '\\.');
	const a = prep(oldPath);
	const b = prep(newPath);
	return `s/\\[\\[${a}/\\[\\[${b}/ig`;
}


async function globallyUpdateLink(rootDir, oldPath, newPath) {
	const substitutionPattern = makeSubstitutionPattern(oldPath, newPath);
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
	return utils.getExecStdout(command);
}


async function renameFile(rootDir, oldPath, newPath) {
	const fullPathNew = path.join(rootDir, newPath);
	await fse.move(
		path.join(rootDir, oldPath),
		fullPathNew,
		{ overwrite: true }
	);
	await globallyUpdateLink(rootDir, oldPath, newPath);
	const [files, fileContent] = await Promise.all([
		utils.getFiles(rootDir),
		getFileContent(rootDir, newPath),
	]);
	// we need to fix the ones we broke:
	const { /*links, */brokenLinksOriginal } = getLinksFromFile(files, newPath, fileContent);
	const substitutionPatterns = brokenLinksOriginal.map((brokenLink) => {
		const rel = path.relative(
			path.dirname(newPath),
			brokenLink,
		);
		console.log(rel);
		return makeSubstitutionPattern(
			brokenLink,
			rel
		);
	});
	const command = [
		'gsed',
			`--in-place '${substitutionPatterns.join('; ')}'`,
			`"${fullPathNew}"`,
	].join(' ');
	return utils.getExecStdout(command);
}


async function main() {
	const args = R.drop(2, process.argv);
	const rootDir = args[0];

	// getTagsHistogram(rootDir).then(console.log);

	// TODO: write test
	// await renameFile(rootDir, 'introduction.md', 'subdir/asdf.md');

	const files = await utils.getFiles(rootDir);
	let fileItems = await getFilesData(rootDir, files);
	fileItems = addBacklinks(fileItems);
	console.log(fileItems);

	// prep visualization data:
	const links = [];
	const missing = R.pipe(
		R.map(R.prop('brokenLinks')),
		R.unnest,
		R.uniq,
		R.map((id) => ({ id, isMissing: true })),
	)(fileItems);
	const nodes = [...missing]
	fileItems.forEach((item) => {
		nodes.push({
			...item,
			id: item.file,
		});
		[
			...item.links,
			...item.brokenLinks,
		].forEach((l) => {
			links.push({
				source: item.file,
				target: l,
			});
		});
	});
	fs.writeFileSync(
		'./web/data.json',
		JSON.stringify({ nodes, links }, null, '\t')
	);
}
main();
