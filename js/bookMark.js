window.onload = function () {
    function removeEmpty(arrayList) {
        return arrayList.filter(n => {
            if (typeof n !== "undefined") {
                return n
            }
        });
    }

    let dataArray          = [];
    let navArray           = [];
    let homeIndex          = 0;
    let excludedArray      = ['其他'];
    let excludedIndexArray = [];
    chrome.bookmarks.getTree(function (topNode) {
        let bmarkNode = topNode[0]["children"];
        getInitList(bmarkNode);
        dataArray         = removeEmpty(dataArray);
        navArray          = removeEmpty(navArray);
        navArray[0].title = '全部书签';
        for (let i in navArray) {
            if (navArray[i].title === '首页') {
                homeIndex = i;
            }
            for (let o in excludedArray) {
                if (navArray[i].title === excludedArray[o]) {
                    excludedIndexArray.push(i);
                }
            }
        }
        navArray.push({id: '0', 'title': '历史记录'});
        let allData          = [];
        let everyHistoryNums = 200; // 每页200行历史记录
        for (let i in dataArray) {
            if (excludedIndexArray.length > 0) {
                for (let p in excludedIndexArray) {
                    if (excludedIndexArray[p] * 1 !== i * 1) {
                        allData = allData.concat(dataArray[i]);
                    }
                }
            } else {
                allData = allData.concat(dataArray[i]);
            }
        }
        dataArray[0]     = allData;
        let historyArray = [];
        for (let i in dataArray) {
            dataArray[i].reverse();
        }
        new Vue({
            el     : '#app',
            data   : function () {
                return {
                    historyTotalPage: 0,
                    aClickIndex     : -1,
                    isEmpty         : true,
                    isDeleteSuccess : false,
                    historyPage     : 0, // 当前历史记录页数
                    searchValue     : '',
                    searchReasult   : [],
                    timer           : null,
                    index           : homeIndex,
                    list            : dataArray,
                    nav             : navArray,
                }
            },
            watch  : {
                searchValue: function () {
                    this.search();
                }
            },
            methods: {
                clear           : function () {
                    this.searchValue = '';
                    this.resetAClickIndex();
                },
                resetAClickIndex: function () {
                    this.aClickIndex = -1;
                },
                aClick          : function (index) {
                    this.aClickIndex = index;
                },
                clickPage       : function (index) {
                    this.historyPage      = index;
                    let length            = this.list.length;
                    this.list[length - 1] = historyArray[index];

                    // 回滚到顶部
                    document.querySelector('html,body').scrollTop = 0;
                },
                deleteBookMark  : function (id, listItemIndex) {
                    this.resetAClickIndex();
                    chrome.bookmarks.remove(id, () => {
                        this.list[this.index].splice(listItemIndex, 1);
                    });

                    if (this.searchReasult.length > 0) {
                        for (let i in this.searchReasult) {
                            if (this.searchReasult[i].id * 1 === id * 1) {
                                this.searchReasult.splice(i, 1);
                            }
                        }
                        if (this.searchReasult.length === 0) {
                            this.isEmpty = !this.isEmpty;
                        }
                    }
                    this.isDeleteSuccess = true;
                    clearTimeout(this.timer);
                    this.timer = setTimeout(() => {
                        this.isDeleteSuccess = false;
                        this.timer           = null;
                    }, 1000);
                },
                clickNav        : function (index) {
                    this.resetAClickIndex();
                    this.index       = index;
                    this.searchValue = '';
                    this.isEmpty     = !this.isEmpty;
                },
                search          : function () {
                    this.resetAClickIndex();
                    let list = this.list[0],
                        data = [];
                    for (let i in list) {
                        if (list[i].title.toLowerCase().indexOf(this.searchValue.toLowerCase()) > -1) {
                            data.push(list[i]);
                        }
                    }
                    this.searchReasult = data;
                    this.isEmpty       = !this.isEmpty;
                },
                getFormatTime(time, format) {
                    time     = Math.ceil(time);
                    let date = new Date(time);
                    return this.addZero(date.getMonth() + 1) + '-' + this.addZero(date.getDate());
                },
                addZero(val) {
                    if (val * 1 < 9) {
                        val = '0' + val;
                    }
                    return val;
                },
                getTitle(url) {
                    return this.formatContent(decodeURI(url));
                },
                formatContent(value) {
                    let olderVal = value,
                        reg      = /[\u4e00-\u9fa5]/g;
                    value        = value.match(reg);
                    if (value == null) {
                        return olderVal;
                    }
                    return value.join("");
                }
            },
            mounted() {
                this.$nextTick(() => {
                    chrome.storage.local.get('historyStartTime', valueArray => {
                        let startTime = 2;
                        let value     = valueArray.historyStartTime;
                        startTime     = value ? value : startTime;
                        startTime     = getToData(startTime);
                        chrome.history.search({
                            text      : '',
                            startTime : startTime, // ms
                            maxResults: 999999999
                        }, results => {
                            for (let i = 0, len = results.length; i < len; i += everyHistoryNums) {
                                historyArray.push(results.slice(i, i + everyHistoryNums));
                            }
                            this.list.push(historyArray[0]);
                            this.historyTotalPage = historyArray.length;
                        });
                    });
                });
            }
        });
    });

    function getToData(toMonth) {
        toMonth      = toMonth > 12 ? 12 : toMonth;
        let resultDate, year, month, date, hms;
        let currDate = new Date();
        year         = currDate.getFullYear();
        month        = currDate.getMonth() + 1;
        date         = currDate.getDate();
        hms          = currDate.getHours() + ':' + currDate.getMinutes() + ':' + (currDate.getSeconds() < 10 ? '0' + currDate.getSeconds() : currDate.getSeconds());
        if (toMonth >= month) {
            month = month - toMonth + 12;
            year--;
        } else {
            month = month - toMonth;
        }
        resultDate = year + '-' + month + '-' + date + ' ' + hms;
        return new Date(resultDate).getTime();
    }

    function find(str, cha, num) {
        let x = str.indexOf(cha);
        for (let i = 0; i < num; i++) {
            x = str.indexOf(cha, x + 1);
        }
        return x;
    }


    function getInitList(children) {
        for (let i in children) {
            let childrenItem = children[i];
            if (typeof childrenItem.children !== 'undefined') {
                navArray[childrenItem.id]  = '';
                dataArray[childrenItem.id] = [];
                // 不为空,就是说当前为分类
                navArray[childrenItem.id]  = {
                    id   : childrenItem.id,
                    title: childrenItem.title
                };
                getInitList(childrenItem);
            } else {
                // 如果是数组
                if (Array.isArray(childrenItem)) {
                    getInitList(childrenItem);
                    return;
                }
                let url   = childrenItem.url;
                let index = find(url, '/', 2);
                // console.log(childrenItem);
                // http://statics.dnspod.cn/proxy_favicon/_/favicon?domain=
                dataArray[childrenItem.parentId].push({
                    id   : childrenItem.id || '',
                    title: childrenItem.title,
                    url  : url,
                    pid  : childrenItem.parentId,
                    icon : url.substr(0, index) + '/favicon.ico',
                });
            }
        }
    }
}
