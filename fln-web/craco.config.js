const { getThemeVariables } = require('antd/dist/theme');
const CracoLessPlugin = require('craco-less');

const darkTheme = getThemeVariables({
  dark: false, // Enable dark mode
  compact: false, // Enable compact mode
});

const modifyVars = {
  ...darkTheme,
  '@primary-color': '#22075e',
  '@info-color': '#18b0d7',
  '@link-color': '#22075e',
  // '@font-size-base': '14px',
  // '@height-base': '32px',
  // '@height-lg': '40px',
  // '@height-sm': '24px',
  '@border-radius-base': '6px',
  // '@table-padding-vertical': '4px',
  // '@table-padding-horizontal': '4px',
  // '@heading-1-size': 'ceil(@font-size-base * 2.0)',
  // '@heading-2-size': 'ceil(@font-size-base * 1.8)',
  // '@heading-3-size': 'ceil(@font-size-base * 1.6)',
  // '@heading-4-size': 'ceil(@font-size-base * 1.4)',
};

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          // javascriptEnabled: true,
          // modifyVars,
          lessOptions: {
            javascriptEnabled: true,
            modifyVars,
          }
        }
      },
    },
  ],
};