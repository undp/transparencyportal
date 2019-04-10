Codebase for UNDP Transparency Portal Front-End code
## CLI Commands

``` bash
#Prerequisite
Node.js > V6.x

# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# test the production build locally
npm run serve

# build
preact build --no-prerender
```
In case you would need to rollout similar portal for another dataset - Change API_BASE url in [api.js](https://github.com/undp/transparencyportal/blob/master/undp-transparency-portal-fe/src/lib/api.js#L86)

For detailed explanation on how things work, checkout the [CLI Readme](https://github.com/developit/preact-cli/blob/master/README.md).