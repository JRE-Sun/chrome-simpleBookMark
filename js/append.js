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
    (function () {
        var isMouseDown   = false,
            startPosition = {},
            endPosition   = {},
            isRight       = false,
            isBottom      = false,
            timer         = null,
            body          = document.querySelector('body'),
            fixedDiv      = document.createElement('div'),
            appendContent = document.createElement('div');

        fixedDiv.style.cssText      = 'z-index:9999999;position:fixed;left:0;right:0;top:0;bottom:0;background:transparent;';
        appendContent.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:5px;background:#333;display: flex;padding: 10px;align-items: center;justify-content: center;';
        fixedDiv.appendChild(appendContent);
        body.appendChild(fixedDiv);
        fixedDiv.style.display = 'none';
        document.addEventListener('mousemove', function (e) {
            if (e.buttons == 2) {
                if (isRight || isBottom) {
                    fixedDiv.style.display = 'block';
                }
                endPosition = {
                    x: e.clientX,
                    y: e.clientY,
                }
                isMouseDown = false;
                // 向右
                if (endPosition.x - startPosition.x > 50 && !isRight) {
                    var img = document.createElement('img');
                    img.src = chrome.extension.getURL('img/right.png');
                    appendContent.appendChild(img);
                    isRight = true;
                }
                // 向下
                if (endPosition.y - startPosition.y > 50 && !isBottom) {
                    var img = document.createElement('img');
                    img.src = chrome.extension.getURL('img/down.png');
                    appendContent.appendChild(img);
                    isBottom = true;
                }
                clearTimeout(timer);
                timer = setTimeout(function () {
                    mouseUpEvent();
                }, 2400);
            }
        }, false);
        document.addEventListener('mousedown', function (e) {
            if (e.button != 2) {
                isMouseDown = false;
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

        function mouseUpEvent() {
            fixedDiv.style.display = 'none';
            // 同时为假,直接return
            if (!isBottom && !isRight) {
                return;
            }
            document.addEventListener('contextmenu', removeContextmenu, false);
            chrome.extension.sendRequest({
                event: isBottom && isRight ? 'close' : 'update',
                url  : location.href
            }, function (response) {
                appendContent.innerHTML = '';
                fixedDiv.style.display  = 'none';
                if (!response) {
                    return;
                }
                if (response.event == 'update') {
                    location.href = location.href;
                    document.removeEventListener('contextmenu', removeContextmenu, false);
                }
            });
            isBottom = isRight = false;
        }

        document.addEventListener('mouseup', function (e) {
            if (e.button != 2) {
                return;
            }
            mouseUpEvent();
            e.stopPropagation();
            e.preventDefault();
            return false;
        }, false);
    })();
};