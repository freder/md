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


const moveFile =
module.exports.moveFile = async (rootDir, oldPath, newPath) => {
	// move / rename file
	const fullPathNew = path.join(rootDir, newPath);
	await fse.move(
		path.join(rootDir, oldPath),
		fullPathNew,
		{ overwrite: true }
	);

	// update node positions file
	fs.readFile('src/web/positions.json', (err, buf) => {
		if (err) { return console.error(err); }
		const data = JSON.parse(buf.toString());
		data[newPath] = data[oldPath];
		delete data[oldPath];
		fs.writeFile(
			'src/web/positions.json',
			JSON.stringify(data, null, '\t'),
			(err) => {
				if (err) { return console.error(err); }
			}
		);
	});

	// update links _to_ moved document
	const files = await getFilesList(rootDir);
	await updateLinkInFiles(rootDir, files, oldPath, newPath);

	// update links _from_ moved document
	const fileContent = await getFileContent(rootDir, newPath);
	const { brokenLinks } = getLinksFromFile(files, newPath, fileContent);
	const substitutionPatterns = brokenLinks.map((brokenLink) => {
		const oldLink = brokenLink.relativeToFile;
		const newLink = path.join(
			path.relative(
				path.dirname(newPath),
				path.dirname(
					path.join(
						path.dirname(oldPath),
						oldLink
					)
				),
			),
			path.basename(oldLink)
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


// const moveDirectory =
module.exports.moveDirectory = async (rootDir, oldPath, newPath) => {
	/*
		- get list of all files in dir
		- for each file
			- move to destination
	*/
	const files = await getFilesList(
		path.join(rootDir, oldPath)
	);
	const promises = files.map((file) => {
		const oldFilePath = path.join(oldPath, file);
		const newFilePath = path.join(newPath, file);
		return moveFile(rootDir, oldFilePath, newFilePath);
	});

	// we might move deeper in to the old path, in which case we
	// obviously can't remove the old dir
	const removable = !newPath.startsWith(oldPath);
	if (removable) {
		fs.unlink(oldPath, (err) => {
			if (err) { throw err; }
		});
	}

	await Promise.all(promises);
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
