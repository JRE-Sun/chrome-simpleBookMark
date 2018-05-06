window.onload = function () {
    function removeEmpty(array) {
        for (var i = 0; i < array.length; i++) {
            if (typeof (array[i]) == "undefined") {
                array.splice(i, 1);
                i = i - 1;
            }
        }
    }

    var dataArray          = [];
    var navArray           = [];
    var homeIndex          = 0;
    var excludedArray      = ['其他'];
    var excludedIndexArray = [];

    chrome.bookmarks.getTree(function (topNode) {
        var bmarkNode = topNode[0]["children"];
        getInitList(bmarkNode);
        removeEmpty(dataArray);
        removeEmpty(navArray);
        navArray[0].title = '全部书签';
        for (var i in navArray) {
            if (navArray[i].title == '首页') {
                homeIndex = i;
            }
            for (var o in excludedArray) {
                if (navArray[i].title == excludedArray[o]) {
                    excludedIndexArray.push(i);
                }
            }
        }
        navArray.push({id: '0', 'title': '历史记录'});
        var allData = [];
        for (var i in dataArray) {
            if (excludedIndexArray.length > 0) {
                for (var p in excludedIndexArray) {
                    if (excludedIndexArray[p] != i) {
                        allData = allData.concat(dataArray[i]);
                    }
                }
            } else {
                allData = allData.concat(dataArray[i]);
            }
        }
        dataArray[0] = allData;

        for (var i in dataArray) {
            dataArray[i].reverse();
        }

        new Vue({
            el     : '#app',
            data   : function () {
                return {
                    aClickIndex     : -1,
                    isEmpty         : true,
                    isDeleteSuccess : false,
                    history         : [],
                    everyHistoryNums: 10000, // 每页1w行历史记录
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
                    var length            = this.list.length;
                    this.list[length - 1] = this.history[index];

                    // 回滚到顶部
                    document.querySelector('html,body').scrollTop = 0;
                },
                deleteBookMark  : function (id, listItemIndex) {
                    var self = this;
                    self.resetAClickIndex();
                    chrome.bookmarks.remove(id, function () {
                        self.list[self.index].splice(listItemIndex, 1);
                    });

                    if (self.searchReasult.length > 0) {
                        for (var i in self.searchReasult) {
                            if (self.searchReasult[i].id == id) {
                                self.searchReasult.splice(i, 1);
                            }
                        }
                        if (self.searchReasult.length == 0) {
                            self.isEmpty = !self.isEmpty;
                        }
                    }
                    self.isDeleteSuccess = true;
                    clearTimeout(self.timer);
                    self.timer = setTimeout(function () {
                        self.isDeleteSuccess = false;
                        self.timer           = null;
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
                    var list = this.list[0],
                        data = [];
                    for (var i in list) {
                        if (list[i].title.toLowerCase().indexOf(this.searchValue.toLowerCase()) > -1) {
                            data.push(list[i]);
                        }
                    }
                    this.searchReasult = data;
                    this.isEmpty       = !this.isEmpty;
                },
                getFormatTime(time, format) {
                    time     = Math.ceil(time);
                    var date = new Date(time);
                    return this.addZero(date.getMonth() + 1) + '-' + this.addZero(date.getDate());
                },
                addZero(val) {
                    if (val * 1 < 9) {
                        val = '0' + val;
                    }
                    return val;
                }
            },
            mounted() {
                var self = this;
                chrome.history.search({
                    text      : '',
                    startTime : 10000 * 60 * 60 * 24 * 7,
                    // endTime   : new Date('2000/1/1').getTime() * 1,
                    maxResults: 999999999
                }, function (results) {
                    var everyHistoryNums = self.everyHistoryNums;
                    for (var i = 0, len = results.length; i < len; i += everyHistoryNums) {
                        self.history.push(results.slice(i, i + everyHistoryNums));
                    }
                    self.list.push(self.history[0]);
                });
            }
        });
    });

    function find(str, cha, num) {
        var x = str.indexOf(cha);
        for (var i = 0; i < num; i++) {
            x = str.indexOf(cha, x + 1);
        }
        return x;
    }

    function getInitList(children) {
        for (var i in children) {
            var childrenItem = children[i];
            if (typeof childrenItem.children != 'undefined') {
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
                var url   = childrenItem.url;
                var index = find(url, '/', 2);
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
