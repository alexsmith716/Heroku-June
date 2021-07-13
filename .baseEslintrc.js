'use strict';

module.exports = {
	root: true,

	extends: [
		'eslint:recommended',
		'plugin:prettier/recommended',
		'plugin:react/recommended'
	],

	parser: '@babel/eslint-parser',

	plugins: [
		'react',
	],

	env: {
		browser: true,
		commonjs: true,
		es6: true,
		jest: true,
		node: true,
	},

	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},

	settings: {
		react: {
			version: 'detect',
		},
	},

	rules: {
		'react/jsx-uses-vars': 1,
		'react/jsx-uses-react': 1,
	},
};
