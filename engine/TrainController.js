const puppeteer = require('puppeteer')

const delay = time => new Promise(resolve => setTimeout(resolve, time))

module.exports = (req, res, next) => {
    let {
        uri,
        sellector,
    } = req.query
    if (uri && sellector) {
        puppeteer.launch({
            headless: true,
            defaultViewport: {
                width: 1920,
                height: 1080
            }
        }).then(async browser => {
            const page = await browser.newPage()
            page.on('console', async msg => {
                for (let i = 0; i < msg.args().length; ++i) {
                    console.log(`${i}: ${msg.args()[i]}`)
                }
            })
            await page.goto(unescape(uri), {
                timeout: 0
            })
            let hasJQ = await page.evaluate(async (sellector) => {
                return !!window.jQuery
            })
            if (!hasJQ) {
                await page.addScriptTag({
                    url: 'https://code.jquery.com/jquery-3.4.1.min.js'
                })
            }
            let html = await page.evaluate(async (sellector) => {
                return Array.prototype.map.call($(sellector), el => $(el).prop('outerHTML'))
            }, unescape(sellector))
            await browser.close()
            res.json({
                success: 0,
                html
            })
        }).catch(error => {
            res.json({
                success: 1,
                error
            })
        })
    }
}