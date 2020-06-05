const fs = require('fs');
const path = require('path');

const fse = require('fs-extra');

const utils = require('../src/utils.js');
const refactor = require('../src/refactor.js');


const rootDir = '__tests__/files';


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
