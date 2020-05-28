const { exec } = require('child_process');
const R = require('ramda');


function getTags(rootDir) {
	return new Promise((resolve, reject) => {
		exec(
			`ag \
				--only-matching \
				--no-filename \
				--nonumbers \
				-i '#[a-z]+' \
				"${rootDir}" \
					| awk NF \
					| sort \
					| uniq -c \
					| sort --reverse`,
			{},
			(err, stdout, stderr) => {
				if (err) {
					console.error(err);
					return reject(err);
				}
				const lines = stdout.split(/[\r\n]/g)
					.map((line) => {
						const l = `${line}`.trim();
						return (!l.length) ? null : l;
					})
					.filter(R.identity);
				const result = lines
					.map((line) => {
						const [count, label] = line.trim().split(/[ \t]+/g);
						return {
							count: parseInt(count, 10),
							label,
						};
					});
				resolve(result);
			}
		);
	})
}


function main() {
	const args = R.drop(2, process.argv);
	const rootDir = args[0];
	getTags(rootDir).then(console.log);
}
main();
