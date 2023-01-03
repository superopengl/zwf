const { theme } = require('antd');
const CracoLessPlugin = require('craco-less');
const { defaultAlgorithm, defaultSeed } = theme;

const mapToken = defaultAlgorithm(defaultSeed);

/**
 * https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
 */

const modifyVars = {
  ...mapToken,
  '@primary-color': '#0FBFC4',// '#0FBFC4', // rgb(19,194,194)
  '@info-color': '#0FBFC4',
  '@warning-color': '#F7BA1E',
  '@link-color': '#0FBFC4',
  '@success-color': '#00B42A',
  '@error-color': '#F53F3F',
  // '@highlight-color': '#cf222e',
  '@font-size-base': '14px',
  '@table-font-size': '12px',
  '@layout-body-background': '#ffffff',
  '@layout-header-background': '#ffffff',
  '@layout-sider-background-light': '#F1F2F5',
  '@label-color': '#97A3B7',
  '@btn-font-size-lg': '14px',
  '@height-base': '32px',
  '@height-lg': '40px',
  '@height-sm': '28px',
  '@border-radius-base': '4px',
  '@text-color': '#4B5B76',
  '@text-color-secondary': '#97A3B7',
  '@font-family': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
  // '@table-padding-vertical': '4px',
  // '@table-padding-horizontal': '4px',
  '@typography-title-font-weight': 800,
  '@heading-color': '#1C222B',
  '@heading-1-size': '32px',
  '@heading-2-size': '28px',
  '@heading-3-size': '22px',
  '@heading-4-size': '18px',
  '@divider-color': '#E3E6EB',
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