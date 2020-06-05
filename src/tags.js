const R = require('ramda');

const { getFilesList } = require('./utils.js');
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


const getAllTags =
module.exports.getAllTags = async (rootDir) => {
	const files = await getFilesList(rootDir);
	const docs = await getDocumentsData(rootDir, files);
	return R.pipe(
		R.map((doc) => {
			const tagsStr = R.pathOr('', ['frontmatter', 'tags'], doc);
			const tags = tagsStr.split(/ *, */ig);
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
