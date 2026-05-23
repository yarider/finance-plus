// Тут підключається ESLint для Expo, щоб він перевіряв код і підсвічував помилки в стилі або синтаксисі.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
