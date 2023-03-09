const CracoLessPlugin = require('craco-less');

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
            // modifyVars,
          }
        }
      },
    },
  ],
  webpack: {
    // This webpack config is for React 17. May consider removing once upgrade to React 18
    // configure: {
    //   resolve: {
    //     fallback: {
    //       'react/jsx-runtime': 'react/jsx-runtime.js',
    //       'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
    //     },
    //   },
    // }
    plugins: [],
    configure: webpackConfig => {
      webpackConfig.module.rules.push({
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          { loader: "babel-loader", options: { cacheDirectory: true } },
          { loader: "react-hot-loader/webpack" },
        ],
      });
      return webpackConfig;
    },
  },
  babel: {
    presets: ["@babel/preset-env", "@babel/preset-react"],
  },
};