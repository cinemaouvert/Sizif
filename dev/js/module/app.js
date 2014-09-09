/**
 * @file This file handles the settings and
 * defines variables used by the application.
 */

/** 
 * The "app" scope contains the variables
 * used by the application. For example,
 * it contains all the settings, it also contains 
 * the text displays on the interface.
 * @namespace
 */
app = {}; 
 
/** @memberof app */
app.SETTING;  

/** 
 * The object containing the text of the interface.
 * @memberof app 
 */
app.TEXT;

/** @memberof app */
app.BTN_ADDLIST = document.getElementsByClassName("btn_addList")[0];

/** 
 * The client browser.
 * @memberof app 
 */
app.BROWSER = "";

(function(){
	/** loads settings */
	util.getJSON("setting.json", function(response){
		app.SETTING = JSON.parse(response);
		if(typeof(console.clear) != "undefined"){
			console.clear();
		}
	})
	
	/** finds which is the client browser */
	var userAgent = navigator.userAgent;
	var isChrome = /chrome/gi;
		
	if(isChrome.test(userAgent)){
		app.BROWSER = "chrome";
	}else{
		var isOpera = /(opera|\sopr)/gi; 
		
		if(isOpera.test(userAgent)){
			app.BROWSER = "opera";
		}else{
			/** check if there is the MSIE signature from internet explorer or "Trident", is layout engine */
			var isMSIE = /(msie|trident)/gi; 
		
			if(isMSIE.test(userAgent)){
				app.BROWSER = "msie";
			}else{
				var isFirefox = /firefox/gi; 
		
				if(isFirefox.test(userAgent)){
					app.BROWSER = "firefox";
				}else{
					var isSafari = /safari/gi;
			
					if(isSafari.test(userAgent)){
						app.BROWSER = "safari";
					}
				}
			}
		}
	}
	
	/** for now there are troubles with MSIE */
	if(app.BROWSER == "msie"){
		var msgEN = "[en]\nFor now the application isn't completely \ncompatible with Internet Explorer, use \nrather Firefox, Google Chrome, Safari or Opera."
		var msgFR = "[fr]\nPour l'instant l'application n'est pas completement \ncompatible avec Internet Explorer, utilisez \nplutot Firefox, Google Chrome, Safari ou Opera."
		var msg = msgEN + "\n\n" + msgFR;
		alert(msg);
		console.warn(msg);	
	}
	
	/** if the "lang" setting is set on "auto", it defines it depending on the browser language. */
	var isAuto = /auto/gi;
	if(isAuto.test(app.SETTING.lang)){
		var isLong = /-/g;
		if(isLong.test(window.navigator.language)){
			var posEnd = window.navigator.language.indexOf("-");
			var language = window.navigator.language.substring(0, posEnd);
			app.SETTING.lang = language;
		}else{
			app.SETTING.lang = window.navigator.language;
		}
	}
})()