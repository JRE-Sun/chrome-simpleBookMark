window.onload = function () {
    var styleValue    = document.querySelector('.style-value'),
        optionsPageId = 0,
        isGetFocus    = false,
        tip           = document.querySelector('.tip');

    function saveEvent() {
        chrome.storage.local.set({'value': styleValue.value}, function () {
            tip.style.display = 'block';
            setTimeout(function () {
                tip.style.display = 'none';
            }, 600);
        });
    }

    function isUndefined(val) {
        if (typeof val == 'undefined') {
            return '';
        }
        return val;
    }

    chrome.tabs.getCurrent(function (tab) {
        optionsPageId = tab.id;
    });

    styleValue.addEventListener('focus', function () {
        isGetFocus = true;
    }, false);

    styleValue.addEventListener('blur', function () {
        isGetFocus = false;
        saveEvent();
    }, false);

    chrome.tabs.onSelectionChanged.addListener(function (tabId) {
        if (optionsPageId != tabId && isGetFocus) {
            styleValue.blur();
        }
    });

    chrome.storage.local.get('value', function (valueArray) {
        document.querySelector('.style-value').value = isUndefined(valueArray) || isUndefined(valueArray.value) ? '' : valueArray.value;
    });
};