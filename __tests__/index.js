const fs = require('fs');

const utils = require('../src/utils.js');
const refactor = require('../src/refactor.js');


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
		const inFile = '__tests__/files/extract-to-file.md';
		const outFile = '__tests__/files/extracted.md';
		fs.writeFileSync(inFile, '0123456789');

		await refactor.extractToNewFile(
			'__tests__/files',
			'extract-to-file.md',
			3,
			5,
			'extracted.md'
		);
		const content1 = fs.readFileSync(inFile).toString();
		const content2 = fs.readFileSync(outFile).toString();
		expect(content1).toEqual('012[[extracted]]56789');
		expect(content2).toEqual('34');

		fs.unlinkSync(inFile);
		fs.unlinkSync(outFile);
	});
});
