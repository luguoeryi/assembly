function Tabswitch(){
    this.oParent = null;
    this.aInp = null;
    this.aDiv = null;
    this.iNow = 0;
    this.defaults = {
        event : 'click', //触发事件
        delay : 0,  //延迟毫秒
        nowSel : 0  //当前默认显示索引
    }
}

Tabswitch.prototype.init = function(oParent, opt){
    $.extend(this.defaults, opt);
    this.oParent = oParent;
    this.aInp = this.oParent.find('input');
    this.aDiv = this.oParent.find('div');
    this.change();
    if( this.defaults.nowSel ){
        this.show( this.defaults.nowSel );
    }
};

Tabswitch.prototype.change = function(){
    var _this = this;
    var timer = null;
    this.aInp.on(this.defaults.event, function(){
        var This = $(this);
        if( _this.defaults.event == 'mouseover' && _this.defaults.delay ){
            timer = setTimeout(function(){
                _this.show( This.index() );
            }, _this.defaults.delay);
        }else{
            _this.show( $(this).index() );
        }
    }).mouseout(function(){
        clearInterval( timer );
    });
};

Tabswitch.prototype.show = function( index ){
    $(this).trigger('beforeClick');
    this.aInp.attr('class','');
    this.aDiv.attr('class','');
    this.aInp.eq( index ).attr('class','active');
    this.aDiv.eq( index ).attr('class','active');
    this.iNow = index;
    $(this).trigger('afterClick');
};

Tabswitch.prototype.getContent = function(){
    return this.aDiv.eq( this.iNow ).html();
};