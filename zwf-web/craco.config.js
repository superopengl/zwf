const { getThemeVariables } = require('antd/dist/theme');
const CracoLessPlugin = require('craco-less');

const darkTheme = getThemeVariables({
  dark: false, // Enable dark mode
  compact: false, // Enable compact mode
});

/**
 * https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
 */

const modifyVars = {
  ...darkTheme,
  '@primary-color': '#37AFD2',// '#37AFD2', // rgb(19,194,194)
  '@info-color': '#37AFD2',
  '@warning-color': '#ffc53d',
  '@link-color': '#37AFD2',
  '@success-color': '#52c41a',
  '@error-color': '#cf222e',
  '@highlight-color': '#cf222e',
  '@font-size-base': '14px',
  '@table-font-size': '12px',
  '@layout-header-background': '#062638',
  '@heading-color': '#062638',
  '@label-color': '#00232988',
  '@btn-font-size-sm': '12px',
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
  webpack: {
    // This webpack config is for React 17. May consider removing once upgrade to React 18
    configure: {
      resolve: {
        fallback: {
          'react/jsx-runtime': 'react/jsx-runtime.js',
          'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
        },
      },
    }
  }
};