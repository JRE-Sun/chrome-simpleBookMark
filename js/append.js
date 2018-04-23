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

        var isMouseDown   = false,
            startPosition = {},
            endPosition   = {},
            isRight       = false,
            isBottom      = false;

        document.addEventListener('mousemove', function (ev) {
            if (!isMouseDown) {
                return;
            }
            console.log(1);
        }, false);
        document.addEventListener('mousedown', function (e) {
            if (e.button != 2) {
                return;
            }
            startPosition = {
                x: e.clientX,
                y: e.clientY,
            }
            isMouseDown   = true;
        }, false);

        function removeContextmenu(e) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }

        document.addEventListener('mouseup', function (e) {
            if (e.button != 2) {
                return;
            }
            endPosition = {
                x: e.clientX,
                y: e.clientY,
            }
            isMouseDown = false;
            // 向右
            if (endPosition.x - startPosition.x > 100) {
                isRight = true;
            }
            // 向下
            if (endPosition.y - startPosition.y > 50) {
                isBottom = true;
            }
            if (!isBottom && !isRight) {
                document.removeEventListener('contextmenu', removeContextmenu, false);
                return;
            }
            document.addEventListener('contextmenu', removeContextmenu, false);
            chrome.extension.sendRequest({
                event: isBottom && isRight ? 'close' : 'update',
                url  : location.href
            }, function (response) {
                if (!response) {
                    return;
                }
                if (response.event == 'update') {
                    location.href = location.href;
                }
            });
            isBottom = isRight = false;
            e.stopPropagation();
            e.preventDefault();
            return false;
        }, false);
    })();
};