window.onload = function () {
    let styleValue    = document.querySelector('.style-value'),
        optionsPageId = 0,
        isGetFocus    = false,
        inputStyle    = document.getElementById("input-style"),
        tip           = document.querySelector('.tip');


    inputStyle.addEventListener("change", function () {
        let grade = inputStyle.options[inputStyle.selectedIndex].value;
        chrome.storage.local.set({
            "historyStartTime": grade
        }, function () {
            tip.style.display = 'block';
            setTimeout(function () {
                tip.style.display = 'none';
            }, 600);
        });
    }, false);

    function saveEvent() {
        chrome.storage.local.set({"value": styleValue.value}, function () {
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
        styleValue.value = !(isUndefined(valueArray) || isUndefined(valueArray.value)) ? '' : valueArray.value;
    });

    chrome.storage.local.get('historyStartTime', function (valueArray) {
        console.log()
        inputStyle[(valueArray.historyStartTime || 2) - 1].selected = true;
    });
};