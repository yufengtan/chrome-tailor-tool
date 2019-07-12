+(($) => {
    $(document).ready(function () {
        let admin = chrome.extension.getBackgroundPage()
        $('input[name=engine]').val(admin.TailorEngine.engine)
        $('.sure').click(function () {
            let val = $('input[name=engine]').val()
            let urlRegExp = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/
            if (!urlRegExp.exec(val)) {
                return alert('请输入合法的裁制引擎地址')
            }
            admin.TailorEngine.setEngine(val)
            window.close()
        })
    })
})(jQuery)