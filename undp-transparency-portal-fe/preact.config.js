
const preactCliSwPrecachePlugin = require('preact-cli-sw-precache');

export default function (config) {
	const precacheConfig = {
		staticFileGlobs: [],
		stripPrefix: 'app/',
		runtimeCaching: [{
			urlPattern: /\/Training\//,
			handler: 'networkFirst'
		}]
	};
	config.output.publicPath = 'https://d296gbxh4k2cui.cloudfront.net/build/';
	return preactCliSwPrecachePlugin(config, precacheConfig);
}