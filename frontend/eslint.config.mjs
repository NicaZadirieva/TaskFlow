import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...{
		rules: {
			'semi': ['error', 'always',
				{
					'omitLastInOneLineBlock': false
				}],
			'comma-dangle': ['error', 'never'],
			'quotes': ['error', 'single'],
			'indent': ['error', 'tab'],
			//Ошибка, если используется конкатенация строк вместо шаблонных литералов.
			'prefer-template': ['error'],
			//Ошибка, если в качестве коллбека используется не стрелочная функция.
			'prefer-arrow-callback': ['error'],
			//Ошибка, если в одном из ветвлений функция возвращает значение, а в другом нет.
			'consistent-return': 'error'
		}
	},
	...nextVitals,
	...nextTs,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts'
	])
  
]);

export default eslintConfig;
