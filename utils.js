const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const fsPromise = require('fs/promises');

const R = require('ramda');
const glob = require('glob');
const fse = require('fs-extra');


const asyncExec =
module.exports.asyncExec = (command) => {
	return new Promise((resolve, reject) => {
		exec(
			command,
			{},
			(err, stdout, stderr) => {
				if (err) {
					console.error(err);
					return reject(err);
				}
				resolve({ stdout, stderr });
			}
		);
	});
};


const getExecStdout =
module.exports.getExecStdout = (command) => {
	return asyncExec(command)
		.then(({ stdout, stderr }) => {
			const lines = stdout.split(/[\r\n]/g)
				.map((line) => {
					const l = `${line}`.trim();
					return (!l.length) ? null : l;
				})
				.filter(R.identity);
			return lines;
		});
};


const getFiles =
module.exports.getFiles = (rootDir) => {
	return new Promise((resolve, reject) => {
		glob(
			path.join('**', '*.md'),
			{ cwd: rootDir },
			(err, matches) => {
				if (err) {
					return reject(err);
				}
				resolve(matches);
			}
		)
	});
};


const getFileContent =
module.exports.getFileContent = async (rootDir, file) => {
	const filePath = path.join(rootDir, file);
	return (
		await fsPromise.readFile(filePath)
	).toString();
};


const extractReplaceText =
module.exports.extractReplaceText = (start, end, str, replacement) => {
	const [a, b] = R.splitAt(start, str);
	const [extracted, c] = R.splitAt(end - start, b);
	return [
		`${a}${replacement}${c}`,
		extracted,
	];
};


const extractToNewFile =
module.exports.extractToNewFile = async (rootDir, filePath, start, end, replacement, newFilePath) => {
	const fileContent = await getFileContent(rootDir, filePath);
	const [newContent, extracted] = extractReplaceText(start, end, fileContent, replacement);

	const outputFilePath = path.join(rootDir, newFilePath);
	fse.mkdirp(
		path.dirname(outputFilePath)
	)
	fs.writeFileSync(
		outputFilePath,
		extracted
	);

	fs.writeFileSync(
		path.join(rootDir, filePath),
		newContent
	);
};
