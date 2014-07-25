//Variables globales utilisées par tout le programme
var SETTING,
	TEXT, //L'objet contenant les string de l'interface
	BTN_ADDLIST = document.getElementsByClassName("btn_addList")[0];
	BROWSER = "";

(function(){
	//On charge les paramètres
	util.getJSON("setting.json", function(response){
		SETTING = JSON.parse(response);
		if(typeof(console.clear) != "undefined"){
			console.clear();
		}
	})
	
	// On cherche le navigateur
	var userAgent = navigator.userAgent;
	var isChrome = /chrome/gi;
		
	if(isChrome.test(userAgent)){
		BROWSER = "chrome";
	}else{
		var isOpera = /(opera|\sopr)/gi; 
		
		if(isOpera.test(userAgent)){
			BROWSER = "opera";
		}else{
			var isMSIE = /(msie|trident)/gi; // On vérifie s'il y a la signature MSIE d'internet explorer ou "Trident", son moteur de rendu.
		
			if(isMSIE.test(userAgent)){
				BROWSER = "msie";
			}else{
				var isFirefox = /firefox/gi; // On vérifie s'il y a la signature MSIE d'internet explorer ou "Trident", son moteur de rendu.
		
				if(isFirefox.test(userAgent)){
					BROWSER = "firefox";
				}else{
					var isSafari = /safari/gi;
			
					if(isSafari.test(userAgent)){
						BROWSER = "safari";
					}
				}
			}
		}
	}
	
	//For now there are troubles with MSIE
	if(BROWSER == "msie"){
		var msgEN = "[en]\nFor now the application isn't completely \ncompatible with Internet Explorer, use \nrather Firefox, Google Chrome, Safari or Opera."
		var msgFR = "[fr]\nPour l'instant l'application n'est pas completement \ncompatible avec Internet Explorer, utilisez \nplutot Firefox, Google Chrome, Safari ou Opera."
		var msg = msgEN + "\n\n" + msgFR;
		alert(msg);
		console.warn(msg);	
	}
	
	//Si la langue est réglée sur "Auto", on la défini selon la langue du navigateur
	if(SETTING.lang == "auto" || SETTING.lang == "Auto" || SETTING.lang == "AUTO"){
		var isLong = /-/g;
		if(isLong.test(window.navigator.language)){
			var posEnd = window.navigator.language.indexOf("-");
			var language = window.navigator.language.substring(0, posEnd);
			SETTING.lang = language;
		}else{
			SETTING.lang = window.navigator.language;
		}
	}
	
	//On gère le hors-ligne
	if(SETTING.offline){
		var cool = document.getElementsByTagName("html")[0];
		cool.setAttribute("manifest", "offline.appcache");
		window.applicationCache.update();
	}

})()