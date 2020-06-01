const R = require('ramda');

const utils = require('./utils.js');


async function getTags(rootDir) {
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


function main() {
	const args = R.drop(2, process.argv);
	const rootDir = args[0];
	getTags(rootDir).then(console.log);
}
main();
