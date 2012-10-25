var myFont=JSON.parse('{"a":{"w":4,"h":"00699970"},"b":{"w":4,"h":"88e999e0"},"c":{"w":4,"h":"00788870"},"d":{"w":4,"h":"11799970"},"e":{"w":4,"h":"0069f870"},"f":{"w":4,"h":"34f44440"},"g":{"w":4,"h":"00699971e0"},"h":{"w":4,"h":"88e99990"},"i":{"w":1,"h":"be"},"j":{"w":2,"h":"455580"},"k":{"w":4,"h":"889aca90"},"l":{"w":1,"h":"fe"},"m":{"w":5,"h":"003d5ad6a0"},"n":{"w":4,"h":"00e99990"},"o":{"w":4,"h":"00699960"},"p":{"w":4,"h":"00e999e880"},"q":{"w":4,"h":"0079997110"},"r":{"w":4,"h":"00698880"},"s":{"w":4,"h":"007861e0"},"t":{"w":4,"h":"44f44430"},"u":{"w":4,"h":"00999970"},"v":{"w":4,"h":"00999960"},"w":{"w":5,"h":"002b5ad540"},"x":{"w":5,"h":"0022a22a20"},"y":{"w":4,"h":"00999971e0"},"z":{"w":4,"h":"00f248f0"}," ":{"w":3,"h":"00"},",":{"w":2,"h":"003d80"},".":{"w":2,"h":"003c00"},"A":{"w":5,"h":"74631fc620"},"B":{"w":5,"h":"f463e8c7c0"},"C":{"w":5,"h":"74610845c0"},"D":{"w":5,"h":"f46318c7c0"},"E":{"w":5,"h":"fc21e843e0"},"F":{"w":5,"h":"fc21e84200"},"G":{"w":5,"h":"746178c5c0"},"H":{"w":5,"h":"8c63f8c620"},"I":{"w":3,"h":"e924b8"},"J":{"w":5,"h":"084218c5c0"},"K":{"w":5,"h":"8ca98a4a20"},"L":{"w":5,"h":"84210843e0"},"M":{"w":5,"h":"8eeb18c620"},"N":{"w":5,"h":"8c7359c620"},"O":{"w":5,"h":"746318c5c0"},"P":{"w":5,"h":"f463e84200"},"Q":{"w":5,"h":"74631acdc0"},"R":{"w":5,"h":"f463ea4a20"},"S":{"w":5,"h":"7460e0c5c0"},"T":{"w":5,"h":"f908421080"},"U":{"w":5,"h":"8c6318c5c0"},"V":{"w":5,"h":"8c6318a880"},"W":{"w":5,"h":"8c6b5ad540"},"X":{"w":5,"h":"8c54454620"},"Y":{"w":5,"h":"8c54421080"},"Z":{"w":5,"h":"f8444443e0"}}');

