window.onload = function () {
    (function () {
        function iGetInnerText(testStr) {
            var resultStr = testStr.replace(/\ +/g, ""); // 去掉空格
            resultStr     = testStr.replace(/[ ]/g, "");    // 去掉空格
            resultStr     = testStr.replace(/[\r\n]/g, ""); // 去掉回车换行
            resultStr     = testStr.replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g, ""); // 去掉注释
            return resultStr;
        }


        chrome.storage.local.get('value', function (valueArray) {
            var style       = document.createElement('style');
            style.innerText = iGetInnerText(valueArray.value);
            document.body.appendChild(style);
        });
    })();
};