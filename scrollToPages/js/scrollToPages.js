function PageLoad() {
    this.data = null;   //总数据
    this.list_length = 0;   //加载列表总数
    this.everyList = [];
    this.can_support = true;
    this.onOff = true;
    this.defaults = {
        contentBox: null,  //容器
        page: 12,  //每页加载数量
        canvas: true,  //是否为canvas渲染
        list_tempalte: null,
        events: {
            obj: window,   //请求触发对象
            targetObj: null,   //目标点对象
            event: 'scroll'  //事件函数名
        }
    }
};
PageLoad.prototype.init = function(data, opt) {
    this.can_support = canvasSupport() ? true : false;
    this.data = data;
    extend(this.defaults, opt);
    this.OnePage();
    this.Event()
};
PageLoad.prototype.OnePage = function() {
    if (!this.data.length) {
        return false
    }
    var num = 0;
    for (var i = this.list_length; i < this.defaults.page + this.list_length; i++) {
        if (!this.data[i]) {
            this.onOff = false;
            console.log('已经没有了' + i);
            break
        }
        this.everyList.push(this.List_template(i));
        if (this.can_support && this.defaults.canvas) {
            this.AppendCanvas(i)
        }
        num++
    }
    this.list_length += num;
    this.AppendContent()
};
PageLoad.prototype.Event = function() {
    var obj = this.defaults.events.obj;
    var event = this.defaults.events.event;
    var _this = this;
    var timer = null;
    //var re = new RegExp('\\bactive\\b');
    binds(obj, event, toScroll);

    function toScroll() {
        //var boxActive = _this.defaults.contentBox.parentNode.className;
        if (_this.BeginLoad() && _this.onOff /*&& re.test(boxActive) */) {
            fireEvent(_this, 'pageBefore');    //每次加载前
            clearTimeout(timer);
            timer = setTimeout(function() {
                _this.OnePage()
            }, 200)
        }
    }
};
PageLoad.prototype.List_template = function(i) {
    return this.defaults.list_tempalte && this.defaults.list_tempalte(this, i)
};
PageLoad.prototype.AppendCanvas = function(i) {
    var aImg = new Image();
    aImg.index = i;
    var _this = this;
    aImg.onload = function() {
        var oC = getByClassName(_this.defaults.contentBox, 'oGc_' + this.index)[0];
        var oGc = oC.getContext('2d');
        oGc.drawImage(this, 0, 0, oC.width, oC.height)
    };
    
    aImg.src = this.data[i]['src']
};
PageLoad.prototype.AppendContent = function() {
    var oFrag = document.createDocumentFragment();
    for (var i = 0; i < this.everyList.length; i++) {
        oFrag.appendChild(this.everyList[i])
    }
    this.defaults.contentBox.appendChild(oFrag);
    this.everyList = [];
    if (this.onOff) {
        fireEvent(this, 'pageAfter')    //每次加载完
    } else {
        fireEvent(this, 'allAfter')     //全部加载完
    }
};
PageLoad.prototype.BeginLoad = function() {
    var client_height = document.documentElement.clientHeight;  //可视区高度
    var scroll_top = document.documentElement.scrollTop || document.body.scrollTop; //滚动条高度
    var scroll_target = client_height + scroll_top;
    var targetObj = this.defaults.events.targetObj;
    if (typeof targetObj == 'object' && targetObj) {
        return lastTop(targetObj) < scroll_target ? true : false
    } else {
        return document.body.offsetHeight - client_height - scroll_top < 10 ? true : false
    }
};

function lastTop(obj) {
    var Top = 0;
    while (obj) {
        Top += obj.offsetTop;
        obj = obj.offsetParent
    }
    return Top
};

function extend(defaults, opt) {
    for (var attr in opt) {
        defaults[attr] = opt[attr]
    }
};

function bindEvent(obj, events, fn) {
    obj.listeners = obj.listeners || {};
    obj.listeners[events] = obj.listeners[events] || [];
    obj.listeners[events].push(fn);
    if (obj.nodeType) {
        binds(obj, events, fn)
    }
};

function fireEvent(obj, events) {
    if (obj.listeners && obj.listeners[events]) {
        for (var i = 0; i < obj.listeners[events].length; i++) {
            obj.listeners[events][i](obj)
        }
    }
};

function binds(obj, events, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(events, fn, false)
    } else {
        obj.attachEvent('on' + events, function() {
            fn.call(obj)
        })
    }
};

function getByClassName(parent, sClass) {
    var aEls = parent.getElementsByTagName('*');
    var arr = [];
    var re = new RegExp('\\b' + sClass + '\\b');
    for (var i = 0; i < aEls.length; i++) {
        if (re.test(aEls[i].className)) {
            arr.push(aEls[i])
        }
    }
    return arr
};

function canvasSupport() {
    return !!document.createElement('canvas').getContext
};