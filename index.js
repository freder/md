const fsPromise = require('fs/promises');
const fs = require('fs');
const path = require('path');

const R = require('ramda');

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


async function getLinksFromFile(filePath) {
	const content = (await fsPromise.readFile(filePath)).toString();
	const links = content.matchAll(/\[\[(.*?)\]\]/ig);
	return links;
}


async function getLinks(rootDir) {
	const files = await utils.getFiles(rootDir);
	const promises = R.map(async (file) => {
		const filePath = path.join(rootDir, file);
		const matches = Array.from(
			await getLinksFromFile(filePath)
		);
		const _links = matches.map(
			(match) => {
				const linkedFile = `${match[1]}.md`;
				const p = path.join(
					path.dirname(file),
					linkedFile
				);
				// in the end all paths are relative to the root dir
				return path.normalize(p);
			}
		);
		const links = [];
		const brokenLinks = [];
		_links.forEach((l) => {
			if (files.includes(l)) {
				links.push(l);
			} else {
				brokenLinks.push(l);
			}
		});
		return {
			file,
			links,
			brokenLinks,
		};
	})(files);
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


async function main() {
	const args = R.drop(2, process.argv);
	const rootDir = args[0];

	// getTagsHistogram(rootDir).then(console.log);
	let linkItems = await getLinks(rootDir);
	linkItems = addBacklinks(linkItems);
	console.log(linkItems);
}
main();
