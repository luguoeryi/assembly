/*
	-----拖拽组件
{
	obj : obj,
	field : boolean,	范围
	movement : boolean,		自由落体
	toDown : function(obj){  },
	toUp : function(obj){  },
	toMove : function(obj){  }
}
	*/

function Drag(){
	this.disX = 0;
	this.disY = 0;
	this.obj = null;
	
	this.prevX = 0;
	this.prevY = 0;
	this.iSpeedX = 0;
	this.iSpeedY = 0;
	this.timer = null;
	
	this.defaults = {
		field : false,
		movement : false
	};
};
	
Drag.prototype.init = function(opt){
	extend(this.defaults, opt);
	this.obj = opt.obj ;
	this.obj.style.cursor = 'move';
	var _this = this;
	this.obj.onmousedown = function(ev){
		var ev = ev || window.event;
		_this.fnDown(ev);
		fireEvent(_this, 'toDown');
	};
};

Drag.prototype.fnDown = function(ev){
	this.disX = ev.clientX - getPos( this.obj ).left;
	this.disY = ev.clientY - getPos( this.obj ).top;
	
	this.prevX = ev.clientX ;
	this.prevY = ev.clientY ;
	var _this = this;
	
	document.onmousemove = function(ev){
		var ev = ev || window.event;
		_this.fnMove(ev);
		fireEvent(_this, 'toMove');
	};
	
	document.onmouseup = function(){
		_this.fnUp();
		fireEvent(_this, 'toUp');
		if( _this.defaults.movement ){
			_this.movement();
		}
	};
	return false;
};

Drag.prototype.fnMove = function(ev){
	var L = ev.clientX - this.disX ;
	var T = ev.clientY - this.disY ;
	
	this.iSpeedX = ev.clientX - this.prevX ;
	this.iSpeedY = ev.clientY - this.prevY ;
	this.prevX = ev.clientX;
	this.prevY = ev.clientY;
	
	if( this.defaults.field ){
		this.MaxL = viewWidth() - this.obj.offsetWidth ;
		this.MaxT = viewHeight() - this.obj.offsetHeight ;
		
		L = field(this.MaxL, 0, L) ;
		T = field(this.MaxT, 0, T) ;
	}
	
	
	this.obj.style.left = L + 'px';
	this.obj.style.top = T + 'px';
};

Drag.prototype.fnUp = function(){
	document.onmousemove = document.onmouseup = null;
};

Drag.prototype.movement = function(){
	clearInterval( this.timer );
	this.MaxL = viewWidth() - this.obj.offsetWidth ;
	this.MaxT = viewHeight() - this.obj.offsetHeight ;
	var _this = this;
	this.timer = setInterval(function(){
		_this.iSpeedY += 3;
		var L = getPos( _this.obj ).left + _this.iSpeedX ;
		var T = getPos( _this.obj ).top + _this.iSpeedY ;
		
		if( L > _this.MaxL ){
			L = _this.MaxL ;
			_this.iSpeedX *= -1;
			_this.iSpeedX *= 0.75;
		}else if( L < 0 ){
			L = 0;
			_this.iSpeedX *= -1;
			_this.iSpeedX *= 0.75;
		}
		
		if( T > _this.MaxT ){
			T = _this.MaxT ;
			_this.iSpeedY *= -1;
			_this.iSpeedY *= 0.75;
			_this.iSpeedX *= 0.75;
		}else if( T < 0 ){
			T = 0;
			_this.iSpeedY *= -1;
			_this.iSpeedY *= 0.75;
		}
		
		_this.obj.style.left = L + 'px';
		_this.obj.style.top = T + 'px';
	},30);
};

/* end--拖拽组件  */



/*
	-----弹窗组件
{
	iNow : 1,	标识
	w : 150,	宽
	h : 400,	高
	title : '公告',
	dir : 'right'	
}
注： 弹框class="capacity"	关闭class=“close”  遮罩class=“mark” 主题内容class="content"
	*/

function Dialog(){
	this.capa = null;
	this.close = null;
	this.mark = null;
	this.defaults = {
		W : 300,
		H : 300,
		title : '这是标题',
		dir : 'center',
		mark : false,
		drag : false
	};
};

