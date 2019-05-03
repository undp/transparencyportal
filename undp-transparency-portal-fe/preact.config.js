
const preactCliSwPrecachePlugin = require('preact-cli-sw-precache');

export default function (config) {
  const precacheConfig = {
    staticFileGlobs: [

    ],
    stripPrefix: 'app/',
    runtimeCaching: [{
      urlPattern: /\/Training\//,
      handler: 'networkFirst'
    }]
  };
  //config.output.publicPath = '';
  return preactCliSwPrecachePlugin(config, precacheConfig);
}