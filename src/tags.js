const fsPromise = require('fs/promises');
const path = require('path');

const R = require('ramda');
const matter = require('gray-matter');

const {
	getFilesList,
	getFileContent,
	getFrontmatterFromString,
} = require('./utils.js');
const { getDocumentsData } = require('./links.js');


// const getTagsHistogram =
// module.exports.getTagsHistogram = async (rootDir) => {
// 	/* eslint-disable indent */
// 	const command = [
// 		'ag',
// 			'--only-matching',
// 			'--no-filename',
// 			'--nonumbers',
// 			'-i \'#[a-z]+\'',
// 			`"${rootDir}"`,
// 				'| awk NF', // remove empty lines
// 				'| sort',
// 				'| uniq -c',
// 				'| sort --reverse', // most frequent first
// 	].join(' ');
// 	/* eslint-enable indent */

// 	const parseLine = (line) => {
// 		const [count, label] = line.trim().split(/[ \t]+/g);
// 		return {
// 			count: parseInt(count, 10),
// 			label,
// 		};
// 	};

// 	return utils.getExecStdout(command)
// 		.then((lines) => lines.map(parseLine));
// };


const parseTags = (tagsStr) => tagsStr.split(/ *, */ig);


const frontmatterGetTags = (frontmatter) => {
	const tagsStr = R.propOr('', 'tags', frontmatter);
	return parseTags(tagsStr);
};


const getAllTags =
module.exports.getAllTags = async (rootDir) => {
	const files = await getFilesList(rootDir);
	const docs = await getDocumentsData(rootDir, files);
	return R.pipe(
		R.map((doc) => {
			const tags = frontmatterGetTags(doc.frontmatter);
			return tags.map((tag) => ({ tag, file: doc.file }));
		}),
		R.unnest,
	)(docs);
};


// const getTagsHistogram =
module.exports.getTagsHistogram = async (rootDir) => {
	const tags = await getAllTags(rootDir);
	const histo = {};
	tags.forEach(({ tag }) => {
		if (!histo[tag]) { histo[tag] = 0; }
		histo[tag]++;
	});
	return histo;
};


// const replaceTags =
module.exports.replaceTags = async (rootDir, replacementMap) => {
	/*{
		asdf: 'xxxx',
		test: ['te', 'st']
	}*/
	const oldTags = R.keys(replacementMap);
	const tags = await getAllTags(rootDir);
	const filesToUpdate = R.pipe(
		R.filter(({ tag }) => oldTags.includes(tag)),
		R.map(R.prop('file')),
		R.uniq,
	)(tags);
	const promises = filesToUpdate.map(async (file) => {
		const content = await getFileContent(rootDir, file);
		const frontmatter = getFrontmatterFromString(content);
		const tags = frontmatterGetTags(frontmatter);
		const newFrontmatter = {
			...frontmatter,
			tags: R.pipe(
				R.map((tag) => replacementMap[tag] || tag),
				R.unnest,
				R.uniq, // new tag could be the same as an original one
				R.join(', '),
			)(tags),
		};
		const newContent = [
			matter.stringify('', newFrontmatter)
				.replace(/'/ig, '') // TODO: any way to avoid quotes getting added?
				.replace(/\n$/, ''),
			R.drop(2, content.split(/---\n/ig))
				.join('---\n'),
		].join('');
		return fsPromise.writeFile(
			path.join(rootDir, file),
			newContent,
		);
	});
	await Promise.all(promises);
};
