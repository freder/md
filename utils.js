const { exec } = require('child_process');
const R = require('ramda');


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
