const browserPagePool = require('./services/browserPagePool');
const express = require('express');
const app = express();
const path = require('path')
const puppeteer = require('puppeteer');
const ua = require("useragent");
const compression = require('compression')

function isBot(userAgent) {
    const agent = ua.is(userAgent);
    return !agent.webkit && !agent.opera && !agent.ie &&
        !agent.chrome && !agent.safari && !agent.mobile_safari &&
        !agent.firefox && !agent.mozilla && !agent.android;
}
const RENDER_CACHE = new Map();
async function renderPage(req, res) {  
    let currentTime = new Date;
    if (RENDER_CACHE.has(req.originalUrl) && (currentTime.getDate() - RENDER_CACHE.get(req.originalUrl).time.getDate()) < 30) {
        res.send(RENDER_CACHE.get(req.originalUrl).html);
    }
    else {
        try {
            const page = await browserPagePool.acquire();
            await page.setRequestInterception(true);
            // we need to override the headless Chrome user agent since its default one is still considered as "bot"
            await page.setUserAgent('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36');
            page.on('request', req => {
                // 2. Ignore requests for resources that don't produce DOM
                // (images, stylesheets, media).
                const whitelist = ['document', 'script', 'xhr', 'fetch'];
                if (!whitelist.includes(req.resourceType())) {
                  return req.abort();
                }
                const blacklist = ['www.google-analytics.com', '/gtag/js', 'ga.js', 'analytics.js'];
                if (blacklist.find(regex => req.url().match(regex))) {
                    return req.abort();
                }
            
                // 3. Pass through all other requests.
                req.continue();
            });
            const local_url = 'https://open.undp.org'+ req.originalUrl;
            await page.goto(local_url, {
                waitUntil: 'networkidle0',
            });
            const html = await page.content();
            RENDER_CACHE.set(req.originalUrl, {html: html, time: new Date});            
            res.send(html);
            await browserPagePool.release(page);   
        } catch(e) {
            res.send("Something happened");
            console.log(e)
        }
    }

    // if (RENDER_CACHE.has(req.originalUrl)) {
    //     res.send(RENDER_CACHE.get(req.originalUrl));
    // }
    // else {
    //     try {
    //         const browser = await puppeteer.launch();
    //         const page = await browser.newPage();
            
    //         // we need to override the headless Chrome user agent since its default one is still considered as "bot"
    //         await page.setUserAgent('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36');
    
    //         const local_url = 'http://' + req.hostname + '' + req.originalUrl;
    //         await page.goto(local_url, {
    //             waitUntil: "networkidle0",
    //         });
    //         const html = await page.content();
    //         RENDER_CACHE.set(req.originalUrl, html);            
    //         res.send(html);
    //         await browser.close();
    
    //     } catch(e) {
    //         res.send("ERROR");
    //     }
    // }
}
    // try {
    //     const browser = await puppeteer.launch();
    //     const page = await browser.newPage();
        
    //     // we need to override the headless Chrome user agent since its default one is still considered as "bot"
    //     await page.setUserAgent('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36');

    //     const local_url = 'http://' + req.hostname + '' + req.originalUrl;
    //     await page.goto(local_url, {
    //         waitUntil: "networkidle0",
    //     });
    //     const html = await page.content();  
    //     res.send(html);
    //     await browser.close();
    // } catch(e) {
    //     res.send("ERROR");
    // }

const react_build_dir = './build'; // this variable refers to directory where our client-side React is built
const {port=8080} = process.env;
app.use(compression())
    .use(express.static(react_build_dir, {index: '_'})); // this is to allow browser download the static files of the React app (CSS, JS, images).
    app.get('/Training*', function (req, res)  {
    });
    app.get('*', async (req, res) => {
        if (!isBot(req.headers['user-agent']))  {
            res.sendFile(path.join(__dirname,react_build_dir + '/index.html')); // this is a human, send the HTML right away
        } else {
            renderPage(req, res)
        }
    });
    app.listen(port,'0.0.0.0', () => {
   
});