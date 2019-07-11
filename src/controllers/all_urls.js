+(($) => {
    let that = null
    let lock = false
    $(document).keydown(function (event) {
        let { keyCode } = event
        // console.log(keyCode)
        if (keyCode === 68) {
            chrome.runtime.sendMessage({
                type: 'lock/lock'
            })
            lock = true
        }
        if (keyCode === 69) {
            chrome.runtime.sendMessage({
                type: 'lock/open'
            })
            lock = false
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

    function Highlight(target) {
        let self = $(target)
        $('.tailor-btns').remove()
        $('.tailor-hover').removeClass('tailor-hover')
        $('.tailor-current').removeClass('tailor-current')
        // $('.tailor-hover-parent').removeClass('tailor-hover-parent')
        self.addClass('tailor-hover')
        // self.parent().addClass('tailor-hover-parent')
        $('body').attr('data-class', (() => {
            let parents = self.parents()
            Array.prototype.unshift.call(parents, target)
            let sellectors = Array.prototype.map.call(parents, item => {
                let tagName = item.tagName.toLowerCase()
                let className = item.className.replace(/ {0,1}tailor\-hover(\-parent){0,1}/, '').trim()
                if (item.id) {
                    return tagName + '#' + item.id
                } else if (className) {
                    return tagName + '.' + className.replace(/ /mg, '.')
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
                return $('<div class="tailor-btn">').text(item).click(function () {
                    let n = sellectors.length
                    if (index < 2) {
                        return false
                    }
                    if (index === n) {
                        return false
                    }
                    let target = (() => {
                        let parent = current
                        for (let i = 0; i < n - (index + 1); i++) {
                            parent = parent.parent()
                        }
                        return parent
                    })()
                    Highlight(target[0])
                })
            }), $('<div class="tailor-info">').text(`${len > 1 ? `List<${eq}, ${len}>` : 'Single'}`)))
            return sellector
        })())
        that = target
    }
})(jQuery)