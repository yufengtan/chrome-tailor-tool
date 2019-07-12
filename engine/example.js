const puppeteer = require('puppeteer')
const delay = time => new Promise(resolve => setTimeout(resolve, time))
puppeteer.launch({
    headless: false,
    defaultViewport: {
        width: 1920,
        height: 10000
    }
}).then(async browser => {
    const page = await browser.newPage()
    page.on('console', async msg => {
        for (let i = 0; i < msg.args().length; ++i) {
            console.log(`${i}: ${msg.args()[i]}`)
            if (i === 1 && `${msg.args()[i]}` === 'JSHandle:71') {
                await page.evaluate(() => {
                    jQuery.fn.extend({
                        data: function () {
                            if (this.length == 0) {
                                return this;
                            }
                            var len = this.length;
                            if (len > 1) {
                                var result = [];
                                this.each(function () {
                                    result.push(jQuery(this).data());
                                });
                                return result;
                            }
                            var el = this[0];
                            var data = {};
                            data.__proto__ = {
                                tagName: el.tagName,
                                nodeType: el.nodeType,
                                html: el.outerHTML,
                                text: el.innerText
                            };
                            if (data.tagName == 'SCRIPT') {
                                return data;
                            }
                            var attrList = (function (html) {
                                var arr = [];
                                var infoMsg = html.match(/^\<.*?\>/mg)[0];
                                var sourceArr = infoMsg.match(/\s[^\s]*?\=/mg) || [];
                                sourceArr.forEach(function (a, b, c) {
                                    arr.push(a.replace('=', '').trim());
                                });
                                return arr;
                            })(el.outerHTML);
                            var self = this.eq(0);
                            attrList.forEach(function (a, b, c) {
                                data[a] = self.attr(a);
                            });
                            jQuery.extend(data, (function (child) {
                                var obj = {};
                                var plainText = '';
                                var subordinate = [];
                                var len = child.length;
                                for (var i = 0; i < len; i++) {
                                    if (child[i].nodeType == 3) {
                                        plainText += child[i].nodeValue.trim();
                                    } else if (child[i].nodeType == 1) {
                                        subordinate.push(jQuery(child[i]).data());
                                    }
                                };
                                if (!subordinate.length) {
                                    return {
                                        plainText: plainText
                                    }
                                };
                                return {
                                    plainText: plainText,
                                    subordinate: subordinate
                                };
                            })(el.childNodes), {
                                    createTime: jQuery.now()
                                });
                            return data;
                        }
                    })
                })
                await page.evaluate(() => {
                    $('.ga-model-browser').click()
                })
                await delay(1000)
                await page.evaluate(() => {
                    $('.collapsed lmvheader>icon').click()
                    console.log('-->')
                })
                await delay(1000)
                await page.evaluate(() => {
                    $('.collapsed lmvheader>icon').click()
                    console.log('-->')
                })
                await delay(1000)
                await page.evaluate(() => {
                    $('.collapsed lmvheader>icon').click()
                    console.log('-->')
                })
                await delay(1000)
                await page.evaluate(() => {
                    $('.collapsed lmvheader>icon').click()
                    console.log('-->')
                })
                let dimensions = await page.evaluate(async () => {
                    let list = []
                    $('lmvheader').each((index, el) => {
                        list.push({
                            index,
                            text: el.innerText,
                            style: el.style.paddingLeft
                        })
                    })
                    return list
                })
                console.log(dimensions)
                await page.screenshot({
                    path: 'example.png'
                })
            }
        }
    })
    await page.goto('https://viewer.autodesk.com/id/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YTM2MHZpZXdlci90MTU2MTUzODMxOTI1M18wNTUzMjk2MTQ0MjMzODY2XzE1NjE1MzgzMjAxMjAucnZ0', {
        timeout: 0
    })
    // await browser.close()
})