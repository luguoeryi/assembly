
//轮播组件  settings: 配置参数
/*{
	time  时间间隔  默认3500,
	ispeed	速度 默认400,
	easing  运动形式 默认swing,
	event  事件 默认click,
	autoshow  自动轮播,
	opacitys 是否为切换透明度  默认位移
	switchover 是否显示左右切换按钮  默认不显示
	direction : 方向  默认正序
}	*/
//支持回调	写法   Carousel.on('callbacks', fn);

function Carousel(){
	this.wrap = null;
	this.imgList = null;
	this.imgA = null;
	this.cursorBox = null;
	this.cursorA = null;
	this.prev = null;
	this.next = null;
	this.timer = null;
	this.length = 0;
	this.imgWidth = 0;
	this.iNow = 0;
	this.num = 0;
	this.onOff = true;
	this.defaults = {
		time : 3500,
		ispeed : 400,
		easing : 'swing',
		event : 'click',
		autoshow : true,
		opacitys : false,
		switchover : false,
		direction : true
	}
}

Carousel.prototype.init = function(wrap, opt){
	
	$.extend(this.defaults, opt);
	
	this.wrap = wrap ;
	
	this.imgList = this.wrap.find('.img_list');
	
	this.length = this.imgList.find('img').size();
	
	this.imgWidth = this.imgList.find('img').width();
	
	this.imgA = this.imgList.find('a');
	
	this.createCursor();
	
	if( this.defaults.autoshow ){
		this.autoShow();
	}
	
	this.events();
};

Carousel.prototype.createCursor = function(){
	
	this.cursorBox = $('<div>');
	this.cursorBox.addClass('cursor_box');
	var boxHtml = '';
	for(var i=0;i<this.length;i++){
		boxHtml += '<a href="javascript:;"></a>';
	}
	this.cursorBox.html( boxHtml );
	this.cursorA = this.cursorBox.find('a');
	this.cursorA.eq(0).addClass('active');
	this.wrap.append( this.cursorBox );
	
	if( this.defaults.switchover ){
		this.prev = $('<span class="banner_prev"></span>');
		this.next = $('<span class="banner_next"></span>');
		
		this.wrap.append( this.prev );
		this.wrap.append( this.next );
	}
};

Carousel.prototype.autoShow = function(){
	var _this = this;
	
	clearInterval( this.timer );
	
	this.timer = setInterval(function(){
		if( _this.defaults.direction ){
			_this.iNow++;
			_this.num++;
		}else{
			_this.iNow--;
			_this.num--;
		}
		changeMove(_this);
		
	}, _this.defaults.time);
};

Carousel.prototype.events = function(){
	
	if( this.defaults.opacitys ){
		$(this.imgA).eq(0).css('zIndex', 10);	
	}
	
	this.cursoraEvent();
	
	if( this.defaults.switchover ){
		this.switchoverEvent();
	}
};

Carousel.prototype.cursoraEvent = function(){
	var _this = this;
	
	$(this.cursorA).on(this.defaults.event, function(){
		showEvents(_this, $(this), $(this).index());
	});
};

Carousel.prototype.switchoverEvent = function(){
	var _this = this;
	$(this.prev).on('click',function(){
		showEvents(_this, $(this),'-');
	});
	
	$(this.next).on('click',function(){
		showEvents(_this, $(this), '+');
	});
};

Carousel.prototype.callback = function(){
	if( this.iNow == 0 ){
		this.onOff = true;
		this.imgList.css({left: 0});
		this.imgList.find('a').eq(0).css({position: ''});	
		this.num = 0;
	}else if( this.iNow == this.length-1 ){
		this.onOff = true;
		this.imgList.css({left: -this.imgWidth * (this.length-1) });
		this.imgList.find('a').eq(this.length-1).css({position: ''});	
		this.num = this.length-1;
	}
};

function showEvents(obj, curSor, iNow){
	if( (!obj.onOff) && (!obj.defaults.opacitys) ) return false;
	clearInterval( obj.timer );
	
	switch( iNow ){
		case '+' :
			obj.iNow++;
			obj.num++;
		break;
		case '-' :
			obj.iNow--;
			obj.num--;
		break;
		default :
			obj.iNow = iNow;
			obj.num = iNow;
		break;
	}
	changeMove(obj);
	
	$(curSor).on('mouseout', function(){
		if( obj.defaults.autoshow ){
			obj.autoShow();
		}
		$(curSor).off('mouseout');
	});
}

