const fs = require('fs');

const R = require('ramda');

const {
	getFilesList,
	getFileContent,
	getFrontmatterFromString,
} = require('./utils.js');
const {
	getLinksFromFile,
	withBacklinks,
} = require('./links.js');
// const tags = require('./tags.js');
// const refactor = require('./refactor.js');
const vis = require('./visualization.js');


async function getDocumentsData(rootDir, files) {
	const promises = files.map(async (file) => {
		const fileContent = await getFileContent(rootDir, file);
		const frontmatter = getFrontmatterFromString(fileContent);
		const { links, brokenLinks } = getLinksFromFile(files, file, fileContent);
		return {
			file,
			frontmatter,
			links,
			brokenLinks,
		};
	});
	return Promise.all(promises);
}


async function main() {
	const args = R.drop(2, process.argv);
	const rootDir = args[0];

	// tags.getTagsHistogram(rootDir).then(console.log);

	// TODO: write test
	// await moveFile(rootDir, 'introduction.md', 'subdir/asdf.md');

	const files = await getFilesList(rootDir);
	let fileItems = await getDocumentsData(rootDir, files);
	fileItems = withBacklinks(fileItems);
	console.log(fileItems);

	// prep visualization data:
	fs.writeFileSync(
		'src/web/data.json',
		JSON.stringify(vis.prepareData(fileItems), null, '\t')
	);
}

main();
