+((w, $) => {
    let notificationTimer = null

    Promise.try = async function (handler) {
        try {
            if (handler.toString().trim().startsWith('async')) {
                let res = await handler()
                return Promise.resolve(res)
            }
            return Promise.resolve(handler())
        } catch (e) {
            return Promise.reject(e)
        }
    }

    class TailorEngine {
        constructor() {
            this.engine = 'http://127.0.0.1:8100'
        }
        setEngine(url) {
            console.log('setEngine : ', url)
            this.test(url).then(succ => {
                if (!succ) {
                    notification('设置切片训练引擎地址失败', '引擎地址未响应', 5e3, 'notice')
                } else {
                    notification('设置切片训练引擎地址成功', url, 5e3, 'notice')
                    this.engine = url
                }
            }).catch(error => {
                notification('设置切片训练引擎地址失败', '引擎地址未响应', 5e3, 'notice')
            })
        }
        train({ uri, sellector }) {
            $.get(`${this.engine}/train?uri=${escape(uri)}&sellector=${escape(sellector)}`).done(data => {
                let {
                    success,
                    html,
                    error
                } = data
                if (success === 0) {
                    getCurrentTabId().then(id => {
                        id && chrome.tabs.sendMessage(id, {
                            type: 'piece/results',
                            html
                        })
                    })
                    notification('训练成功', JSON.stringify(html), 5e3, 'response')
                } else {
                    notification('训练失败', error.message, 5e3, 'response')
                }
            })
        }
        test(url) {
            return new Promise((resolve, reject) => {
                try {
                    $.get(url).done(data => {
                        if (data.success === 0) {
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    }).catch(reject)
                } catch (e) {
                    reject(e)
                }
            })

        }
    }

    function notification(title, message, delay = 0, id) {
        notificationTimer && w.clearTimeout(notificationTimer)
        chrome.notifications.create(id || 'tips', {
            type: 'basic',
            title,
            iconUrl: '../../public/images/icon.png',
            message
        })
        notificationTimer = w.setTimeout(() => {
            chrome.notifications.clear('tips')
        }, delay || 1e3)
    }
    const reducers = {
        lock: {
            lock() {
                notification('裁制状态切换', 'Hover 暂停')
                // getCurrentTabId().then(tabid => {
                //     console.log(tabid)
                //     tabid && chrome.pageAction.hide(tabid)
                // })
            },
            open() {
                notification('裁制状态切换', 'Hover 打开')
                // getCurrentTabId().then(tabid => {
                //     console.log(tabid)
                //     tabid && chrome.pageAction.show(tabid)
                // })
            },
            clear() {
                notification('裁制状态切换', 'Hover 退出')
            }
        },
        notice: {
            info({ message }) {
                notification('提示', message, 5e3, 'notice')
            }
        },
        piece: {
            train({ sellector, uri }) {
                if (!w['TailorEngine'].engine) {
                    return notification('提示', '未设置切片训练引擎，请先点击插件图标设置', 3e3, 'tips')
                }
                w['TailorEngine'].train({ uri, sellector })
                // notification('切片训练', `${uri} : ${sellector}`, 3e3, 'piece')
            }
        }
    }

    function getCurrentTabId() {
        return new Promise(resolve => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                resolve(tabs && tabs[0].id || null)
            })
        })
    }

    chrome.runtime.onMessage.addListener(message => {
        Promise.try(async () => {
            let {
                type,
                ...opts
            } = message
            let [reduce, fun] = type.split('/')
            if (reducers.hasOwnProperty(reduce) && typeof reducers[reduce][fun] === 'function') {
                await reducers[reduce][fun](opts)
            } else {
                console.log('垃圾消息，丢弃', message)
            }
        }).catch(console.error)
    })

    w['TailorEngine'] = new TailorEngine
})(window, jQuery)