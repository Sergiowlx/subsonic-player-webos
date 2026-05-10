module.exports = {
  '*.{css,vue}': 'stylelint',
  '*.{json,ts,vue}': 'eslint',
  '*.{ts,vue}': () => ['yarn check-types', 'npx vitest --run --coverage=false'],
};
