var utils = (function(){
	return {
		rgbToInt:function(red, green, blue){
			var val = "#",
			 	tmp;

			tmp = red.toString(16);
			val += (tmp.length <= 1) ? "0" + tmp : tmp;
			tmp = green.toString(16);
			val += (tmp.length <= 1) ? "0" + tmp : tmp;
			tmp = blue.toString(16);
			val += (tmp.length <= 1) ? "0" + tmp : tmp;
			return val;
		},
		intToRgb:function(val){
			if(val.indexOf("#") != 0 || val.length != 7){
				return {red:0,green:0,blue:0}
			}

			val = val.substr(1, val.length - 1);
			var res  = {};
			var tmp = val.substr(0,2);
			res.red = parseInt(tmp, 16);
			tmp = val.substr(2, 2);
			res.green = parseInt(tmp, 16);
			tmp = val.substr(4, 2);
			res.blue = parseInt(tmp, 16);
			return res;
		},
		getReqParams:function(){
			var str = window.location.search;
			var params = {};
			if(str.charAt(0) == '?')
				str = str.substring(1, str.length);
			if(str != null && str != ""){
				str = window.decodeURIComponent(str);
				var rparams = str.split('&');
				for(var i = 0; i < rparams.length;  i++){
					var rparam = rparams[i].split('=');
					if(rparam.length == 2){
						params[rparam[0]] = rparam[1];
					}
				}
			}
			return params;
		},
		getSite:function(){
			return window.location.origin + window.location.pathname;
		}
	}
});