
# UNDP Transparency Portal


## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)


## About The Project

In UNDP, we are committed to eradicating poverty, fighting climate change and reducing inequalities and exclusion around the world. Discover how, with the help of our partners, we work day to day to make this a reality

### Built With

* [preact-cli](https://github.com/developit/preact-cli)
* [Node.js](https://nodejs.org/en/)
* [d3.js](https://d3js.org/)
* [Sass.js](https://sass-lang.com/)
* [Leaflet](https://leafletjs.com/)
* [Bootstrap](https://getbootstrap.com)


## Getting Started

Instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

List of things needs to use the software and how to install them.
* [Node.js](https://nodejs.org/en/) version 6.x or greater.

### Installation

1. Clone the repo
```sh
git clone https://github.com/undp/transparencyportal.git
```
2. Move to undp-transparency-portal-fe folder.
```sh
cd undp-transparency-portal-fe
```

3. Enter your api base url in [Api.js](https://github.com/undp/transparencyportal/blob/master/undp-transparency-portal-fe/src/lib/api.js#L88).
```JS
  static API_BASE = 'API_BASE_URL';
```

4. Enter your [Leaflet](http://leafletjs.com) map key in [Api.js](https://github.com/undp/transparencyportal/blob/master/undp-transparency-portal-fe/src/lib/api.js#L97).
```JS
  static MAP_API_KEY = 'MAP_API_KEY';
```

5. Enter your [Google Analytics](https://analytics.google.com/analytics/web/) key in [Api.js](https://github.com/undp/transparencyportal/blob/master/undp-transparency-portal-fe/src/lib/api.js#L94).
```JS
  static GA_TRACKING_ID = 'GA_TRACKING_ID';
```
6. Enter your CDN base url for static files in [Api.js](https://github.com/undp/transparencyportal/blob/master/undp-transparency-portal-fe/src/lib/api.js#L90)(otherwise static files will be loaded from local assets folder).
```JS
  static S3_BASE_URL = 'S3_BASE_URL';
```

7. Install NPM packages
```sh
npm install
```
#### To run a local copy

1. Serve with hot reload at localhost:8080

```sh
npm run dev
```
2. Test the production build locally

```sh
npm run serve
```
#### Build for production with minification

```sh
preact build --no-prerender
```
Note: If you are loading static assets from CDN, set [publicPath](https://github.com/undp/transparencyportal/blob/master/undp-transparency-portal-fe/preact.config.js#L15) before taking production build.

```JS
  config.output.publicPath = 'CDN_ASSETS_PATH';
```
