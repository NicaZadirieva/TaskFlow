import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import stylistic from '@stylistic/eslint-plugin';

const eslintConfig = defineConfig([
	// 1. Конфиги Next.js — идут первыми, чтобы их можно было переопределить
	...nextVitals,
	...nextTs,

	// 2. Отключаем устаревшие core-правила, если они случайно включены в Next.js
	stylistic.configs['disable-legacy'],

	{
		plugins: {
			'@stylistic': stylistic
		},
		rules: {
			'@stylistic/semi': ['error', 'always', { omitLastInOneLineBlock: true }],
			'@stylistic/comma-dangle': ['error', 'never'],
			'@stylistic/quotes': ['error', 'single'],
			'@stylistic/indent': ['error', 'tab'],

			// Не-стилистические правила остаются без префикса
			'prefer-template': ['error'],
			'prefer-arrow-callback': ['error'],
			'consistent-return': 'error'
		}
	},

	globalIgnores([
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts'
	])
]);

export default eslintConfig;