Dialog.prototype.json = {};

Dialog.prototype.init = function(opt){
	extend(this.defaults, opt);
	if( this.json[this.defaults.iNow] == undefined ){
		this.json[this.defaults.iNow] = true;
	}
	
	if( this.json[this.defaults.iNow] ){
		this.json[this.defaults.iNow] = false;
		this.createLog();
		this.closeLog();
		if( this.defaults.mark ){
			this.createMark();
		}
		if( this.defaults.drag ){
			this.drag({
				obj : this.capa,
				field : true
			});
		}
	}
};

Dialog.prototype.createLog = function(){
	this.capa = document.createElement('div');
	this.capa.className = 'capacity';
 	var str = '<h3>'+this.defaults.title+'<span class="close">X</span></h3><div class="content"></div>';
 	this.capa.innerHTML = str;
 	document.body.appendChild( this.capa );
	this.setStyle();
};

Dialog.prototype.createMark = function(){
	this.mark = document.createElement('div');
	this.mark.className = 'mark';
	this.mark.style.width = viewWidth() + 'px';
	this.mark.style.height = viewHeight() + 'px';
	document.body.appendChild( this.mark );
};

Dialog.prototype.closeLog = function(){
	this.close = this.capa.getElementsByTagName('span')[0];
	var _this = this;
	this.close.onclick = function(){
		document.body.removeChild( _this.capa );
		if( _this.defaults.mark ){
			document.body.removeChild( _this.mark );
		}
		_this.json[_this.defaults.iNow] = true;
	};
	
};

Dialog.prototype.setStyle = function(){
	this.capa.style.width = this.defaults.W + 'px';
	this.capa.style.height = this.defaults.H + 'px';
	
	if( this.defaults.dir === 'dir' ){
		this.capa.style.left =  this.defaults.L + 'px';
		this.capa.style.top =  this.defaults.T  + 'px'
	}else if( this.defaults.dir === 'center'){
		this.capa.style.left = ( viewWidth() - this.capa.offsetWidth ) / 2 + 'px';
		this.capa.style.top = ( viewHeight() - this.capa.offsetHeight ) / 2 + 'px';
	}else if( this.defaults.dir === 'right'){
		this.capa.style.left =  viewWidth() - this.capa.offsetWidth  + 'px';
		this.capa.style.top =  viewHeight() - this.capa.offsetHeight  + 'px';
	}
};

Dialog.prototype.drag = function(opt){
	new Drag().init(opt);
};
		
/* end--弹窗组件  */





//this bottom is function 
function bindEvent(obj, events, fn){
	obj.listeners = obj.listeners || {};
	obj.listeners[events] = obj.listeners[events] || [];
	obj.listeners[events].push( fn );
	if( obj.nodeType ){
		if( obj.addEventListener ){
			obj.addEventListener(events, fn, false);
		}else{
			obj.attachEvent('on'+events, fn);
		}
	}
}

function fireEvent(obj, events){
	if( obj.listeners && obj.listeners[events] ){
		for(var i=0;i<obj.listeners[events].length;i++){
			obj.listeners[events][i](obj);
		}
	}
}


function extend(obj1, obj2){
	for( var attr in obj2 ){
		obj1[attr] = obj2[attr] ;
	}
};

function field(mox, min, iNow){
	if( iNow>=mox ){
		return mox;
	}else if( iNow<=min ){
		return min;
	}else{
		return iNow;
	}
}

function getStyle(obj ,attr){
	if( obj.currentStyle ){
		return obj.currentStyle[attr] ;
	}else{
		return getComputedStyle(obj)[attr] ;
	}
}

function getPos( obj ){
	var Pos = {left:0,top:0};
	while( obj ){
		Pos.left += obj.offsetLeft;
		Pos.top += obj.offsetTop;
		obj = obj.offsetParent;
	};
	return Pos;
};

function viewWidth(){
	return document.documentElement.clientWidth ;	
};

function viewHeight(){
	return document.documentElement.clientHeight ;	
};

