function Carousel(){
	this.bannerWrap = null;
	this.imgWrap = null;
	this.imgList = null;
	this.cursorWrap = null;
	this.cursorList = null;
	this.that = null;
	this.timer = null;
	this.length = 0;
	this.downX = 0;
	this.downLeft = 0;
	this.imgWidth = 0;
	this.iNow = 0;
	this.downTime = 0;
	this.defaults = {
		time : 4000,
		ispeed : 200,
		easing : 'ease',
		opacitys : false,
		direction : true
	};
};

Carousel.prototype.init = function(wrap, opt){
	extend(this.defaults, opt);
	this.bannerWrap = wrap;
	this.imgWrap = this.bannerWrap.getElementsByClassName('img_wrap')[0];
	this.imgList = this.imgWrap.getElementsByTagName('a');
	this.length = this.imgList.length;
	this.imgWidth = this.imgList[0].offsetWidth;
	this.imgWrap.style.width = this.imgWidth * this.length + 'px';
	this.createCursor();
	this.autoPlay();
	this.events();
};

Carousel.prototype.createCursor = function(){
	this.cursorWrap = document.createElement('p');
	this.cursorWrap.className = 'cursor_wrap';
	var html = '';
	for(var i=0;i<this.length;i++){
		html += '<a href="javascript:;"></a>';
	};
	this.cursorWrap.innerHTML = html;
	this.bannerWrap.appendChild( this.cursorWrap );
	this.cursorList = this.cursorWrap.getElementsByTagName('a');
	this.cursorList[0].className = 'active';
	this.that = this.cursorList[0];
};

Carousel.prototype.autoPlay = function(){

	var _this = this;

	this.timer = setInterval(function(){
		if( !_this.defaults.opacitys ){
			filterIf( _this );
		}

		_this.defaults.direction ? _this.iNow++ : _this.iNow--;

		MoveAndCursor( _this, true );

	}, this.defaults.time);
};

Carousel.prototype.events = function(){

	var _this = this;

	this.imgWrap.addEventListener('touchstart', function(ev){
		_this.fnStart( ev );
	}, false);

	document.addEventListener('touchmove', function(ev){
		ev.preventDefault();
	}, false);

	window.addEventListener('focus', function(){
		clearInterval( _this.timer );
		_this.autoPlay();
	}, false);

	window.addEventListener('blur', function(){
		clearInterval( _this.timer );
	}, false);
};

Carousel.prototype.fnStart = function(ev){

	clearInterval( this.timer );

	this.timer = null;

	if(this.iNow === -1 || this.iNow === this.length) return ;
	
	this.downTime = Date.now();

	this.downX = ev.changedTouches[0].pageX;

	this.downLeft = this.imgWrap.offsetLeft;

	var _this = this;

	if( !this.defaults.opacitys ){
		filterIf( this );

		var delFnMove = null;

		this.imgWrap.addEventListener('touchmove', function(ev){
			_this.fnMove( ev );
			delFnMove = arguments.callee;
		}, false);
	}
	
	this.imgWrap.addEventListener('touchend', function(ev){
		_this.fnEnd(ev, arguments.callee, delFnMove);
	}, false);

};

Carousel.prototype.fnMove = function(ev){

	var moveX = ev.changedTouches[0].pageX;

	this.imgWrap.style.left = moveX - this.downX + this.downLeft + 'px';

};

Carousel.prototype.fnEnd = function(ev, fn, fnM){

	var upX = ev.changedTouches[0].pageX;

	if( !this.defaults.opacitys ){

		this.imgWrap.removeEventListener('touchmove', fnM, false);

	}

	this.imgWrap.removeEventListener('touchend', fn, false);

	if( 
		( (upX < this.downX) && (this.downX - upX > this.imgWidth/3) ) || 
		( (upX < this.downX) && (Date.now() - this.downTime < 300) ) 
		)
	{

		this.iNow++;

		MoveAndCursor( this, true );

	} else if( 
		( (upX > this.downX) && (upX - this.downX > this.imgWidth/3) ) || 
		( (upX > this.downX) && (Date.now() - this.downTime < 300) )
		)
	{

		this.iNow--;

		MoveAndCursor( this, true );

	} else{

		MoveAndCursor( this, false );

	}


};

