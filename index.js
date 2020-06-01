const fs = require('fs/promises');
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
	const content = (await fs.readFile(filePath)).toString();
	const links = content.matchAll(/\[\[(.*?)\]\]/ig);
	return links;
}


async function getLinks(rootDir) {
	const files = await utils.getFiles(rootDir);
	const promises = R.map(async (f) => {
		const filePath = path.join(rootDir, f);
		const links = Array.from(
			await getLinksFromFile(filePath)
		);
		return {
			file: f,
			links: R.pipe(
				R.map(R.nth(1)), // extract name
				R.map((n) => `${n}.md`)
			)(links),
		};
	})(files);
	return Promise.all(promises);
}


function main() {
	const args = R.drop(2, process.argv);
	const rootDir = args[0];
	// getTagsHistogram(rootDir).then(console.log);
	getLinks(rootDir).then(console.log);
}
main();