var ledPad = (function(){
	var s = {},
		cnst = {
			PIXEL_SIZE : 10,
			PIXEL_GAP: 3,
			MARGIN:0,
			TOP:4,
			RADIUS:5
		},
		color = {
			offColor:'#331111',
			onColor:'#FF2222'
		},
		interval = 50, //sroll msg time interval
		pixelsHeight,  //pixels count on vertical direction
		pixelsWidth,   //pixels count on horizontal direction
		context,       //canvas context
		buffer,        //word pixels buffer
		sti,           //window set interval object
		scrollPos,     //scroll position
		message;       //scroll word

	var drawPixel = function(x, y){
		context.beginPath();
		context.arc(x, y, cnst.RADIUS, 0, 2*Math.PI, false);
		context.fill();
	}

	var parseLetter = function(l){
		l = parseInt(l, 16);

		var s = 128,
			d = [],
			i,
			r;

		for(i = 0; i < 8; i += 1){
			if(r = Math.floor(l/s)){
				l -= s;
			}
			s /= 2;
			d.push(r);
		}
		return d;
	}
		
	var getLetter = function(letter){
		var data = myFont[letter],
			bin = [],
			out = [];

		if(!data){
			return false;
		}

		var i = 0, l = data.h.length;
		for(; i < l; i += 2){
			var tmp = parseLetter(data.h.substr(i, 2));
			bin = bin.concat(tmp);
		}
		while(bin.length >= data.w){
			out.push(bin.splice(0, data.w));
		}
		if(out.length > 1 && out[out.length - 1].indexOf(1) == -1){
			out.pop();
		}
		return out;
	}

	return{
		init:function(pad){
			try{
				context = $(pad)[0].getContext("2d");
			} catch(e){
				throw new Error("You browser is not supported. HTML5 <CANVAS> required.");
				return;
			}

			pixelsWidth = parseInt(($(pad).width() - (cnst.MARGIN * 2)) / (cnst.PIXEL_SIZE + cnst.PIXEL_GAP));
			pixelsHeight = parseInt(($(pad).height() - (cnst.MARGIN * 2)) / (cnst.PIXEL_SIZE + cnst.PIXEL_GAP));
			cnst.TOP = (pixelsWidth > pixelsHeight) ? Math.floor(pixelsHeight / 3) : Math.floor(pixelsWidth / 3);
			this.showBlank();
			return true;
		},
		showBlank:function(){
			context.fillStyle = this.getOffColor();
		
			var pixelSize = cnst.PIXEL_SIZE + cnst.PIXEL_GAP,
				pixelRadius = cnst.PIXEL_SIZE / 2;
		
			for (var i = 0; i <= pixelsWidth; i++) {
				for (var k = 0; k <= pixelsHeight; k++) {
					var x = (i * pixelSize) + cnst.MARGIN + pixelRadius;
					var y = (k * pixelSize) + cnst.MARGIN + pixelRadius;
					drawPixel(x , y);
				}
			}
		},
		getOffColor:function(){
			return color.offColor;
		},
		getOnColor:function(){
			return color.onColor;
		},
		writeMessage:function(msg){
			if(typeof msg !== "string"){
				msg = msg.toString();
			}
			message = msg;

			//new buffer
			buffer = new Array(pixelsHeight);
			for(var p = 0; p < pixelsHeight; p += 1){
				buffer[p] = new Array();
			}

			var i = 0, l = msg.length;
			for(; i < l; i += 1){
				var letter = msg.charAt(i),
					data;
				letter = letter.replace(/[^a-zA-Z\s\.,]/g, "");

				if(letter == ""){
					continue;
				}
				if(data = getLetter(letter)){
					var charWidth = data[0].length;
					var k = 0;
					for(; k < pixelsHeight; k += 1){
						if(k >= data.length){
							for(var z = 0; z <= charWidth; z += 1){
								buffer[k].push(0);
							}
						} else {
							buffer[k] = buffer[k].concat(data[k], [0]);
						}
					}
				}
			}
		},
		renderMsg:function(pos){
			var pixelsSize = cnst.PIXEL_SIZE + cnst.PIXEL_GAP;
			var ms = pixelsWidth - pos;

			if(pixelsWidth > pixelsHeight){
				for(var i = 0; i < pixelsWidth; i += 1){
					for(var j = 0; j < pixelsHeight; j += 1){
						context.fillStyle = this.getOffColor();
						if(i >= ms){
							if(j >= cnst.TOP){
								if(buffer[j - cnst.TOP][i - ms] == 1){
									context.fillStyle = this.getOnColor();
								}
							}
						}
						var x = (i * pixelsSize) + cnst.MARGIN + cnst.PIXEL_SIZE / 2;
						var y = (j * pixelsSize) + cnst.MARGIN + cnst.PIXEL_SIZE / 2;
						drawPixel(x, y);
						
					}
				}
			} else {
				for(var i = 0; i < pixelsHeight; i += 1){
					for(var j = pixelsWidth - 1; j >= 0; j -= 1){
						context.fillStyle = this.getOffColor();
						if(i >= ms){
							if((pixelsWidth - j) >= cnst.TOP){
								if(buffer[pixelsWidth - cnst.TOP - j][i - ms] == 1){
									context.fillStyle = this.getOnColor();
								}
							}
						}
						var x = (i * pixelsSize) + cnst.MARGIN + cnst.PIXEL_SIZE / 2;
						var y = (j * pixelsSize) + cnst.MARGIN + cnst.PIXEL_SIZE / 2;
						drawPixel(y, x);
					}
				}
			}
			
		},
		scrollMsg:function(){
			var that = this;
			sti = window.setInterval(function(){
				if(buffer && scrollPos >= pixelsWidth + buffer[0].length){
					scrollPos = 0;
				} else {
					scrollPos++;
				}
				that.renderMsg(scrollPos);
			}, interval);
		},
		clearAni:function(){
			if(sti){
				window.clearInterval(sti);
			}
		},
		resetPos:function(){
			scrollPos = 0;
		},
		speedUp:function(){
			if(interval >= 10){
				interval -= 5;
			}
		},
		speedDown:function(){
			if(interval <= 1000){
				interval += 5;
			}
		},
		setOnColor:function(val){
			color.onColor = val;
		},
		setOffColor:function(val){
			color.offColor = val;
		},
		getMsg:function(){
			return message;
		}
	}
});