module.exports = {
	'env': {
		'browser': true,
		'commonjs': true,
		'es6': true,
		'jest/globals': true,
	},
	plugins: ['jest'],
	'extends': [
		'eslint:recommended',
		'plugin:jest/recommended',
	],
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly',
		'd3': true,
		'process': true,
	},
	'parserOptions': {
		'ecmaVersion': 11
	},
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],

		'no-unused-vars': 'warn',
	}
};
