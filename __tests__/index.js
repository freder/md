const fs = require('fs');
const path = require('path');

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
