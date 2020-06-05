const fs = require('fs');

const R = require('ramda');

const { getFilesList } = require('./utils.js');
const {
	getDocumentsData,
	withBacklinks,
} = require('./links.js');
// const tags = require('./tags.js');
// const refactor = require('./refactor.js');
const vis = require('./visualization.js');


async function main() {
	const args = R.drop(2, process.argv);
	const rootDir = args[0];

	// tags.getTagsHistogram(rootDir).then(console.log);

	// TODO: write test
	// await moveFile(rootDir, 'introduction.md', 'subdir/asdf.md');

	const files = await getFilesList(rootDir);
	let docs = await getDocumentsData(rootDir, files);
	docs = withBacklinks(docs);
	console.log(docs);

	// prep visualization data:
	fs.writeFileSync(
		'src/web/data.json',
		JSON.stringify(vis.prepareData(docs), null, '\t')
	);
}

main();
