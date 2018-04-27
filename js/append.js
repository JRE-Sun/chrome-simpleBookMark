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
        var startPosition = {},
            endPosition   = {},
            isRight       = false,
            isBottom      = false,
            isLeft        = false,
            timer         = null,
            body          = document.querySelector('body'),
            fixedDiv      = document.createElement('div'),
            appendContent = document.createElement('div'),
            canvas        = document.createElement('canvas');

        fixedDiv.style.cssText      = 'z-index:9999999;position:fixed;left:0;right:0;top:0;bottom:0;background:transparent;';
        canvas.style.cssText        = 'z-index:999999;position:fixed;left:0;top:0;';
        canvas.id                   = 'ca';
        canvas.width                = window.innerWidth;
        canvas.height               = window.innerHeight;
        appendContent.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:5px;background:#333;display: flex;padding: 10px;align-items: center;justify-content: center;';
        var rightImg                = document.createElement('img');
        rightImg.src                = chrome.extension.getURL('img/right.png');
        var bottomImg               = document.createElement('img');
        bottomImg.src               = chrome.extension.getURL('img/down.png');
        var leftImg                 = document.createElement('img');
        leftImg.src                 = chrome.extension.getURL('img/right.png');
        rightImg.style.display      = 'none';
        bottomImg.style.display     = 'none';
        leftImg.style.cssText       = 'transform:rotateY(180deg);';
        leftImg.style.display       = 'none';
        canvas.style.display        = 'none';
        appendContent.appendChild(leftImg);
        appendContent.appendChild(bottomImg);
        appendContent.appendChild(rightImg);
        fixedDiv.appendChild(appendContent);
        body.appendChild(fixedDiv);
        body.appendChild(canvas);
        fixedDiv.style.display = 'none';
        var ca                 = document.querySelector("#ca"),
            cg                 = ca.getContext("2d");

        function detectOS() {
            var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
            if (isMac) {
                return "Mac";
            }
            return 'other';
        }

        var startTime = new Date().getTime();
        document.addEventListener('mousemove', function (e) {
            var endTime = new Date().getTime();
            if (e.buttons == 2 && endTime - startTime > 27) {
                startTime = endTime;
                if (isRight || isBottom || isLeft) {
                    fixedDiv.style.display = 'block';
                }
                endPosition = {
                    x: e.clientX,
                    y: e.clientY,
                }
                // 画鼠标手势轨迹
                cg.lineTo(endPosition.x, endPosition.y);
                cg.stroke();
                cg.strokeStyle = '#2085C5';
                cg.lineJoin    = "round";
                cg.lineWidth   = 4;
                // 向右
                if (endPosition.x - startPosition.x > 30 && !isRight) {
                    rightImg.style.display = 'block';
                    isRight                = true;
                }
                // 向左
                if ((startPosition.x > endPosition.x + 30) && !isLeft) {
                    console.log(startPosition.x, endPosition.x);
                    leftImg.style.display = 'block';
                    isLeft                = true;
                }
                // 向下
                if (endPosition.y - startPosition.y > 30 && !isBottom) {
                    bottomImg.style.display = 'block';
                    isBottom                = true;
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
                return;
            }
            ca.style.display = 'block';
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
        }, false);

        function removeContextmenu(e) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }

        function mouseUpEvent() {
            fixedDiv.style.display = 'none';
            ca.style.display       = 'none';
            ca.height              = ca.height;
            // 同时为假,直接return
            if (!isBottom && !isRight && !isLeft) {
                return;
            }
            rightImg.style.display  = 'none';
            bottomImg.style.display = 'none';
            leftImg.style.display   = 'none';
            document.addEventListener('contextmenu', removeContextmenu, false);
            if (isBottom && !isLeft && !isRight) {
                location.href = location.href;
                isBottom      = isRight = isLeft = false;
                document.removeEventListener('contextmenu', removeContextmenu, false);
                return;
            }
            if (isLeft && !isBottom && !isRight) {
                window.history.back();
                isBottom = isRight = isLeft = false;
                return;
            }
            if (isRight && !isBottom && !isLeft) {
                window.history.go(1);
                isBottom = isRight = isLeft = false;
                return;
            }
            if (isBottom && isRight && !isLeft) {
                chrome.extension.sendRequest({
                    event: 'close',
                    url  : location.href
                }, function (response) {
                });
            }
            isBottom = isRight = isLeft = false;
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


        ca.addEventListener('mousedown', function (e) {
            if (e.buttons == 2) {
                cg.moveTo(e.clientX, e.clientY);
            }
        }, false);
    })();
});