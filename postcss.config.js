/* eslint-disable global-require */
module.exports = {
  map: { inline: false },
  plugins: [
    require('postcss-bem-linter')({ preset: 'suit' }),
    require('postcss-import')({ glob: true }),
    require('postcss-clean')(),
  ]
};
