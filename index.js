const { exec } = require('child_process');
const R = require('ramda');


function asyncExec(command) {
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
}


function getExecStdout(command) {
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
}


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

	return getExecStdout(command)
		.then((lines) => lines.map(parseLine));
}


function main() {
	const args = R.drop(2, process.argv);
	const rootDir = args[0];
	getTags(rootDir).then(console.log);
}
main();
