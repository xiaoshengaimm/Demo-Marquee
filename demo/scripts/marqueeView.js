//modify by huangjs
var marquee = (function(){
	var touchX,
		SLIP_START = 0.0,
		SLIP_END = 100.0,
		red = 20,
		green = 20,
		blue = 20,
		colorStyle = 0;  //0：on_color，else:off_color

	var u = utils(),
		led = ledPad();

	var setColorValue = function(id, value){
		if(id == 'red_axis'){
			red  = Math.floor(value * 255 / 100);
			//$("#red_value").html(red);
		} else if(id == 'green_axis'){
			green = Math.floor(value * 255 / 100);
			//$("#green_value").html(green);
		} else {	
			blue = Math.floor(value * 255 / 100);
			//$("#blue_value").html(blue);
		}
		var color = u.rgbToInt(red, green, blue);
		$(".show_color").css('background-color', color);
	}

	var initColorAxis = function(val){
		var color = u.intToRgb(val);
		red = color.red;
		green = color.green;
		blue = color.blue;
		var tmp = Math.floor(color.red / 255 * 100);
		$("#red_axis").find(".slip").css("left", tmp + "%");
		tmp = Math.floor(color.green / 255 * 100);
		$("#green_axis").find(".slip").css("left", tmp + "%");
		tmp = Math.floor(color.blue / 255 * 100);
		$("#blue_axis").find(".slip").css("left", tmp + "%");
	}

	var genUrl = function(){
		var url = u.getSite()  + '?';
		if(url){
			var msg = led.getMsg(),
				wColor = led.getOnColor(),
				bgColor = led.getOffColor();
			if(msg){
				url += 'msg=' + window.encodeURIComponent(msg);
			}
			if(wColor){
				url += '&w_color=' + window.encodeURIComponent(wColor);
			}
			if(bgColor){
				url += '&bg_color=' + window.encodeURIComponent(bgColor);
			}
		}
		return url;
	}

	var drawLed = function(){
		var height = window.innerHeight,
			width = window.innerWidth,
			canvas = document.getElementById('led_pad');
		canvas.width = width;
		canvas.height = height;
		led.init("#led_pad");
	}

	var bindEvents = function(){
		$(".ok_btn").bind("click", function(e){
			var msg = $(".msg").val();
			if(msg){
				if(msg.length > 100){               //msg length limit
					msg = msg.substr(0, 100);
				}
				led.showBlank();
				led.writeMessage(msg);
				led.clearAni();
				led.resetPos();
				led.scrollMsg(msg);
			}
			$(".control_pad")[0].style.display = "none";

		});

		$(".cancel_btn").bind("click", function(e){
			var pad = $(".control_pad")[0];
			pad.style.display = "none";
		});

		$(".control_btn").bind("click", function(e){
			var pad = $(".control_pad")[0];
			if(pad.style.display == "none" || pad.style.display == ""){
				pad.style.display = "block";
			} else {
				pad.style.display = "none";
			}
		});

		$("#speed_up").bind("click", function(){
			led.clearAni();
			led.speedUp();
			led.scrollMsg();
		});

		$("#speed_down").bind("click", function(){
			led.clearAni();
			led.speedDown();
			led.scrollMsg();
		});

		$("#on_color").bind("click", function(e){
			initColorAxis(led.getOnColor());
			$(".show_color").css('background-color', led.getOnColor());
			$(".color_pad").show();
			colorStyle = 0;
		});

		$("#off_color").bind("click", function(){
			initColorAxis(led.getOffColor());
			$(".show_color").css('background-color', led.getOffColor());
			$(".color_pad").show();
			colorStyle = 1;
		});

		$("#color_ok").bind("click", function(){
			$(".color_pad").hide();
			var color = u.rgbToInt(red, green, blue);
			if(colorStyle == 0){
				led.setOnColor(color);
			} else {
				led.setOffColor(color);
			}
		});
		$(".url_btn").bind("click", function(){
			var url = genUrl();
			$("#url").html(url);
			$(".url_pad").show();
		});

		$("#url_ok").bind("click", function(){
			$(".url_pad").hide();
		});
		document.addEventListener("touchstart", function(e){
			//e.preventDefault();
			touchX = e.touches[0].clientX;
		});
		document.addEventListener("touchmove", function(e){
			var target = e.target;
			e.preventDefault();
			if(target.className.indexOf("slip") >= 0){
				var moveX = e.touches[0].clientX - touchX;
				var str = $(target).css("left");
				var num = str.substr(0, str.indexOf('%'));
				var left = parseFloat(num);
				var percentage = moveX / 250 * 100;
				left = left + percentage;
				if(left >= SLIP_START && left <= SLIP_END){
					$(target).css("left", left + "%");
					var id = target.parentNode.id;
					setColorValue(id, left);
				}
				touchX = e.touches[0].clientX;
			}
		});
		document.addEventListener("touchend", function(e){
			//e.preventDefault();
			var target = e.target;
			if(target.className.indexOf("slip") >= 0){
				var moveX = e.changedTouches[0].clientX - touchX;
				var str = $(target).css("left");
				var num = str.substr(0, str.indexOf('%'));
				var left = parseFloat(num);
				var percentage = moveX / 250 * 100;
				left = left + percentage;
				if(left >= SLIP_START && left <= SLIP_END){
					$(target).css("left", left + "%");
					var id = target.parentNode.id;
					setColorValue(id, left);
				}
			}
		});

		window.onresize = function(){
			drawLed();
		}
	}
	
	return {
		init:function(){
			drawLed();
			bindEvents();

			//show from get params
			var params = u.getReqParams();
			var msg = params.msg,
				bgColor = params.bg_color,
				wColor = params.w_color;
			if(!msg){
				msg = "Happy Birthday To HUI MIN. Warmest wish you all happiness, health and the finest things in your life.";
			}
			if(bgColor){
				led.setOffColor(bgColor);
			}
			if(wColor){
				led.setOnColor(wColor);
			}
			led.showBlank();
			led.writeMessage(msg);
			led.clearAni();
			led.resetPos();
			led.scrollMsg(msg);
		}
	}
	
});	