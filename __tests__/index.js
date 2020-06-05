const fs = require('fs');
const path = require('path');

const fse = require('fs-extra');

const utils = require('../src/utils.js');
const refactor = require('../src/refactor.js');
const tags = require('../src/tags.js');


const rootDir = '__tests__/tmp';


describe('getTagsHistogram', () => {
	it('should count all tags', async () => {
		const rootDir = '__tests__/tags';
		const histo = await tags.getTagsHistogram(rootDir);
		expect(histo.test).toEqual(2);
		expect(histo.qwer).toEqual(1);
		expect(histo.asdf).toEqual(1);
	});
});


describe('replaceTags', () => {
	it('should replace tags in frontmatter', async () => {
		const rootDir = '__tests__/tags';
		const aContentOrig = await utils.getFileContent(rootDir, 'a.md');
		const bContentOrig = await utils.getFileContent(rootDir, 'b.md');
		await tags.replaceTags(
			rootDir,
			{
				asdf: 'xxxx',
				test: ['te', 'st']
			}
		);
		const aTagsLine = (await utils.getFileContent(rootDir, 'a.md')).split('\n')[1];
		expect(aTagsLine).toEqual('tags: te, st, xxxx');
		const bTagsLine = (await utils.getFileContent(rootDir, 'b.md')).split('\n')[1];
		expect(bTagsLine).toEqual('tags: qwer, te, st');
		fs.writeFileSync(path.join(rootDir, 'a.md'), aContentOrig);
		fs.writeFileSync(path.join(rootDir, 'b.md'), bContentOrig);
	});
});


describe('extractReplaceText', () => {
	it('should extract a range of characters and replace them with another string', () => {
		const str = '0123456789';
		const [str2, extracted] = utils.extractReplaceText(3, 5, str, 'xxx');
		expect(str2).toEqual('012xxx56789');
		expect(extracted).toEqual('34');
	});
});


describe('extractToNewFile', () => {
	it('should extract to a new file', async () => {
		const inFileName = 'extract-to-file.md';
		const name = 'extracted';
		const outFileName = `${name}.md`;
		const inFile = path.join(rootDir, inFileName);
		const outFile = path.join(rootDir, outFileName);
		fs.writeFileSync(inFile, '0123456789');
		await refactor.extractToNewFile(
			rootDir,
			inFileName,
			3,
			5,
			outFileName
		);
		const content1 = fs.readFileSync(inFile).toString();
		const content2 = fs.readFileSync(outFile).toString();
		expect(content1).toEqual(`012[[${name}]]56789`);
		expect(content2).toEqual('34');
		fs.unlinkSync(inFile);
		fs.unlinkSync(outFile);
	});
});


describe('moveFile', () => {
	it('should move the file and update links to and from it', async () => {
		/*
			before:
			- a.md
			- subdir1/c.md
			- d.md
		*/
		/*
			after:
			- a.md
			- subdir1/c.md
			- subdir2/dddd.md
		*/
		const aPath = path.join(rootDir, 'a.md');
		fs.writeFileSync(aPath, '[[d]]');

		const cDir = path.join(rootDir, 'subdir1');
		const cPath = path.join(cDir, 'c.md');
		await fse.mkdirp(cDir);
		fs.writeFileSync(cPath, '[[../d]]');

		const dPath = path.join(rootDir, 'd.md');
		fs.writeFileSync(dPath, '[[a]]\n[[b]]\n[[subdir1/c]]');

		await refactor.moveFile(rootDir, 'd.md', 'subdir2/dddd.md');

		let content = fs.readFileSync(aPath).toString();
		expect(content).toEqual('[[subdir2/dddd]]');

		content = fs.readFileSync(cPath).toString();
		expect(content).toEqual('[[../subdir2/dddd]]');

		content = fs.readFileSync(path.join(rootDir, 'subdir2/dddd.md')).toString();
		expect(content).toEqual('[[../a]]\n[[../b]]\n[[../subdir1/c]]');

		fs.unlinkSync(aPath);
		fs.unlinkSync(cPath);
		fs.unlinkSync(
			path.join(rootDir, 'subdir2', 'dddd.md')
		);
	});
});