Carousel.prototype.callBack = function(fn, onOff){


	if( !this.defaults.opacitys ){
		defaultCallBack(this);
	}else {
		opacityCallBack(this)
	}

	this.that.className = null;
	this.cursorList[this.iNow].className = 'active';
	this.that = this.cursorList[this.iNow];

	if( onOff ){
		fireEvent(this, 'callBacks');
	}

	if(!this.timer){
		this.autoPlay();
	}

	function defaultCallBack(_this){
		removeEnd(_this.imgWrap, fn);
		Transition(_this.imgWrap, null);

		if( _this.iNow === -1 ){

			setPosition( _this.imgList[_this.length-1], 'static', 0 );
			setPosition( _this.imgWrap, 'absolute', -_this.imgWidth * (_this.length-1) );

			_this.iNow = _this.length-1;		
		}else if( _this.iNow === _this.length ){

			setPosition( _this.imgList[0], 'static', 0 );

			setPosition( _this.imgList[_this.length-1], 'static', 0 );

			setPosition( _this.imgWrap, 'absolute', 0 );

			_this.iNow = 0;
		}
	};

	function opacityCallBack(_this){
		removeEnd(_this.imgWrap, fn);
		Transition(_this.imgWrap, null);
	};

};

function filterIf(_this){

	Transition(_this.imgWrap, null);
	if( _this.iNow === 0 ){

		setPosition( _this.imgList[_this.length-1], 'relative', -_this.length * _this.imgWidth );
		
	} else if( _this.iNow === _this.length-1 ){

		setPosition( _this.imgList[0], 'relative', _this.length * _this.imgWidth );

	}else {

		setPosition( _this.imgList[_this.length-1], 'static', 0 );
		setPosition( _this.imgList[0], 'static', 0 );

	}
};

function MoveAndCursor(_this, onOff){
	if( !_this.defaults.opacitys ){

		Transition(_this.imgWrap, _this.defaults.ispeed+'ms '+_this.defaults.easing);

		if( _this.imgWrap.offsetLeft !== -_this.iNow * _this.imgWidth ){
			addEnd(_this.imgWrap, function(){
				_this.callBack(arguments.callee, onOff);
			});
		}else {
			_this.autoPlay();
		}

		_this.imgWrap.style.left = -_this.iNow * _this.imgWidth + 'px';

	}else {
		if( _this.iNow === -1 ){
			_this.iNow = _this.length-1;
		} else if( _this.iNow === _this.length ){
			_this.iNow = 0;
		}
		for(var i=0;i<_this.length;i++){
			Transition(_this.imgList[i], _this.defaults.ispeed+'ms '+_this.defaults.easing);

			if( i!=_this.iNow ){
				_this.imgList[i].style.opacity = 0;
				_this.imgList[i].style.zIndex = 1;
			}else {
				_this.imgList[i].style.opacity = 1;
				_this.imgList[i].style.zIndex = 10;
			}
		}
		(function(){  //transition问题解决
			Transition(_this.imgWrap, _this.defaults.ispeed+'ms '+_this.defaults.easing);
			_this.imgWrap.style.width = _this.iNow * _this.imgWidth ? _this.iNow * _this.imgWidt + 'px' : _this.imgWidth + 'px';

			addEnd(_this.imgWrap, function(){
				_this.callBack(arguments.callee, onOff);
			});
		})();
	}

};

function setPosition(obj, pos, num){
	obj.style.position = pos;
	obj.style.left = num + 'px';
};

function addEnd(obj, fn){
	obj.addEventListener('webkitTransitionEnd', fn ,false);
	obj.addEventListener('mozTransitionEnd', fn ,false);
	obj.addEventListener('oTransitionEnd', fn ,false);
	obj.addEventListener('transitionend', fn ,false);
};

function removeEnd(obj, fn){
	obj.removeEventListener('webkitTransitionEnd', fn, false);
	obj.removeEventListener('mozTransitionEnd', fn, false);
	obj.removeEventListener('oTransitionEnd', fn, false);
	obj.removeEventListener('transitionend', fn, false);
};

function Transition(obj, value){
	obj.style.webkitTransition =  obj.style.mozTransition = obj.style.oTransition = obj.style.transition = value;
};

function extend(defaults, opt){
	for(var attr in opt){
		defaults[attr] = opt[attr];
	}
};

function bindEvent(obj, events, fn){
	obj.listeners = obj.listeners || {};
	obj.listeners[events] = obj.listeners[events] || [];
	obj.listeners[events].push( fn );
	if( obj.nodeType ){
		obj.addEventListener(events, fn, false);
	}
};

function fireEvent(obj, events){
	if( obj.listeners && obj.listeners[events] ){
		for(var i=0;i<obj.listeners[events].length;i++){
			obj.listeners[events][i](obj);
		}
	}
};
