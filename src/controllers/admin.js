+((w) => {
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
            this.engine = ''
        }
        setEngine(url) {
            console.log('setEngine : ', url)
            notification('设置裁制引擎地址成功', url)
            this.engine = url
        }
    }

    function notification(title, message, delay) {
        notificationTimer && window.clearTimeout(notificationTimer)
        chrome.notifications.create('tips', {
            type: 'basic',
            title,
            iconUrl: '../../public/images/icon.png',
            message
        })
        notificationTimer = window.setTimeout(() => {
            chrome.notifications.clear('tips')
        }, delay || 1e3)
    }
    const reducers = {
        lock: {
            lock() {
                notification('裁制状态切换', 'Hover 关闭')
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
})(window)