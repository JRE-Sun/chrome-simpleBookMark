window.onload = function () {
    document.querySelector('.save-btn').addEventListener('click', function () {
        saveEvent('click');
    }, false);

    var styleValue = document.querySelector('.style-value');

    function saveEvent(type) {
        chrome.storage.local.set({'value': styleValue.value}, function () {
            if (type) {
                alert('保存成功!');
            }
        });
    }

    setInterval(function () {
        saveEvent();
    }, 800);


    chrome.storage.local.get('value', function (valueArray) {
        document.querySelector('.style-value').value = valueArray.value;
    });
};