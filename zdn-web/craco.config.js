const { getThemeVariables } = require('antd/dist/theme');
const CracoLessPlugin = require('craco-less');

const darkTheme = getThemeVariables({
  dark: false, // Enable dark mode
  compact: false, // Enable compact mode
});

const modifyVars = {
  ...darkTheme,
  '@primary-color': '#13c2c2', // rgb(19,194,194)
  '@info-color': '#13c2c2',
  '@link-color': '#13c2c2',
  '@success-color': '#13c2c2',
  '@font-size-base': '14px',
  '@table-font-size': '12px',
  '@layout-header-background': '#002329',
  // '@height-base': '32px',
  // '@height-lg': '40px',
  // '@height-sm': '24px',
  '@border-radius-base': '4px',
  // '@font-family': "'klavika', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
  // '@table-padding-vertical': '4px',
  // '@table-padding-horizontal': '4px',
  '@heading-1-size': 'ceil(@font-size-base * 2.0)',
  '@heading-2-size': 'ceil(@font-size-base * 1.8)',
  '@heading-3-size': 'ceil(@font-size-base * 1.6)',
  '@heading-4-size': 'ceil(@font-size-base * 1.4)',
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