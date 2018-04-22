window.onload = function () {
    var styleValue    = document.querySelector('.style-value'),
        optionsPageId = 0,
        isGetFocus    = false;

    function saveEvent() {
        chrome.storage.local.set({'value': styleValue.value}, function () {
        });
    }

    chrome.tabs.getCurrent(function (tab) {
        optionsPageId = tab.id;
    });

    styleValue.addEventListener('focus', function () {
        isGetFocus = true;
    }, false);

    chrome.tabs.onSelectionChanged.addListener(function (tabId) {
        if (optionsPageId != tabId && isGetFocus) {
            saveEvent();
        }
        styleValue.blur();
        isGetFocus = false;
    });

    chrome.storage.local.get('value', function (valueArray) {
        document.querySelector('.style-value').value = valueArray.value;
    });
};