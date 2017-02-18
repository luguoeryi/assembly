function FormVald(){
	this.wrap = null;
	this.defaults = {
		wrap : null,
		errorFn : null,
		onSuccess : null
	}
};

FormVald.prototype.init = function(opt){
	if(!opt.wrap){
		console.log('option "wrap" is undefined');
		return false;
	}
	$.extend(this.defaults, opt);
	var _this = this;
	this.defaults.wrap.onsubmit = function(){
		_this.Verification();
	};
};

FormVald.prototype.Verification = function(){
	this.wrap = this.defaults.wrap;

	this.wrap.onOff = true;
	this.wrap.errcode = null;
	this.wrap.errObj = null;

	var allObj = this.wrap[0].getElementsByTagName('*');

	for(var i=0;i<allObj.length;i++){

		var tagName = allObj[i].tagName;

		if( this.FilterForm( tagName ) && this.GetAttr(allObj[i], 'js-required') == 'on' ){//取得验证表单

			if( this.NotNull( allObj[i] ) ){//取得非空表单

				if( this.Pattern( allObj[i] ) ){//取得类型通过表单
					if( !this.PatLength( allObj[i] ) ){
						this.IsFalse({code: 3, obj: allObj[i]});
						break;
					}

				}else {
					this.IsFalse({code: 2, obj: allObj[i]});
					break;
				}

			}else {
				this.IsFalse({code: 1, obj: allObj[i]});
				break;
			}

		}
	}

	if( this.wrap.onOff ){
		this.OnSuccess();
	}else {
		this.ErrorFn({obj:this.wrap.errObj, code:this.wrap.errcode});
	}

};

FormVald.prototype.PatLength = function(obj){
	if( !this.GetAttr(obj, 'js-length') ){
		return true;
	}

	var leVal = this.GetAttr(obj, 'js-length');
	var leArr = leVal && leVal !='' ?  leVal.split(',') : ['4','10'];
	var valLen = this.Trim(obj.value).length;
		leArr.length = leArr.length >=2 ? 2 : leArr.length;

		if( leArr && parseInt(leArr[0]) && parseInt(leArr[1]) ){
			if( ( leArr.length == 1 && valLen == leArr[0] ) || ( valLen >= leArr[0] &&  valLen <= leArr[1] )  ){
				return true;
			}else {
				return false;
			}
		}else {
			return false;
		}

};

FormVald.prototype.Pattern = function(obj){
	var PatternVal = this.GetAttr(obj, 'js-pattern') ? this.GetAttr(obj, 'js-pattern') : '';
	var _this = this;
	if( PatternType(PatternVal, obj.value) || !PatternVal ){
		return true;
	}else {
		return false;
	}

	function PatternType(PatternVal, Val){
		switch( PatternVal.toLowerCase() ){
			case 'd' :
				return _this.IsNumber(Val) ? true : false;
			break;
			case 'en' :
				return _this.IsEn(Val) ? true : false;
			break;
			case 'w' :
				return _this.IsChar(Val) ? true : false;
			break;
			case 'd-en' :
				return _this.EnAndNumber(Val) ? true : false;
			break;
			case 'en-d' :
				return _this.EnAndNumber(Val) ? true : false;
			break;
			case 'zn' :
				return _this.Zn(Val) ? true : false;
			break;
			case 'email' :
				return _this.Email(Val) ? true : false;
			break;
			default:
				return _this.IsChar(Val) ? true : false;
		}
	}
};

FormVald.prototype.CutArray = function(arr, len){
	return arr.length > len ? arr.slice(0, 2) : arr;
};

FormVald.prototype.FilterForm = function(str){//过滤表单元素
	return /select|input|textarea/.test( str.toString().toLowerCase() ) ? true : false;
};

FormVald.prototype.IsChar = function(str){//字符
	return /\w/.test(str.toString()) ? true : false;
};

FormVald.prototype.IsNumber = function(str){//数字
	return /\d/.test(str.toString()) ? true : false;
};

FormVald.prototype.IsEn = function(str){//英文
	return /^[A-Za-z]+$/.test(str.toString()) ? true : false;
};

FormVald.prototype.EnAndNumber = function(str){//英文加数字
	return /^(([a-z]+[0-9]+)|([0-9]+[a-z]+))[a-z0-9]*$/i.test(str.toString()) ? true : false;
};

FormVald.prototype.IsEmail = function(str){//邮箱
	return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(str.toString()) ? true : false;
};

FormVald.prototype.NotHasZn = function(str){//不包含中文
	return /[\u4e00-\u9fa5]/.test(str.toString()) ? true : false;
};

FormVald.prototype.Trim = function(str){//去除空格
	return str? str.toString().replace(/^\s+|\s+$/g, '') : str;
};

FormVald.prototype.Zn = function(str){//全中文
	return /^[\u4E00-\u9FA5]+$/.test(str.toString()) ? true : false;
}

FormVald.prototype.Email = function(str){//邮箱
	return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(str.toString()) ? true : false;
};

FormVald.prototype.NotNull = function(obj){//不为空
	return this.Trim(obj.value) != '' && this.Trim(obj.value) != this.Trim(this.GetAttr(obj, 'js-name')) ? true : false;
};

FormVald.prototype.IsFalse = function(json){
	this.wrap.errcode = json.code;
	this.wrap.errObj = json.obj;
	this.wrap.onOff = false;
};

FormVald.prototype.GetAttr = function(obj, attr){
	return obj.getAttribute(attr);
};

FormVald.prototype.ErrorFn = function(data){
	var oName = this.GetAttr(data.obj, 'js-name') ? this.GetAttr(data.obj, 'js-name') : '空字段';
	if( data.code == 1 ){
		alert('请填写'+oName);
	}else if( data.code == 2 ){
		alert('请正确填写'+oName);
	}else if( data.code == 3 ){
		alert(oName+'长度不符合要求');
	}else if( data.code == 4 ){
		console.error('js-length='+this.GetAttr(data.obj, 'js-length')+'is Format error');
	}
	data.obj.focus();
	this.wrap.onsubmit = function(){ alert(1) return false; };
};

FormVald.prototype.OnSuccess = function(data){
	//alert('验证通过');
	this.defaults.success && this.defaults.success();
	this.wrap.submit();
};