function changeMove(obj){
	
	if( obj.defaults.opacitys ){
		opacityMove();
	}else{
		defaultMove();
	}
	
	obj.cursorBox.find('a').removeClass('active');
	
	obj.cursorBox.find('a').eq(obj.iNow).addClass('active');
	
	function opacityMove(){
		if( obj.iNow == obj.length ){
			obj.iNow = 0;
		}else if( obj.iNow < 0 ){
			obj.iNow = obj.length-1;
		}
		
		obj.imgA.each(function(i){
			if( i!= obj.iNow){
				$(this).stop().fadeOut(obj.defaults.ispeed);
			}else{
				$(this).stop().fadeIn(obj.defaults.ispeed, function(){
					$(obj).trigger('callbacks', obj.iNow);
				});
			}
		});
		
	}
	
	function defaultMove(){
		if( obj.iNow == obj.length ){
			obj.onOff = false;
			obj.iNow = 0;
			obj.imgList.find('a').eq(0).css({position: 'relative', left: obj.imgWidth * obj.length });
		}else if( obj.iNow < 0 ){
			obj.onOff = false;
			obj.iNow = obj.length-1;
			obj.imgList.find('a').eq(obj.length-1).css({position: 'relative', left: -obj.imgWidth * obj.length });
		}
		
		obj.imgList.stop().animate({left: -obj.imgWidth * obj.num}, obj.defaults.ispeed, obj.defaults.easing, function(){
			obj.callback();
			$(obj).trigger('callbacks', obj.iNow);
		});
	}
}




$.extend(jQuery.easing,{
	
	easeIn: function(x,t, b, c, d){  //加速曲线
		return c*(t/=d)*t + b;
	},
	easeOut: function(x,t, b, c, d){  //减速曲线
		return -c *(t/=d)*(t-2) + b;
	},
	easeBoth: function(x,t, b, c, d){  //加速减速曲线
		if ((t/=d/2) < 1) {
			return c/2*t*t + b;
		}
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInStrong: function(x,t, b, c, d){  //加加速曲线
		return c*(t/=d)*t*t*t + b;
	},
	easeOutStrong: function(x,t, b, c, d){  //减减速曲线
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeBothStrong: function(x,t, b, c, d){  //加加速减减速曲线
		if ((t/=d/2) < 1) {
			return c/2*t*t*t*t + b;
		}
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	elasticIn: function(x,t, b, c, d, a, p){  //正弦衰减曲线（弹动渐入）
		if (t === 0) { 
			return b; 
		}
		if ( (t /= d) == 1 ) {
			return b+c; 
		}
		if (!p) {
			p=d*0.3; 
		}
		if (!a || a < Math.abs(c)) {
			a = c; 
			var s = p/4;
		} else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	elasticOut: function(x,t, b, c, d, a, p){    //正弦增强曲线（弹动渐出）
		if (t === 0) {
			return b;
		}
		if ( (t /= d) == 1 ) {
			return b+c;
		}
		if (!p) {
			p=d*0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},    
	elasticBoth: function(x,t, b, c, d, a, p){
		if (t === 0) {
			return b;
		}
		if ( (t /= d/2) == 2 ) {
			return b+c;
		}
		if (!p) {
			p = d*(0.3*1.5);
		}
		if ( !a || a < Math.abs(c) ) {
			a = c; 
			var s = p/4;
		}
		else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		if (t < 1) {
			return - 0.5*(a*Math.pow(2,10*(t-=1)) * 
					Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		}
		return a*Math.pow(2,-10*(t-=1)) * 
				Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
	},
	backIn: function(x,t, b, c, d, s){     //回退加速（回退渐入）
		if (typeof s == 'undefined') {
		   s = 1.70158;
		}
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	backOut: function(x,t, b, c, d, s){
		if (typeof s == 'undefined') {
			s = 3.70158;  //回缩的距离
		}
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	}, 
	backBoth: function(x,t, b, c, d, s){
		if (typeof s == 'undefined') {
			s = 1.70158; 
		}
		if ((t /= d/2 ) < 1) {
			return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		}
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	bounceIn: function(x,t, b, c, d){    //弹球减振（弹球渐出）
		return c - this['bounceOut'](x,d-t, 0, c, d) + b;
	},       
	bounceOut: function(x,t, b, c, d){
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
		}
		return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
	},      
	bounceBoth: function(x,t, b, c, d){
		if (t < d/2) {
			return this['bounceIn'](x,t*2, 0, c, d) * 0.5 + b;
		}
		return this['bounceOut'](x,t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
	}
	
});