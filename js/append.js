(function () {
    var ie  = !!(window.attachEvent && !window.opera);
    var wk  = /webkit\/(\d+)/i.test(navigator.userAgent) && (RegExp.$1 < 525);
    var fn  = [];
    var run = function () {
        for (var i = 0; i < fn.length; i++) fn[i]();
    };
    var d   = document;
    d.ready = function (f) {
        if (!ie && !wk && d.addEventListener)
            return d.addEventListener('DOMContentLoaded', f, false);
        if (fn.push(f) > 1) return;
        if (ie)
            (function () {
                try {
                    d.documentElement.doScroll('left');
                    run();
                }
                catch (err) {
                    setTimeout(arguments.callee, 0);
                }
            })();
        else if (wk)
            var t = setInterval(function () {
                if (/^(loaded|complete)$/.test(d.readyState))
                    clearInterval(t), run();
            }, 0);
    };
})();


document.ready(function () {
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
        var rightImg                = document.createElement('img');
        rightImg.src                = chrome.extension.getURL('img/right.png');
        var leftImg                 = document.createElement('img');
        leftImg.src                 = chrome.extension.getURL('img/down.png');
        rightImg.style.display      = 'none';
        leftImg.style.display       = 'none';
        appendContent.appendChild(leftImg);
        appendContent.appendChild(rightImg);
        fixedDiv.appendChild(appendContent);
        body.appendChild(fixedDiv);
        fixedDiv.style.display = 'none';

        function detectOS() {
            var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
            if (isMac) {
                return "Mac";
            }
            return 'other';
        }

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
                if (endPosition.x - startPosition.x > 30 && !isRight) {
                    rightImg.style.display = 'block';
                    isRight                = true;
                }
                // 向下
                if (endPosition.y - startPosition.y > 30 && !isBottom) {
                    leftImg.style.display = 'block';
                    isBottom              = true;
                }
                clearTimeout(timer);
                timer = setTimeout(function () {
                    mouseUpEvent();
                }, 2400);
            }
        }, false);

        // 双击次数默认为0
        var rightMenuClickNums = 0,
            cliclTimer         = null,
            isMac              = detectOS();
        // 当前是mac
        if (isMac == 'Mac') {
            // 是mac那么进来直接取消右键菜单,改成双击右键出现菜单
            document.addEventListener('contextmenu', removeContextmenu, false);
        }

        document.addEventListener('mousedown', function (e) {
            if (e.button != 2) {
                isMouseDown = false;
                return;
            }
            if (isMac == 'Mac') {
                rightMenuClickNums = rightMenuClickNums + 1;
                if (rightMenuClickNums >= 2) {
                    document.removeEventListener('contextmenu', removeContextmenu, false);
                    rightMenuClickNums = 0;
                }
                clearTimeout(cliclTimer);
                cliclTimer = setTimeout(function () {
                    document.addEventListener('contextmenu', removeContextmenu, false);
                    rightMenuClickNums = 0;
                }, 300);
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
            var event = '';
            if (isBottom) {
                event = 'update';
            }
            if (isBottom && isRight) {
                event = 'close';
            }
            chrome.extension.sendRequest({
                event: event,
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
});