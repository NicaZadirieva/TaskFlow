import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
	{
		rules: {
			'semi': ['error', 'always', { 'omitLastInOneLineBlock': false }],
			'comma-dangle': ['error', 'never'],
			'quotes': ['error', 'single'],
			'indent': ['error', 'tab'],
			'prefer-template': ['error'],
			'prefer-arrow-callback': ['error'],
			'consistent-return': 'error'
		}
	},
	...nextVitals,
	...nextTs,
	globalIgnores([
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts'
	])
]);

export default eslintConfig;