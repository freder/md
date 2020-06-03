const utils = require('../utils.js');


describe('extractReplaceText', () => {
	it('should extract a range of characters and replace them with another string', () => {
		const str = '0123456789';
		const [str2, extracted] = utils.extractReplaceText(3, 5, str, 'xxx');
		expect(str2).toEqual('012xxx56789');
		expect(extracted).toEqual('34');
	});
});
