const webpack = require('webpack');
module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        const fallback = webpackConfig.resolve.fallback || {};
        Object.assign(fallback, { 
            "fs": require.resolve("browserify-fs"), 
            "stream": require.resolve("stream-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            util: require.resolve('util/'),
            url: require.resolve('url'),
            assert: require.resolve('assert'),
            buffer: require.resolve('buffer'),
          });
          webpackConfig.resolve.fallback = fallback; 
        const wasmExtensionRegExp = /\.wasm$/;
        webpackConfig.resolve.extensions.push(".wasm");
        webpackConfig.experiments = {
          asyncWebAssembly: true,
        };
        webpackConfig.module.rules.forEach((rule) => {
          (rule.oneOf || []).forEach((oneOf) => {
            if (oneOf.type === "asset/resource") {
              oneOf.exclude.push(wasmExtensionRegExp);
            }
          });
        });
        webpackConfig.plugins.push(
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            }),
        );
        
  
        return webpackConfig;
      },
    },
  };

   
