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
        // console.log(bmarkNode);
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
        new Vue({
            el     : '#app',
            data   : function () {
                return {
                    isEmpty      : true,
                    searchValue  : '',
                    searchReasult: [],
                    index        : homeIndex,
                    list         : dataArray,
                    nav          : navArray,
                }
            },
            watch  : {
                searchValue: function () {
                    this.search();
                }
            },
            methods: {
                clear         : function () {
                    this.searchValue = '';
                },
                deleteBookMark: function (id, listItemIndex) {
                    var self = this;
                    chrome.bookmarks.remove(id, function () {
                        self.list[self.index].splice(listItemIndex, 1);
                    });
                },
                clickNav      : function (index) {
                    this.index       = index;
                    this.searchValue = '';
                    this.isEmpty = !this.isEmpty;
                },
                search        : function () {
                    var list = this.list[0],
                        data = [];
                    for (var i in list) {
                        if (list[i].title.toLowerCase().indexOf(this.searchValue.toLowerCase()) > -1) {
                            data.push(list[i]);
                        }
                    }
                    this.searchReasult = data;
                    this.isEmpty = !this.isEmpty;
                }
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
