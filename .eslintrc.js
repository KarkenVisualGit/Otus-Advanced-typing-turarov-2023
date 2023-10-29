module.exports = {
	env: {
		"browser": true,
		"es2021": true,
		"jest/globals": true,
		"node": true,
	},
	extends: [
		"airbnb-base",
		"eslint:recommended",
		"plugin:jest/recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:vue/vue3-essential",
		"prettier",
	],
	overrides: [
		{
			env: {
				node: true,
			},
			files: [".eslintrc.{js,cjs}"],
			parserOptions: {
				sourceType: "script",
			},
		},
	],
	parserOptions: {
		ecmaVersion: "latest",
		parser: "@typescript-eslint/parser",
		sourceType: "module",
	},
	plugins: ["@typescript-eslint", "vue"],
	rules: {
		"import/extensions": ["warn", "never"],
		"import/prefer-default-export": "off",
		"jest/valid-title": "off",
		"no-console": "off",
		"no-alert": "off",
		"no-restricted-globals": "off",
		"no-promise-executor-return": "off",
		"indent": ["error", "tab"],
		"linebreak-style": ["error", "windows"],
		"quotes": ["error", "double"],
		"semi": ["error", "always"],
		"jest/no-disabled-tests": "warn",
		"jest/no-focused-tests": "error",
		"jest/no-identical-title": "error",
		"jest/prefer-to-have-length": "warn",
		"jest/valid-expect": "error",
		"max-len": [
			"error",
			{ ignoreTrailingComments: true },
			{
				ignoreComments: true,
			},
			{
				code: 100,
			},
		],
		"import/no-unresolved": "off",
	},
};
