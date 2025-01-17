import antfu from '@antfu/eslint-config';
import drizzle from 'eslint-plugin-drizzle';

export default antfu(
  {},
  {
    files: ['**/*.js', '**/*.ts'],
    plugins: {
      drizzle,
    },
    rules: {
      'style/semi': 'off',
      'antfu/consistent-list-newline': 'off',
      'node/prefer-global/process': 'off',
      'style/no-multiple-empty-lines': 'off',
      'style/arrow-parens': 'off',
      'style/member-delimiter-style': 'off',
      'style/brace-style': 'off',
    },
  },
);
