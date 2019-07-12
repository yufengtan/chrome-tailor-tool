+(($) => {
    chrome.runtime.onMessage.addListener(message => {
        let {
            type,
            ...opts
        } = message
        if (type === 'piece/results') {
            let iframe = $('<iframe name="piece" src="/piece">')
            iframe.css({
                border: 'none',
                outline: 'none',
                width: '100%',
                height: '100%'
            }).on('load', function () {
                let d = window.frames['piece'].document
                d.open()
                d.write(opts.html.join(''))
                d.close()
            })
            $('body').append($('<div class="tailor-piece">').append(iframe))
        }
    })
    let that = null
    let lock = true
    let helpText = '按下键盘 “E” 键开始锁定切片坐标，按下键盘 “D” 键暂停锁定切片坐标，按下键盘 “H” 键提示操作，按下键盘 “ESC” 键退出锁定切片坐标，点击插件图标设置切片训练引擎地址。'
    $(document).ready(function () {
        $('body').attr('data-class', `该页面已被裁制工具接管，${helpText}`)
    })
    $(document).keydown(function (event) {
        let { keyCode } = event
        console.log(keyCode)
        if (keyCode === 68) {
            chrome.runtime.sendMessage({
                type: 'lock/lock'
            })
            lock = true
        }
        if (keyCode === 72) {
            chrome.runtime.sendMessage({
                type: 'notice/info',
                message: helpText
            })
        }
        if (keyCode === 69) {
            chrome.runtime.sendMessage({
                type: 'lock/open'
            })
            lock = false
        }
        if (keyCode === 27) {
            chrome.runtime.sendMessage({
                type: 'lock/clear'
            })
            clear()
            lock = true
        }
    })

    $('body *').not('script').mousemove(function (e) {
        e.stopPropagation()
        if (lock) {
            return false
        }
        if (that === this) {
            return true
        }
        Highlight(this)
    })

    function clear() {
        $('.tailor-btns').remove()
        $('.tailor-piece').remove()
        $('.tailor-hover').removeClass('tailor-hover')
        $('.tailor-current').removeClass('tailor-current')
        $('body').removeAttr('data-class')
    }

    function Highlight(target) {
        let self = $(target)
        clear()
        // $('.tailor-btns').remove()
        // $('.tailor-hover').removeClass('tailor-hover')
        // $('.tailor-current').removeClass('tailor-current')
        self.addClass('tailor-hover')
        $('body').attr('data-class', (() => {
            let parents = self.parents()
            Array.prototype.unshift.call(parents, target)
            let sellectors = Array.prototype.map.call(parents, item => {
                let tagName = item.tagName.toLowerCase()
                let className = item.className.replace(/ {0,1}tailor\-hover(\-parent){0,1}/, '').trim()
                if (item.id) {
                    return tagName + '#' + item.id
                } else if (className) {
                    return tagName + '.' + className.replace(/ {1,}/mg, '.')
                } else {
                    return tagName
                }
            }).reverse()
            let sellector = sellectors.reduce((all, n) => all += (' ' + n))
            console.log('origin sellector :', sellector)
            sellector = (() => {
                let index = sellector.lastIndexOf('#')
                if (index !== -1) {
                    return sellector.substring(sellector.substring(0, index).lastIndexOf(' '))
                }
                return sellector
            })()
            console.log('single sellector :', sellector)
            let collections = $(sellector)
            collections.addClass('tailor-hover')
            let len = collections.length
            let eq = 0
            len > 1 && (() => {
                for (let i = 0; i < len; i++) {
                    if (target === collections[i]) {
                        sellector += `:eq(${i})`
                        eq = i
                        break
                    }
                }
            })()
            console.log('finally sellector :', sellector)
            let current = $(sellector)
            current.addClass('tailor-current')
            $('body').append($('<div class="tailor-btns">').append(sellectors.map((item, index) => {
                let n = sellectors.length
                let target = (() => {
                    let parent = current
                    for (let i = 0; i < n - (index + 1); i++) {
                        parent = parent.parent()
                    }
                    return parent
                })()
                return $('<div class="tailor-btn">').text(item).click(function () {
                    if (index < 2) {
                        return false
                    }
                    if (index === n) {
                        return false
                    }
                    Highlight(target[0])
                }).hover(function () {
                    target.attr('tailor-focus', true)
                }, function () {
                    target.removeAttr('tailor-focus')
                })
            }), $('<div class="tailor-info">').text(`${len > 1 ? `List<${eq + 1}, ${len}>` : 'Single'}`), $('<div class="tailor-train">').text('训练').click(function () {
                if (len > 1) {
                    let answer = window.prompt('输入list开始训练list切片，输入single开始训练single切片。') || ''
                    if (answer.toLowerCase().startsWith('l')) {
                        chrome.runtime.sendMessage({
                            type: 'piece/train',
                            sellector: sellector.substring(0, sellector.lastIndexOf(':')),
                            uri: window.location.href
                        })
                    }
                    if (answer.toLowerCase().startsWith('s')) {
                        chrome.runtime.sendMessage({
                            type: 'piece/train',
                            sellector,
                            uri: window.location.href
                        })
                    }
                } else {
                    if (window.confirm('开始训练single切片。')) {
                        chrome.runtime.sendMessage({
                            type: 'piece/train',
                            sellector,
                            uri: window.location.href
                        })
                    }
                }
            })))
            return sellector
        })())
        that = target
    }
})(jQuery)