const fs = require('fs');
const path = require('path');

const fse = require('fs-extra');

const {
	getFilesList,
	getFileContent,
	getExecStdout,
	removeFileExt,
	extractReplaceText,
} = require('./utils.js');
const {
	updateLinkInFiles,
	getLinksFromFile,
	makeSubstitutionPattern,
} = require('./links.js');


// const moveFile =
module.exports.moveFile = async (rootDir, oldPath, newPath) => {
	// move / rename file
	const fullPathNew = path.join(rootDir, newPath);
	await fse.move(
		path.join(rootDir, oldPath),
		fullPathNew,
		{ overwrite: true }
	);

	// update links _to_ moved document
	const files = await getFilesList(rootDir);
	await updateLinkInFiles(rootDir, files, oldPath, newPath);

	// update links _from_ moved document
	const fileContent = await getFileContent(rootDir, newPath);
	const { brokenLinks } = getLinksFromFile(files, newPath, fileContent);
	const substitutionPatterns = brokenLinks.map((brokenLink) => {
		const oldLink = brokenLink.relativeToFile;
		const newLink = path.relative(
			path.dirname(newPath),
			oldLink,
		);
		return makeSubstitutionPattern(
			oldLink,
			newLink
		);
	});
	const command = [
		/* eslint-disable indent */
		'gsed',
			`--in-place '${substitutionPatterns.join('; ')}'`,
			`"${fullPathNew}"`,
		/* eslint-enable indent */
	].join(' ');
	return getExecStdout(command);
};


// const extractToNewFile =
module.exports.extractToNewFile = async (rootDir, filePath, start, end, newFilePath) => {
	const fileContent = await getFileContent(rootDir, filePath);
	const linkPath = path.relative(
		path.dirname(filePath),
		newFilePath
	);
	const link = `[[${removeFileExt(linkPath)}]]`;
	const [newContent, extracted] = extractReplaceText(start, end, fileContent, link);

	const outputFilePath = path.join(rootDir, newFilePath);
	fse.mkdirp(
		path.dirname(outputFilePath)
	);
	fs.writeFileSync(
		outputFilePath,
		extracted
	);

	fs.writeFileSync(
		path.join(rootDir, filePath),
		newContent
	);
};
