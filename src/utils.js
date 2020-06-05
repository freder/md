const { exec } = require('child_process');
const path = require('path');
const fsPromise = require('fs/promises');

const R = require('ramda');
const glob = require('glob');
const matter = require('gray-matter');


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


// const getExecStdout =
module.exports.getExecStdout = (command) => {
	return asyncExec(command)
		.then(({ stdout/*, stderr*/ }) => {
			const lines = stdout.split(/[\r\n]/g)
				.map((line) => {
					const l = `${line}`.trim();
					return (!l.length) ? null : l;
				})
				.filter(R.identity);
			return lines;
		});
};


// const getFilesList =
module.exports.getFilesList = (rootDir) => {
	return new Promise((resolve, reject) => {
		// TODO: use `find` instead?
		glob(
			path.join('**', '*.md'),
			{ cwd: rootDir },
			(err, matches) => {
				if (err) {
					return reject(err);
				}
				resolve(matches);
			}
		);
	});
};


// const removeFileExt =
module.exports.removeFileExt = (filePath) => {
	return filePath.replace(/\.md$/i, '');
};


// const getFileContent =
module.exports.getFileContent = async (rootDir, file) => {
	const filePath = path.join(rootDir, file);
	return (
		await fsPromise.readFile(filePath)
	).toString();
};


// const getFrontmatterFromString =
module.exports.getFrontmatterFromString =  (str) => {
	return matter(str).data;
};


// const extractReplaceText =
module.exports.extractReplaceText = (start, end, str, replacement) => {
	const [a, b] = R.splitAt(start, str);
	const [extracted, c] = R.splitAt(end - start, b);
	return [
		`${a}${replacement}${c}`,
		extracted,
	];
};



