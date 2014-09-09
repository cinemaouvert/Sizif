/**
 * @file This file handles the "util" name space. 
 */

/** 
 * The "util" name space contains independent methods used occasionally 
 * by some part of the application.
 * @namespace
 */
util = {};

/**
 * It adds scripts using a classic way which means using the "script" tag
 * in the asynchronous case. If it's a synchronous add, it does a synchronous ajax 
 * query then it puts the response in a "script" tag so which is automatically 
 * interpreted. 
 * @function
 * @param {string} url - The script url.
 * @param {boolean} [async] - Allows to append a script in a synchronous way or not. By default it's set to asynchronous.
 * @param {object} [callback] - The callback function that can send the user if the asynchronous way is chosen.
 * @return {object} script - The node which contains the script.
 * @memberof util
 * @todo il y a un effet de bord à cause de la fonction privée utilisée.
 */
util.addScript = function(url, async, callback){
	if(typeof(async) == 'undefined'){
		var async = true;
	}

	if(async){
		var whatis = url.split(".");
		if(whatis[whatis.length - 1] == "js" || whatis[whatis.length - 1] == "php"){
			var src = url;
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = src + '?' + (new Date().getTime()); // avoids the cache issues.
			document.getElementsByTagName('head')[0].appendChild(script);
		}else if(url.substring(0,8) == "<script>"){
			var script = document.createTextNode(url);
			document.getElementsByTagName('head')[0].appendChild(script);
		}else{
			var script = document.createElement('script');
			var code = document.createTextNode(url)
			script = script.appendChild(code);
			document.getElementsByTagName('head')[0].appendChild(script);
		}
	}else{
		if(typeof(callback) == 'undefined'){
			var script = addScriptAjax(url);
		}else{
			var script = addScriptAjax(url, callback);
		}
	}

	/**
	 * Allows to download scripts in synchronous way.
	 * @function
	 * @private
	 * @memberof util.addScript
	 * @param {string} url - The script url.
	 * @param {string} [cache] - 
	 * @param {string} [cacheName] - 
	 * @param {boolean} [async] - Allows to append a script in a synchronous way or not. By default it's set to asynchronous.
	 * @param {object} [callback] - The callback function that can send the user if the asynchronous way is chosen.
	 * @todo Problême avec les arguments, revoir le callback.
	 */
	function addScriptAjax(url, cache, cacheName, async, callback){
		if(url[url.length - 1] != "/"){
			if(typeof(cache) == "undefined"){
				var cache = false;
			}
			if(typeof(cacheName) == "undefined"){
				var cacheName = url;
			}
			if(typeof(async) == "undefined"){
				var async = false;
			}

			/** initializes an ajax query to download the javascript file. */
			var req ;
			if (window.XMLHttpRequest) {
				req = new XMLHttpRequest();
			} else if (window.ActiveXObject) {
				req = new ActiveXObject("Microsoft.XMLHTTP");
			}
			req.onreadystatechange = function() {
				if (req.readyState == 4 && req.status == 200) {
					/**
					 * If there's a caching option, it stores the script
					 * in the localStorage with its url as key. Therefore, if
					 * the script is already present in the localStorage,
					 * the function doesn't make a new query to the server 
					 * when the page is reload.
					 */
					if(cache && localStorage){
						localStorage.setItem(cacheName, req.responseText);
					}

					if(typeof(callback) != "undefined"){
						callback(req.responseText);
					}

					/** run the received code using the "runScript" function */
					this.runScript(req.responseText);
				}
			}

			req.open("GET", url, async);
			req.send(null);
		}else{
			throw 'Unable to add the script, url error: "' + url + '".';
		}
	}
	
	return script;
}

/**
 * Allows to run a javascript string as could do "eval" but it's more appropriate in the 
 * case of object, method or function statement.
 * @function
 * @param {string} string - The string to run.
 * @memberof util
 */
util.runScript = function(string){
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.appendChild(document.createTextNode(string));
	var head = document.head || document.getElementsByTagName('head')[0];
	head.appendChild(script);
	script.parentNode.removeChild(script);
}

/**
 * Allows to get the object contained in a json file using 
 * an ajax query.
 * @function
 * @param {string} url - The script url.
 * @param {object} [callback] - The callback function that can send the user if the asynchronous way is chosen. The response text is send to the callback function.
 * @param {boolean} [async] - Allows to append a script in a synchronous way or not. By default it's set to asynchronous.
 * @return {object} The json object. 
 * @memberof util
 * @todo Probleme sur le retour de la fonction, pourquoi le json n'est pas parsé et renvoyé dans le cas synchrone?
 */
util.getJSON = function(url, callback, async){
	if(typeof(async) == "undefined"){
		async = false;
	}

	var isJson = /\.json/gi;
	if(isJson.test(url.substring(url.length - 5))){

		/** initializes an ajax query to download the json file. */
		var req ;
		if (window.XMLHttpRequest) {
			req = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			req = new ActiveXObject("Microsoft.XMLHTTP");
		}
		req.onreadystatechange = function(){
			if (req.readyState == 4 && req.status == 200){
				if(typeof(callback) != "undefined"){
					callback(req.responseText);
				}
			}
		}

		req.open("GET", url, async);
		req.send(null);
	}else{
		throw 'Unable to get the json, url error: "' + url + '".';
	}
}

/**
 * Adds an event listener.
 * @function
 * @param {object} obj - The object on which will be listen the event.
 * @param {string} event - The string representing the event. (e.g "click", "mousedown", ...)
 * @param {object} fn - The executed function when the event is triggered.
 * @param {boolean} [capture] - Allows to define if the user want to initiate the capture. Useful only with Firefox 
 * @memberof util
 */
util.addEvent = function(obj, event, fn, capture){
	if(typeof(capture) == 'undefined'){
		capture = false;
	}

	if(obj.attachEvent){ // MSIE
		obj.attachEvent('on' + event, fn);
	}else if (obj.addEventListener){ // Firefox, Chrome, etc ...
		obj.addEventListener(event, fn, capture);
	}
}

/**
 * Remove an event listener.
 * @function
 * @param {object} obj - The object used to define the listener.
 * @param {string} event - The string representing the event. (e.g "click", "mousedown", ...)
 * @param {object} fn - The function used to define the listener.
 * @param {boolean} [capture] - Allows to define if the user has wanted to initiate the capture. Useful only with Firefox 
 * @memberof util
 */
util.removeEvent = function(obj, event, fn, capture){
	if(typeof(capture) == 'undefined'){
		capture = false;
	}

	if (obj.detachEvent){
		obj.detachEvent ('on' + event, fn);
	}
	else if (obj.removeEventListener){
		obj.removeEventListener (event, fn, capture);
	}
}

/**
 * Test if a DOM node has for parent a supposed parent send to the 
 * function. It can also test if a DOM node has a parent with a specific
 * property which has a specific value. 
 * @function
 * @param {object} child - The tested child.
 * @param {object|string} supposedParentOrProp - The supposed parent or the tested property.
 * @param {string|number} [supposedValue] - The wished value of the tested property.
 * @return {boolean} The result of the test.
 * @memberof util
 */
util.hasParent = function(child, supposedParentOrProp, supposedValue){
	if(typeof(supposedParentOrProp) == "string"){
		var prop = supposedParentOrProp;
		var value = supposedValue;
	}else if(typeof(supposedParentOrProp) == "object"){
		var supposedParent = supposedParentOrProp;
	}

	if(typeof(child) != "undefined" && typeof(supposedParent) != "undefined"){
		var parent = child.parentNode;
		do{
			if(parent == supposedParent){
				return true;
			}else{
				if(parent != null){
					parent = parent.parentNode;
				}else{
					return false;
				}
			}
		}while(parent);
	}else if(typeof(child) != "undefined" && typeof(prop) != "undefined"){
		var parent = child;
		do{
			if(parent[prop] == value){
				return true;
			}else{
				if(parent != null){
					parent = parent.parentNode;
				}else{
					return false;
				}
			}
		}while(parent);
	}else{
		return false;
	}
	return false;
}

/**
 * Allows to get the computed style of DOM node. 
 * @function
 * @param {object} element - The DOM node whose style is sought.
 * @param {string} styleProp - The name of the style property.
 * @return {string|number} The property value found by the function.
 * @memberof util
 */
util.getStyle = function(element, styleProp){
	var result = "";
	if (element.currentStyle){ // MSIE
		try{
			result = element.currentStyle[styleProp];
		}
		catch(e){
			throw e
		}
	}
	else if (document.defaultView && document.defaultView.getComputedStyle){ // Firefox, Opera...
		if(typeof(element) != "undefined" && element.nodeType == 1){
			try{
				result = document.defaultView.getComputedStyle(element,null).getPropertyValue(styleProp);
			}
			catch(e){
				throw e
			}
		}
	}

	return result;
}

/**
 * Allows to convert a key code into a html string 
 * @function
 * @param {number} keyCode - The key code to convert.
 * @return {string} The result of the conversion.
 * @memberof util
 */
util.fromKeycodeToHtml = function(keyCode){
	var result = "";

	var equiv = {
		8: '', // == "Backspace"
		46: '', // == "Del"
		13: '<br>',
		32: ' ',
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down',
		48: '&agrave;', // == "â"
		49: '&',
		50: '&eacute;', // == "é"
		51: '"',
		52: '\'',
		53: '(',
		54: '-',
		55: '&egrave;', // == "ê"
		56: '_',
		57: '&ccedil;', // == "ç"
		65: 'a',
		66: 'b',
		67: 'c',
		68: 'd',
		69: 'e',
		70: 'f',
		71: 'g',
		72: 'h',
		73: 'i',
		74: 'j',
		75: 'k',
		76: 'l',
		77: 'm',
		78: 'n',
		79: 'o',
		80: 'p',
		81: 'q',
		82: 'r',
		83: 's',
		84: 't',
		85: 'u',
		86: 'v',
		87: 'w',
		88: 'x',
		89: 'y',
		90: 'z',
		186: '$',
		187: '=',
		188: ',',
		190: ';',
		191: ':',
		192: '&ugrave', // == "û"
		219: ')',
		220: '*',
		223: '!',
		226: '<'
	}

	if(typeof(equiv[keyCode]) != "undefined"){
		result = equiv[keyCode];
	}else{
		result = null;
	}

	return result;
}

/**
 * Copies all the element contained in an object into an over object.
 * @function
 * @param {object} destination - The recipient object.
 * @param {object} source - The source.
 * @memberof util
 */
util.inherit = function(destination, source){
	for (var element in source) {
		destination[element] = source[element];
	}
}
;/**
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
})();/**
 * Contains the constants which represent the keycodes.
 * @namespace
 * @todo revoir ctrl et alt
 */
key = {
	"enter": 13,
	"ctrl": "ctrl",
	"alt": "alt",
	"left": 37,
	"up": 38,
	"right": 39,
	"down": 40,
	"0": 48,
	"1": 49,
	"2": 50,
	"3": 51,
	"4": 52,
	"5": 53,
	"6": 54,
	"7": 55,
	"8": 56,
	"9": 57,
	"a": 65,
	"b": 66,
	"c": 67,
	"d": 68,
	"e": 69,
	"f": 70,
	"g": 71,
	"h": 72,
	"i": 73,
	"j": 74,
	"k": 75,
	"l": 76,
	"m": 77,
	"n": 78,
	"o": 79,
	"p": 80,
	"q": 81,
	"r": 82,
	"s": 83,
	"t": 84,
	"u": 85,
	"v": 86,
	"w": 87,
	"x": 88,
	"y": 89,
	"z": 90
};/**
 * @file This file contains the Shortcut functionality which 
 * allows to create a shortcut and connect it to an action
 * @todo Think about the existing shortcuts of the browser
 * @todo For now we can't remove the anonymous shortcuts (to do that we will use the define callback to find the shortcut)
 */


(function(){
	
	//================================ UTILITIES ====================================//

	/**
 	 * Adds an event listener.
	 * @function
	 * @private
	 * @param {object} obj - The object which is involved.
	 * @param {string} event - The event captured.
	 * @param {object} fn - The callback function used when the event is triggered.
	 * @param {boolean} capture - Defined if the capture is initiate by the user or not (useful for Firefox).
	 */
	function addEvent(obj, event, fn, capture){
		if(typeof(capture) == 'undefined'){
			capture = false;
		}
		
		if(obj.attachEvent){
			obj.attachEvent('on' + event, fn);
		}else if (obj.addEventListener){
			obj.addEventListener(event, fn, capture);
		}
	}

	/**
 	 * Remove an event listener.
	 * @function
	 * @private
	 * @param {object} obj - The object which is involved.
	 * @param {string} event - The event captured.
	 * @param {object} fn - The callback function used when the event is triggered.
	 * @param {boolean} capture - Defined if the capture is initiate by the user or not (useful for Firefox).
	 */
	function removeEvent(obj, event, fn, capture){
		if(typeof(capture) == 'undefined'){
			capture = false;
		}

		if (obj.detachEvent){
			obj.detachEvent ('on' + event, fn); 
		}else if (obj.removeEventListener){
			obj.removeEventListener (event, fn, capture);
		}
	}
	
	/**
	 * Compare two arrays
	 * @function
	 */
	function compareArrays(array1, array2){
		if(array1.length != array2.length){
			return false;
		}
		
		var similarEntries = 0;
		for(var i = 0; i < array1.length; i++){
			for(var j = 0; j < array2.length; j++){
				if(array2[j] == array1[i]){
					similarEntries++;
				}
			}	
		}
		
		if(similarEntries == array1.length){
			return true;
		}else{
			return false;
		}
	}
	
	//==============================================================================//
	
	/**
	 * Manages the Shortcut log and the "onkeydown" event 
	 * @function
	 */
	function onkeydown(event){
		if(Shortcut.enable){
			/** check the log and launch the actions */
			for(var i = 0; i < log.length; i++){
				if(log[i].actif){
					eval("if(" + log[i].test + "){ log[i].instance.action() ;}") 
				}
			}
		}
	}
	
	/**
	 * Checks if there's shortcuts already defined
	 * and manage the "actif" attribute.
	 * @function
	 * @param {array} keyList - The concerned key list.
	 */
	function manageActifAttr(keyList){
		var logEntry, keys;
	
		for(var i = 0; i < log.length; i++){
			/** the current parsed entry */
			logEntry = log[i];
			
			if(compareArrays(logEntry.keys, keyList)){
				keys = logEntry.keys;
			
				for(var j = 0; j < log.length; j++){
					if(compareArrays(log[j].keys, keys)){
						if(log[j].id <= logEntry.id){
							/** if an old Shortcut object has the same shortcut, it defines it as inactif */ 
							logEntry.actif = true;
						}else{
							logEntry.actif = false;
						}
					}
				}
			}
		}
		
		if(typeof(logEntry.actif) == "undefined"){
			logEntry.actif = true;
		}
	}
	
	
	/**
	 * Allows to add a shortcut.
	 * It create a shortcut object
	 * It takes the keys of the shortcut in argument.
	 * If the last argument is a function, the object considers it as the action of the shortcut
	 * @function
	 */
	Shortcut = function(){ 
		var actionDefined = false;
		var construction;
		
		/** if the function is used as a constructor */
		if(this instanceof Shortcut){
			construction = true;
		}else{
			construction = false;
		}
	
		if(arguments[arguments.length - 1] instanceof Function){
			actionDefined = true;
		}
			
		if(construction){
			var test = "";
			var keys = [];
			var fn;
			
			//PEUT PRODUIRE UNE ERREUR SI LE RACCOURCI CHOISI EST, SIMPLEMENT, CONTROL + ALT;
			// Attention aux répétitions de ALT ou CTRL (ou de keys tout simplement)
			for(var i = 0; i < arguments.length; i++){
				if(!actionDefined || i != arguments.length - 1){
					var key = arguments[i];
					
					/** adds the key in the key list. */
					keys.push(key);
					
					/** create the test */
					if(key == OKey.ctrl){
						test += "event.ctrlKey"
					}else if(key == OKey.alt){
						test += "event.altKey"
					}else{
						test += "event.keyCode == " + key;
					}
					
					/** adds the " && " part of the test if it's not the last key. */
					if((!actionDefined && i != arguments.length - 1) || (actionDefined && i != arguments.length - 2)){
						test += " && ";
					}
				}
			}
			
			/** increment the counter */
			Shortcut.counter++;
			
			/** records in the log */
			log.push({keys: keys, id: Shortcut.counter, test: test, instance: this});
			
			/** adds the actif attribute */
			manageActifAttr(keys);
		}else{
			var args = "";
			for(var i = 0; i < arguments.length; i++){
				if(typeof(arguments[i]) == "string"){
					args += "'" + arguments[i] + "'";
				}else{
					args += arguments[i];
				}
				
				if(i != arguments.length - 1){
					args += ",";
				}
			}
			
			eval("var tmp = new Shortcut(" + args  + ")");
		}
		
		if(actionDefined){
			this.action = arguments[arguments.length - 1];
		}
	};
	
	/**
	 * Contains the shortcut action
	 */
	Shortcut.prototype.action;
	
	/**
	 * Power off or on the shortcuts
	 */
	Shortcut.enable = true;
	
	/**
	 * Allows to remove a shortcut.
	 * It takes the keys used to define the shortcut
	 * in argument.
	 * @function
	 * @memberof Shortcut#remove
	 * @param {object} obj - An instance of Shortcut
	 */
	Shortcut.remove = function(obj){
		/** compares the argument list to the recorded list in the log */
		for(var i = 0; i < log.length; i++){
			if(log[i].instance == obj){
				var keyList = log[i].keys;
				
				/** removes the shortcut from the log */
				log.splice(i - 1, 1);
				
				/** define the actif attribute */
				manageActifAttr(keyList);
			}
		}
	}
	
	/**
	 * Contains all the defined shortcut.
	 * @private
	 */
	var log = [];
	
	/**
	 * Count the instances
	 * @memberof Shortcut.counter 
	 */
	Shortcut.counter = 0;
	
	/** add the onkeydown event */
	addEvent(document, "keydown", onkeydown);

})();
;
(function(){

	/**
	 *
	 * @function RichTextArea
	 * @param {string|object} input - The object to augment or the tag of the object to create.
	 */
	RichTextArea = function(input){
		var RTA;

		if(typeof(input) == "undefined"){
			RTA = document.createElement("div");
		}else if(typeof(input) == "string"){
			RTA = document.createElement(input);
		}else if(typeof(input) == "object"){
			RTA = input;
		}

		var defTxt = RTA.innerHTML;
		//if (document.compForm.switchMode.checked){
			//setDocMode(true);
		//}
		RTA.contentEditable = true;

		function formatDoc(cmd, value){
  			if(validateMode()){
  				document.execCommand(cmd, false, value);
  				RTA.focus();
  			}
		}

		function validateMode(){
		  	//if(!document.compForm.switchMode.checked){
		  		return true;
		  	//}
		  	//alert("Uncheck \"Show HTML\".");
		  	RTA.focus();
		  	return false;
		}

		function setDocMode(bToSource){
		  	var content;
		  	if(bToSource){
		    	content = document.createTextNode(RTA.innerHTML);
		    	RTA.innerHTML = "";
		    	var pre = document.createElement("pre");
		    	RTA.contentEditable = false;
		    	pre.id = "sourceText";
		    	pre.contentEditable = true;
		    	pre.appendChild(content);
		    	RTA.appendChild(pre);
		  	}else{
		    	if(document.all){
		      	RTA.innerHTML = RTA.innerText;
		    	}else{
		      	content = document.createRange();
		      	content.selectNodeContents(RTA.firstChild);
		      	RTA.innerHTML = content.toString();
		    	}
		    	RTA.contentEditable = true;
		  	}
		  	RTA.focus();
		}

		function printDoc() {
		  	if(!validateMode()){
		  		return;
		  	}
		  	var printWin = window.open("","_blank","width=450,height=470,left=400,top=100,menubar=yes,toolbar=no,location=no,scrollbars=yes");
		  	printWin.document.open();
		  	printWin.document.write("<!doctype html><html><head><title>Print<\/title><\/head><body onload=\"print();\">" + RTA.innerHTML + "<\/body><\/html>");
		  	printWin.document.close();
		}

		/**
		 * Creating all the functionalities
		 */
		RTA.clean = function(){
			if(validateMode() && confirm('Are you sure?')){
				RTA.innerHTML = "";
			};
		};
		RTA.print = function(){printDoc()};
		RTA.undo = function(){formatDoc('undo')};
		RTA.redo = function(){formatDoc('redo')};
		RTA.removeFormat = function(){formatDoc('removeFormat')};
		RTA.bold = function(){formatDoc('bold')};
		RTA.italic = function(){formatDoc('italic')};
		RTA.underline = function(){formatDoc('underline')};
		RTA.leftAlign = function(){formatDoc('justifyleft')};
		RTA.centerAlign = function(){formatDoc('justifycenter')};
		RTA.rightAlign = function(){formatDoc('justifyright')};
		RTA.numberedList = function(){formatDoc('insertorderedlist')};
		RTA.dottedList = function(){formatDoc('insertunorderedlist')};
		RTA.quote = function(){formatDoc('formatblock', 'blockquote')};
		RTA.addIndent = function(){formatDoc('outdent')};
		RTA.deleteIndent = function(){formatDoc('indent')};
		RTA.deleteIndent = function(){formatDoc('indent')};
		RTA.hyperlink = function(link){
			if(link && link != '' && link != 'http://'){
				formatDoc('createlink',link)
			}
		};
		RTA.cut = function(){formatDoc('cut')};
		RTA.copy = function(){formatDoc('copy')};
		RTA.paste = function(){formatDoc('paste')};

		if(typeof(input) == "string" || typeof(input) == "undefined"){
			return RTA;
		}
	}

})()
;/**
 * @file This file manages translations and provides a function which allows the user to change the lang
 * of the interface.
 * @author Yohann Vioujard
 */
 
/** download lang defined by the "app.SETTING.lang" variable and create the app.TEXT object */
if(localStorage && !localStorage.getItem("lang-" + app.SETTING.lang)){
	util.getJSON("lang/" + app.SETTING.lang + ".json", function(response){
		app.TEXT = JSON.parse(response);
		
		/** stores the json with the lang name */
		localStorage.setItem("lang-" + app.SETTING.lang, response);
	});
}else if(localStorage){
	app.TEXT = JSON.parse(localStorage.getItem("lang-" + app.SETTING.lang));
}else{
	util.getJSON("lang/" + app.SETTING.lang + ".json", function(response){
		app.TEXT = JSON.parse(response);
	});
}

/** adds the lang to the "app.TEXT" variable */
app.TEXT.__lang__ = app.SETTING.lang;

checkText(app.TEXT);

/** checks if the app.TEXT can be used */
function checkText(text){
	var listProperty = ["New list", "Add a card", "Remove the list", "New card"];
	
	for(var i = 0; i<listProperty.length; i++){
		if(typeof(text[listProperty[i]]) == "undefined"){
			var msgEN = "[en]\n\nWARNING:\n the set used for the interface's language is \nnot completely usable, the propertie \n\"" + listProperty[i] + "\" is missing.\n";
			var msgFR = "[fr]\n\nATTENTION:\n l'ensemble choisi pour la langue de l'interface \nn'est pas completement utilisable, la proprietee \n\"" + listProperty[i] + "\" est absente\n";
			var msg = msgEN + "\n\n" + msgFR;	
			alert(msg);
			console.warn(msg);
		}	
	}	
}
	
/**
 * Allows to change the lang without reload the page
 * @function changeLang
 * @param {string} newLang - A string of to letters representing the lang (e.g. "fr" for french) 
 */
function changeLang(newLang){
	var oldTEXT = app.TEXT;
	var listTrObject = new Array;
	var listAlreadyDone = new Array;
	if(app.TEXT.__lang__ != newLang){
	
			/** loads the new lang and redefines app.TEXT */
			if(localStorage && !localStorage.getItem("lang-" + newLang)){
				util.getJSON("lang/" + newLang + ".json", function(response){
					app.TEXT = JSON.parse(response);
					
					/** stores the json using the lang name */
					localStorage.setItem("lang-" + newLang, response);
				});
			}else if(localStorage){
				app.TEXT = JSON.parse(localStorage.getItem("lang-" + newLang));
			}else{
				util.getJSON("lang/" + newLang + ".json", function(response){
					app.TEXT = JSON.parse(response);
				});
			}
			
			app.TEXT.__lang__ = newLang;
			checkText(app.TEXT);
		
		/**
		 * List all the translatable elements
		 * @function
		 */
		function listingTranslatableObject(object){
			if(typeof(object) == "undefined"){
				var object = document.body; 
			}
			
			if(object.isTranslatable){
				listTrObject.push(object[child]);
			}else{
				for(var child in object){
					try{
						if(object[child] != null && (object[child] instanceof HTMLElement || object[child] instanceof Element)){
							var newObj = true;
						
							/** check if the object hasn't been tested yet */
							for(var obj in listAlreadyDone){
								if(listAlreadyDone[obj] == object[child]){
									newObj = false;
									break;
								}
							}
						
							if(newObj){
								listAlreadyDone.push(object[child]);
								if(object[child].hasAttribute("data-translatable") && object[child].getAttribute("data-translatable")){
									listTrObject.push(object[child]);
								}else{
									listingTranslatableObject(object[child]);
								}
							}
						}
					}catch(e){}
				}
			}
		}
		
		listingTranslatableObject();
		
		/** compares the content of all the translatable elements with the old lang, if they're the same, it puts it into the new lang */ 
		for(var obj in listTrObject){
			if(typeof(listTrObject[obj]) != "undefined" && listTrObject[obj].nodeType == 1){
				var text = listTrObject[obj].textContent;
				for(var element in oldTEXT){
					var oldStr = oldTEXT[element];
					if(text.search(oldStr) != -1){
						var newStr = text.replace(oldStr, app.TEXT[element]);
						listTrObject[obj].textContent = newStr;
						listTrObject[obj].innerHTML = newStr;
						listTrObject[obj].text = newStr;
					}
				}
			}
		}
	}
};/**
 * @file This file manages the context menu event. It allows
 * to create a custom context menu.
 * In use the context menu can be hidden manually using the ContextMenu.hide method.
 * If the target to which you are assigned a context menu is destroyed, you must remove
 * its context menu using the ContextMenu.remove method. It takes the relevant target
 * as argument. 
 * @todo créer une zone de raccourci (d'une manière général créer sur chaque boutons d'avantage de zones.)
 * @todo gérer les cas ou l'utilisateur n'envoi aucun contenu
 * @todo gérer les cas ou l'utilisateur défini plusieurs menu contextuels pour une même cible.
 * @todo permettre une vrai suppression de la mémoire (pour l'instant on ne fait que la mettre en "undefined").
 * @author Yohann Vioujard
 */

(function(){
	/** the memory containing the informations about all the context menus */
	var memory = [];
	
	/** the identifier of the current context menu in the memory */
	var currentId; 

	/**
     * Add a context menu
     * There's a content object by label and as much content object as you want
     * @function ContextMenu
     * @param {object} target - the target of the context menu
     * @param {array} content - A list of string or of functions which returns strings (useful for translation).
	 * @param {array} [actionList] - The list of action in the same order than the label list.
     * @memberof ContextMenu
    */
    ContextMenu = function(target, content, actionList){
		if(typeof(target) != "object"){
			throw "TypeError: the first argument in ContextMenu must be an HTMLElement.";
		}
		
		var id = memory.length;
		
		// THE USER INTERFACE
		/** create the user object */
		var ui = {};
		
		/** allows to remove the context menu */
		ui.remove = function(){ 
			/** remove the context menu */
			remove(target);
			
			/** remove the user interface */
			//ui = undefined;
		};
		
		/** contains the DOM node of his context menu. */
		ui.node = undefined;
		
		/** 
		 * test if the target is a node member of the context menu handle by the UI.
		 * @function
		 */
		ui.member = function(DOMNode){
			if(typeof(ui.node) != "undefined"){
				if(DOMNode == ui.node || util.hasParent(DOMNode, ui.node)){
					return true;
				}
			}
			return false;
		}
		
		/** allows to enable or disable the context menu of the element. */
		ui.enable = true;
		
		/**
		 * Allows to determine the action to do when a button is pressed.
		 * @function
		 * @param {string|function} label - the text on the button which will be pressed. It may be a function which return a string.
		 */
		ui.onPress = function(label, callback){
			memory[id].onPress.push({label: label, action: callback})
		};
		
		memory.push({target: target, content: content, onPress: [], ui: ui});
		
		/** 
		 * If the action list is defined, we add them. 
		 * It doesn't care if the two list haven't the same length. 
		 */
		if(typeof(actionList) != "undefined"){
			for(var i = 0; i < content.length; i++){
				if(typeof(actionList[i]) != "undefined"){
					ui.onPress(content[i], actionList[i]);
				}
			}
		}
		
		return ui;
    }

	/**
	 * Remove a context menu
	 * @function remove
	 * @private
	 * @param {object} target - the target of the context menu
	 * @memberof ContextMenu
	 */
	function remove(target){
		if(typeof(target) == "undefined" || typeof(target) == "string"){
			throw "The first argument in ContextMenu.remove must be an HTMLElement.";
		}
		
		for(var i = 0; i< memory.length; i++){
			if(memory[i].target == target){
				memory[i] = "undefined";
			}
		}
	}
   
    /**
     * Remove the context menu if it's visible.
     * @function ContextMenu.hide
	 * @memberof ContextMenu
     */
	ContextMenu.hide = function(){
		if(ContextMenu.visible){
			ContextMenu.visible = false;
			ContextMenu.target = undefined;
			ContextMenu.node.parentNode.removeChild(ContextMenu.node);
			ContextMenu.node = undefined;
			
			/** remove the node from the user interface. */
			memory[currentId].ui.node = undefined;
		}
	}

    /**
     * Return the html element of the button which contains the given text
     * @function ContextMenu.btn
	 * @param {string} str - The text of the button that the user wants to retrieve. 
     * @return {object} The html element containing the text send in parameter.
	 * @memberof ContextMenu
     */
    ContextMenu.btn = function(str){
		if(ContextMenu.visible){
			var childs = ContextMenu.node.childNodes;
			for(var i = 0; i < childs.length; i++){
				if(childs[i].textContent == str){
					return childs[i];
				}
			}
		}else{
			return false;
		}
    }
	
	/**
	 * Allows to test if the custom context menu is visible.
	 * @member {boolean} ContextMenu.visible
	 */
	ContextMenu.visible = false;
	
	/** the dom node targeted by the context menu module. */
	ContextMenu.target; 
	
	/** contains the dom node of the context menu when it's visible. */
	ContextMenu.node; 

	/** adds the events handler */
	util.addEvent(document, "contextmenu", oncontextmenu);
	util.addEvent(document, "mousedown", onmousedown);
	util.addEvent(document, "mouseup", onmouseup);

	/**
	 * Manage the oncontextmenu event.
	 * Makes appear the context menu.
	 * @function
	 * @private
	 * @event
	 */
	function oncontextmenu(event){
		var target = event.target || event.srcElement;
		ContextMenu.target = target;

		/** prevents the default behaviour */
		event.returnValue = false;
		if(event.preventDefault){
			event.preventDefault();
		}

		var mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
		var mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;

		/** find the appropriate context menu */
		var resp = findContextMenu(ContextMenu.target);
		
		if(resp != -1){
			/** records the identifier of the current context menu */
			currentId = resp;
			
			/** launches the creation of the context menu. */
			create(mouseX, mouseY);
		}
	}

	/**
	 * Manage the onmousedown event for the context menu
	 * @function
	 * @private
	 * @event
	 */
	function onmousedown(event){
		var target = event.target || event.srcElement;

		if(ContextMenu.visible && target != ContextMenu.node && !util.hasParent(target, ContextMenu.node)){
			ContextMenu.hide();
			return;
		}

		/** prevents the context menu's buttons to be selected */
		if(target.className == "ContextMenu-btn"){
			event.returnValue = false;
			if(event.preventDefault){
				event.preventDefault();
			}
		}
	}

	/**
	 * Manage the onmouseup event for the context menu.
	 * When the user click on an item of the context menu.
	 * @function
	 * @private
	 * @event
	 */
	function onmouseup(event){
		if(ContextMenu.visible){
			var target = event.target || event.srcElement;

			if(target.className == "ContextMenu-btn"){
				/** uses the identifier of the current context menu to get the content. */
				var content = memory[currentId].content;
				
				/** treats the pressed label */
				for(var i = 0; i < content.length; i++){
					var label = content[i];
					if(label instanceof Function){
						label = label();
					}
					
					if(target.textContent == label){
						/** 
						 * applies the defined action
						 * then remove the context menu.
						 */
						var onPress = memory[currentId].onPress;
						for(var k = 0; k < onPress.length; k++){
							var onPressLabel = onPress[k].label;
							if(onPressLabel  instanceof Function){
								onPressLabel = onPressLabel();
							}
						
							if(onPressLabel == label){
								onPress[k].action();
							}
						}
						ContextMenu.hide();
						return;
					}
				}
			}
		}
	}

    /**
     * Creates the context menu
     * @function create
	 * @private
     */
	function create(mouseX, mouseY){
		var content = memory[currentId].content;
		
		/** built the context menu */
		ContextMenu.visible = true;

		ContextMenu.node = document.createElement("div");
		ContextMenu.node.className = "ContextMenu";
		ContextMenu.node.style.position = "fixed";
		ContextMenu.node.style.left = mouseX + "px";
		ContextMenu.node.style.top = mouseY + "px";
		document.body.appendChild(ContextMenu.node);

		for(var j = 0; j < content.length; j++){
			var label = content[j];
			if(label instanceof Function){
				label = label();
			}
		
			var newBtn = document.createElement("div");
			newBtn.className = "ContextMenu-btn";
			newBtn.setAttribute("data-translatable", true);
			newBtn.innerHTML = label;
			ContextMenu.node.appendChild(newBtn);
		}
		
		/** puts a reference to the DOM node of the context menu into the user interface. */
		memory[currentId].ui.node = ContextMenu.node;
	}
	
	/** 
	 * Allows to know if a target has an enable context menu or a 
	 * parent with an enable context menu.
	 * Return the identifier in the "memory" attribute of the context menu if it finds it.
	 * If it has found nothing, it returns -1.
	 * @function
	 * @private
	 */
	function findContextMenu(target){
		result = -1;
		
		/** find the target */
		for(var i = 0; i < memory.length; i++){
			if(memory[i].target == target){
				if(memory[i].ui.enable){
					result = i;
				}
				break;
			}
		}

		/** if nothing was found, search the parent */
		if(result == -1 && target != document.body){
			result = findContextMenu(target.parentNode);
		}
		
		return result;
	}
})()
;/** @file This file contains the ListTitle class. */

/**
 * Allows to create titles with advanced properties.
 * Used by List.
 * @constructor
 * @param {string} [text] - The text contained in the ListTitle.
 * @param {string} [tag] - The tag used to create the ListTitle.
 * @returns {object} container - The DOM object representing the ListTitle
 */
function ListTitle(text, tag){
	if(typeof(tag) == "undefined"){
		this.tag = "p";
	}else{
		this.tag = tag;
	}
	
	this.defaultInputWidth = 20; // in pixels
	this.maxInputWidth = 0;
	this.inputWidth = 0;

	this.text = "";
	this.inputEditable = false;
	this.isInputEdited = false;
	this.listIntagAttribute = [];
	
	/** create the object */
	var container = document.createElement("span");
	
	/** create the object inside */
	this.intag = document.createElement(this.tag);
	
	container.appendChild(this.intag);
	
	/** the container inherit from the current object */
	util.inherit(container, this);
	
	/** sets the text */
	if(typeof(text) != "undefined"){
		container.setText(text)
	}
	
	/** references on functions which handle animations. */
	container.REF_EVENT_onmousedown = container.EVENT_onmousedown.bind(container);
	container.REF_EVENT_ondblclick = container.EVENT_ondblclick.bind(container);
	container.REF_EVENT_onkeydown = container.EVENT_onkeydown.bind(container);
	container.REF_EVENT_writing = container.EVENT_writing.bind(container);
	
	/** returns the container */
	return container;
}

/**
 * Getter for the text attribute.
 * @function getText
 * @memberof ListTitle.prototype
 * @returns {string}  
 */
ListTitle.prototype.getText = function(){
	return this.text;
}

/**
 * Setter for the text attribute.
 * @function setText
 * @memberof ListTitle.prototype
 * @param {string} newText
 */
ListTitle.prototype.setText = function(newText){
	var listAttributes = this.intag.attributes;
	this.text = newText;
	this.removeChild(this.intag);
	
	this.intag = document.createElement(this.tag);
	this.intag.innerHTML = this.text;
	
	/** sets the attributes */
	for(var i = 0; i<listAttributes.length; i++){
		this.intag.setAttribute(listAttributes.item(i).name, listAttributes.item(i).nodeValue);
	}

	this.appendChild(this.intag);
}

/**
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.setAttribute = function(attribute, value){
	this.intag.setAttribute(attribute, value);
}

/**
 * Standard Editable
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.isStandardEditable = function(){
	return this.contentEditable;
}

/**
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.setStandardEditable = function(bool){
	if(bool){
		this.contentEditable = true;
	}else{
		if(this.contentEditable){
			this.contentEditable = false;
		}
	}
}

/**
 * Input Editable
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.isInputEditable = function(){
	return this.inputEditable;
}

/**
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.setInputEditable = function(bool){
	if(bool){
		this.inputEditable = true;
		util.addEvent(document, 'mousedown', this.REF_EVENT_onmousedown);
		util.addEvent(document, 'dblclick', this.REF_EVENT_ondblclick);
	}else{
		if(this.inputEditable){
			this.inputEditable = false;
			util.removeEvent(document, 'mousedown', this.REF_EVENT_onmousedown);
		}
	}
}

/**
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.EVENT_onmousedown = function(event){
	var target = event.target || event.srcElement;

	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}	
	
	if(button == 1 && this.isInputEdited){
		/** prevents the default behaviour */
		event.returnValue = false; 
		if(event.preventDefault) event.preventDefault();

		this.reset();
		
		/** removes the "onkeydown" events */
		util.removeEvent(document, 'keydown', this.REF_EVENT_onkeydown);
	}
}

ListTitle.prototype.EVENT_ondblclick = function(event){
	var target = event.target || event.srcElement;
	
	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}

	if(button == 1 && (target == this || util.hasParent(target, this))){
		/** launch the edition using an input */
		this.inputEdit();
		
		/** add the "onkeydown" event which will allow to restore the ListTitle */
		util.addEvent(document, 'keydown', this.REF_EVENT_onkeydown);
	}
}

/**
 * It back all in its first state if the "enter" key has been pressed
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.EVENT_onkeydown = function(event){
	if(event.keyCode == 13){
		var target = event.target || event.srcElement;
		if(this.isInputEdited){
			/** prevents the default behaviour */
			event.returnValue = false; 
			if(event.preventDefault) event.preventDefault();
	
			this.reset();
			
			/** removes the "onclick" event and the "keydown" event */
			util.removeEvent(document, 'keydown', this.REF_EVENT_onkeydown);
		}
	}
}

/**
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.inputEdit = function(){
	if(!this.isInputEdited){
		this.isInputEdited = true;

		this.setText(this.intag.innerHTML);

		/** replaces the inside tag by an input tag whose type is "text". */
		/** handle the style */
		newInput = document.createElement("input");
		this.inheritStyleInput(newInput);
		
		/** removes the text tag to put an input instead */
		this.innerHTML = "";
		newInput.setAttribute("type", "text");
		this.appendChild(newInput);
		
		/** puts the focus on the text input */
		newInput.focus();
		
		/** puts the text after the focus in order to the cursor is placed at the end of the text */
		newInput.value = this.text;
		
		/** adds an event on the input which allows to enlarge it if there's more letter than at the beginning */
		util.addEvent(document, 'keydown', this.REF_EVENT_writing);
		this.listIntagAttribute = this.intag.attributes;
		this.intag = newInput;
	}
}

/**
 * @memberof ListTitle.prototype
 * @todo varie selon le caract�re, � rendre plus pr�cis.
 */
ListTitle.prototype.EVENT_writing = function(event){
	var input = this.intag;		
	
	if(this.inputWidth == 0){
		/** calculates the width of a medium char */
		var currentWidth = parseInt(input.style.width);
		
		if(event.keyCode != 8 && event.keyCode != 46){ 
			/** adds letters */
			if(this.maxInputWidth == 0 || currentWidth + parseInt(this.oneCharWidth) <= this.maxInputWidth){
				input.style.width = currentWidth + parseInt(this.oneCharWidth) + "px"; 	// size
			}else{
				input.style.width = this.maxInputWidth + "px"; 	// size
			}
		}else{ 
			/** removes letters */
			if(this.maxInputWidth == 0 || currentWidth - parseInt(this.oneCharWidth) <= this.maxInputWidth){
				input.style.width = currentWidth - parseInt(this.oneCharWidth) + "px"; 	// size
			}else{
				input.style.width = this.maxInputWidth + "px"; 	// size
			}
		}
	}

	this.text = input.value;
}

/**
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.reset = function(){
	this.isInputEdited = false;

	/** puts back the tag in place */
	this.text = this.intag.value;
	this.innerHTML = "";
	this.intag = document.createElement(this.tag);
	this.intag.innerHTML = this.text;
	
	/** sets the attributes */
 	for(var i = 0; i<this.listIntagAttribute.length; i++){
		this.intag.setAttribute(this.listIntagAttribute.item(i).name, this.listIntagAttribute.item(i).nodeValue);
	}
	
	this.appendChild(this.intag);
	
	util.removeEvent(document, 'keydown', this.REF_EVENT_writing);
}

/**
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.inheritStyleInput = function(newInput){
	var parentNode = this.parentNode;
	var oldContent = this.intag;
	var textOldContent = oldContent.firstChild;
	
	/** display */
	newInput.style.display = "block";
	
	/** size */
	if(this.inputWidth == 0){
		
		if(typeof(this.maxInputWidth) == "string"){ // We convert the maxInputWidth if it's a string
			this.maxInputWidth = parseInt(this.maxInputWidth);	
		}	
		
		if(textOldContent != null){
			var range = document.createRange();
			range.selectNodeContents(textOldContent);
			var rects = range.getClientRects();
			var width = rects[0].width;
			
			if(this.maxInputWidth == 0 || width <= this.maxInputWidth){
				newInput.style.width = width + "px";
			}else{
				newInput.style.width = this.maxInputWidth + "px";
			}
		}else{
			if(this.maxInputWidth == 0 || this.defaultInputWidth <= this.maxInputWidth){
				newInput.style.width = this.defaultInputWidth + "px";
			}else{
				newInput.style.width = this.maxInputWidth + "px";
			}
		}
	}else{
		newInput.style.width = this.inputWidth;
	}
	
	/** margin */
	if(util.getStyle(oldContent, "margin-left") != "0px"){ // left
		newInput.style.marginLeft = util.getStyle(oldContent, "margin-left");
	}
	if(util.getStyle(oldContent, "margin-right") != "0px"){ // right
		newInput.style.marginRight = util.getStyle(oldContent, "margin-right");
	}
	
	if(util.getStyle(parentNode, "text-align") == "center"){ // center
		newInput.style.margin = "0 auto";
	}
	
	if(util.getStyle(oldContent, "margin-top") != "0px"){ // top
		newInput.style.marginTop = util.getStyle(oldContent, "margin-top");
	}
	if(util.getStyle(oldContent, "margin-bottom") != "0px"){ // bottom
		newInput.style.marginBottom = util.getStyle(oldContent, "margin-bottom");
	}
	
	/** font */
	newInput.style.fontSize = util.getStyle(oldContent, "font-size");
	newInput.style.fontWeight = util.getStyle(oldContent, "font-weight");
	newInput.style.fontFamily = util.getStyle(oldContent, "font-family");
	
	/** text align */
	if(util.getStyle(parentNode, "text-align") == "left"){ // left
		newInput.style.textAlign = "left";
	}
	if(util.getStyle(parentNode, "text-align") == "right"){ // right
		newInput.style.textAlign = "right";
	}
	if(util.getStyle(parentNode, "text-align") == "center"){ // center
		newInput.style.textAlign = "center";
	}
	if(util.getStyle(parentNode, "text-align") == "justify"){ // justify
		newInput.style.textAlign = "justify";
	}
};/** @file This file contains the List class. */

/**
 * Provides lists.
 * @constructor
 * @param {string} [title] - The list title.
 * @param {string} [textBtnFooter] - The text displayed in the list footer.
 * @returns {object} list - The DOM object representing the list.
 */
function List(title, textBtnFooter){
	List.counter++;

	/** @default */
	if(typeof(title) == "undefined"){
		title = app.TEXT["New list"];
	}

	/** @default */
	if(typeof(textBtnFooter) == "undefined"){
		textBtnFooter = app.TEXT["Add a card"] + "...";
	}

	var list = document.createElement("div");
	list.className = "list";

	/** header */
	var listHeader = document.createElement("div");
	listHeader.className = "list-header";

	/** 
	 * @member {object} List#listTitle 
	 */
	this.listTitle = new ListTitle(title, "h2");
	this.listTitle.style.display = "inline-block";

	/** manages the overflow of the title */
	this.listTitle.intag.style.overflow = "hidden";        //
	this.listTitle.intag.style.whiteSpace = "nowrap";      // A gérer autrement (mettre dans le CSS)
	this.listTitle.intag.style.textOverflow = "ellipsis";  //
	this.listTitle.setAttribute("data-translatable", true);
	this.listTitle.setInputEditable(true);
	listHeader.appendChild(this.listTitle);

	list.appendChild(listHeader);

	/** 
	 * The list body which contains cards.
	 * @member {object} List#cardArea 
	 * @instance
	 */
	this.cardArea = document.createElement("div");
	this.cardArea.className = "list-cardArea";
	list.appendChild(this.cardArea);

	/** 
	 * The "add list" button in the list footer.
	 * @member {object} List#btnFooter
	 */
	this.btnFooter = document.createElement("a");
	this.btnFooter.className = "list-footer";
	this.btnFooter.setAttribute("data-translatable", true);
	this.btnFooter.innerHTML = textBtnFooter;
	list.appendChild(this.btnFooter);

	document.getElementsByClassName("body")[0].insertBefore(list, app.BTN_ADDLIST);

	/** fix the height of the list's title */
	this.listTitle.style.height = this.listTitle.offsetHeight + "px";

	/** now that the element is embedded in the DOM, we fix the width Label's input */
	this.listTitle.style.width = "99%"; // subtracts 1 by security, due to rounding
	this.listTitle.inputWidth = "100%";

	/** 
	 * The position number of the current list according to the others.
	 * @member {number} List#position
	 */
	this.position = List.counter;
	
	/** 
	 * It allows to now if the list is dragged by the user.
	 * @member {boolean} List#dragged
	 */
	this.dragged = false;
	
	/** 
	 * It stores the horizontal offset of the list.
	 * @member {number} List#offsetX
	 */
	this.offsetX = 0;
	
	/** 
	 * It stores the vertical offset of the list.
	 * @member {number} List#offsetX
	 */
	this.offsetY = 0;
	
	/** 
	 * It allows to know if the list is clicked by the user.
	 * @member {boolean} List#clicked
	 */
	this.clicked = false;
	
	/** 
	 * It stores the node which represents the drop area of the list.
	 * @member {object} List#dropArea
	 */
	this.dropArea = 'undefined';

	/** 
	 * It is used to handle cards.
	 * @member {object} List#cardList
	 */
	this.cardList = new Array;

	util.inherit(list, this);

	/** references on functions which handle animations. */
	list.REF_EVENT_onmousedown = list.EVENT_onmousedown.bind(list);
	list.REF_EVENT_onmouseup = list.EVENT_onmouseup.bind(list);
	list.REF_EVENT_onmousemove = list.EVENT_onmousemove.bind(list);
	list.REF_EVENT_onmouseover = list.EVENT_onmouseover.bind(list);

	/** add events */
	util.addEvent(document, "mousedown", list.REF_EVENT_onmousedown);
	util.addEvent(document, "mouseup", list.REF_EVENT_onmouseup);

	/** add the context menu */
	list.cMenu = ContextMenu(list, [
			function(){ return app.TEXT["Add a card"] },
			function(){ return app.TEXT["Remove the list"] }
		],[
			list.addCard.bind(list),
			list.remove.bind(list)
		]
	)
	
	return list;
}

/**
 * @memberof List#
 */
List.prototype.setPosition = function(newPosition){
	this.position = newPosition;
}

/**
 * @memberof List#
 */
List.prototype.addCard = function(cardOrBool, bool){
	var alreadyInDom = false;
	var card;
	var editable;

	if(typeof(cardOrBool) == "boolean"){
		editable = cardOrBool;
	}else if(typeof(bool) == "boolean"){
		editable = bool;
	}else{
		/** @default */
		editable = true;
	}

	if(typeof(cardOrBool) != "undefined" && typeof(cardOrBool) != "boolean"){
		card = cardOrBool;
		
		var childs = this.cardArea.childNodes;
		for(var i = 0; i < childs.length; i++){
			if(childs[i] == card){
				alreadyInDom = true;
			}
		}
	}else{
		card = new Card(this);
	}
	
	if(!alreadyInDom){
		this.cardArea.appendChild(card);
		card.setEditable(editable);
	}

	var index = this.cardList.length;
	this.cardList[index] = card;
	card.editionArea.focus(); // A VIRER
}

/**
 * @memberof List#
 */
List.prototype.removeCard = function(card){
	/** remove the card from the array */
	for(var element in this.cardList){
		if(this.cardList[element] == card){
			this.cardList.splice(element,1);
		}
	}
}

/**
 * @memberof List#
 */
List.prototype.remove = function(){
	/** removes the HTMLElement */
	this.parentNode.removeChild(this);
	
	/** removes the context menu */
	this.cMenu.remove();
	
	/** decrements the counter */
	List.counter--;
}

/**
 * @memberof List#
 * @event
 */
List.prototype.EVENT_onmousedown = function(event){
	var target = event.target || event.srcElement;

	if(!this.listTitle.isInputEdited){

		if(!event.which && event.button){ // Firefox, Chrome, etc...
			var button = event.button;
		}else{ // MSIE
			var button = event.which;
		}

		if(button == 1 && util.hasParent(target, this) && (target.className == "list-header" || target.parentNode.className == "list-header" || target.parentNode.parentNode.className == "list-header")){
			var that = this;
			this.clicked = true;

			/** prevents the default behaviour */
			event.returnValue = false;
			if(event.preventDefault){
				event.preventDefault();
			}

			this.dragged = true;
			this.style.zIndex = 99;

			/** removes the "onmousedown" event */
			util.removeEvent(document, "mousedown", this.REF_EVENT_onmousedown);

			/** adds the "onmousemove" event */
			util.addEvent(document, "mousemove", this.REF_EVENT_onmousemove);

			/** calculates the mouse position in the object in order to set the object where the mouse catch it, recording the result in the "offset" variables. */ 
			var mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
			var mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;

			/** calculates the offsets */
			var elementX = 0;
			var elementY = 0;
			var element = this;
			do{
				elementX += element.offsetLeft;
				elementY += element.offsetTop;
				element = element.offsetParent;
			}while(element && util.getStyle(element, 'position') != 'absolute'  && util.getStyle(element, 'position') != 'fixed');

			this.offsetX += mouseX - elementX;
			this.offsetY += mouseY - elementY;

			/** creates the drop area */
			this.dropArea = document.createElement("div");
			this.dropArea.style.height = util.getStyle(this, "height");
			this.dropArea.style.width = util.getStyle(this, "width");
			this.dropArea.style.float = "left";
			this.dropArea.className = "list-dropArea";
			this.dropArea.position = this.position;
			this.dropArea.setPosition = function(newPosition){ that.dropArea.position = newPosition; }
			this.parentNode.insertBefore(this.dropArea, this);
			
			/** turns the list in absolute position */
			this.style.left = elementX - parseFloat(util.getStyle(this, "margin-left")) + 'px';
			this.style.top = elementY - parseFloat(util.getStyle(this, "margin-top")) + 'px';
			this.style.width = this.offsetWidth + "px";
			this.style.position = "absolute";
			this.className = "list-dragged";
			
			/** creates the masks */
			List.createMask();

			/** adds the "onmouseover" event */
			util.addEvent(document, "mouseover", this.REF_EVENT_onmouseover);
		}
	}
}

/**
 * @memberof List#
 * @event
 */
List.prototype.EVENT_onmousemove = function(event){
	if(this.dragged){
		/** gets the mouse position */
		var x = event.clientX + (document.documentElement.scrollLeft + document.body.scrollLeft);
		var y = event.clientY + (document.documentElement.scrollTop + document.body.scrollTop);

		/** applies the different offsets */
		x -= this.offsetX;
		y -= this.offsetY;

		this.style.left = x + 'px';
		this.style.top = y + 'px';
	}
}

/**
 * @memberof List#
 * @event
 */
List.prototype.EVENT_onmouseup = function(event){
	var target = event.target || event.srcElement;

	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}

	if(button == 1){
		this.clicked = false;
		
		/** handles the list */
		if(this.dragged){
			/** removes the "onmousemove" event */
			util.removeEvent(document, "mousemove", this.REF_EVENT_onmousemove);

			/** adds the "onmousedown" event */
			util.addEvent(document, "mousedown", this.REF_EVENT_onmousedown);

			/** puts back the attributes to 0 */
			this.dragged = false;
			this.offsetX = 0;
			this.offsetY = 0;

			/** removes the "onmouseover" event */
			util.removeEvent(document, "mouseover", this.REF_EVENT_onmouseover);

			/** remove the lists masks */
			List.removeMask()

			/** puts back in place */
			this.removeAttribute("style");
			this.className = "list";
			document.getElementsByClassName("body")[0].replaceChild(this, this.dropArea);
			this.dropArea = 'undefined';
		}else if(target == this.btnFooter){
			/** the button in the list footer is clicked */
			this.addCard();
		}
	}
}

/**
 * Handles when the other lists are overflew.
 * @memberof List#
 * @event
 */
List.prototype.EVENT_onmouseover = function(event){
	var maskTarget = event.target || event.srcElement;

	if(maskTarget.className == "list-mask"){

		/** the overflew position is recorded */
		var targetPos = maskTarget.hiddenList.position;

		/** calculates the difference between lists */
		var difference = targetPos - this.position;

		/** 
		 * inserts the dragged list after the overflew list 
		 * if the position of the overflew list is greater than the dragged one 
		 */
		if(difference > 0){
			maskTarget.parentNode.insertBefore(this.dropArea, maskTarget.hiddenList.nextSibling);
			
			/**
			 * decreases of 1 the position of all lists which are before the current one
			 * if it wasn't an exchange between two lists which were side by side.
			 */
			if(targetPos != this.position + 1){
				var allMask = document.getElementsByClassName("list-mask"); // gets all masks
				for(var i = 0; i < allMask.length; i++){
					var listPosition = allMask[i].hiddenList.position;
					if(listPosition <= targetPos){
						allMask[i].hiddenList.setPosition(listPosition - 1);
					}
				}
			}else{
				/** else we change the position number of the target and its mask style. */
				maskTarget.hiddenList.setPosition(this.position);
			}
		}
		
		/** 
		 * inserts the dragged list after the overflew list 
		 * if the position of the overflew list is smaller than the dragged one 
		 */
		if(difference < 0){
			maskTarget.parentNode.insertBefore(this.dropArea, maskTarget.hiddenList);

			/**
			 * defines again the positions of all lists
			 * if it wasn't an exchange between two lists which were side by side.
			 */
			if(targetPos != this.position - 1){
				var allMask = document.getElementsByClassName("list-mask"); // get all the masks
				for(var i = 0; i < allMask.length; i++){
					var listPosition = allMask[i].hiddenList.position;
					if(listPosition >= targetPos && listPosition != List.counter){
						allMask[i].hiddenList.setPosition(listPosition + 1);
					}
				}
			}else{
				/** else we change the position number of the target and its mask style. */
				maskTarget.hiddenList.setPosition(this.position);
			}
		}

		/** changes the position number of the dragged list */
		this.setPosition(targetPos);

		/** sets the mask style */
		maskTarget.style.left = maskTarget.hiddenList.offsetLeft + "px";
		maskTarget.style.top = maskTarget.hiddenList.offsetTop + "px";
	}
}

/**
 * @memberof List#
 */
List.prototype.cardNumber = function(){
	var count = 0;

	var childs = this.cardArea.childNodes;
	for(var i = 0; i<childs.length; i++){
		if(childs[i].className != "card-dropArea"){
			count++;
		}
	}
	return count;
}

/*****************************************\
		STATICS ATTRIBUTES AND METHODS
\*****************************************/

/**
 * @memberof List
 */
List.createMask = function(emptyListOrList){
	/** @default */
	var emptyList = false;

	if(typeof(emptyListOrList) == "boolean"){
		emptyList = emptyListOrList;
	}else if(typeof(emptyListOrList) == "object"){
		var givenList = emptyListOrList;
	}

	var list = document.getElementsByClassName("list");
	for(var i = 0; i<list.length; i++){
		var create = true;

		/** looks for the empty lists */
		if(emptyList){
			var childs = list[i].childNodes;
			for(var j = 0; j<childs.length; j++){
				if(childs[j].className == "list-cardArea"){
					var childNumber = childs[j].childNodes.length;
					if(childNumber != 0){
						create = false;
					}
				}
			}
		}

		/** checks if it's the given list */
		if(typeof(givenList) != "undefined"){
			if(list[i] != givenList){
				create = false;
			}
		}

		/** checks if there is not already a mask */
		if(create){
			var allMask = document.getElementsByClassName("list-mask");
			for(var j = 0; j<allMask.length; j++){
				var hiddenList = allMask[j].hiddenList;
				if(hiddenList == list[i]){
					create = false;
				}
			}
		}

		if(create){
			var mask = document.createElement("div");
			mask.style.left = list[i].offsetLeft + "px";
			mask.style.top = list[i].offsetTop + "px";
			mask.style.height = util.getStyle(list[i], "height");
			mask.style.width = parseFloat(util.getStyle(list[i], "width")) + 4 + "px";
			mask.style.position = "absolute";
			mask.className = "list-mask";
			mask.position = list[i].position;
			mask.hiddenList = list[i];

			if(List.showMask){
				mask.style.background = "rgba(255, 120, 90, 0.45)";
			}

			mask.style.zIndex = 100;
			document.getElementsByClassName("body")[0].appendChild(mask);
		}
	}
}

/**
 * @memberof List
 */
List.resizeMask = function(){
	var allMask = document.getElementsByClassName("list-mask");
	for(var i = 0; i<allMask.length; i++){
		var list = allMask[i].hiddenList;
		allMask[i].style.height = util.getStyle(list, "height");
		allMask[i].style.width = parseFloat(util.getStyle(list, "width")) + 4 + "px";
	}
}

/**
 * @memberof List
 */
List.removeMask = function(){
	var allMask = document.getElementsByClassName("list-mask");
	var numberMask = allMask.length
	for(var i = 0; i<numberMask; i++){
		allMask[0].parentNode.removeChild(allMask[0]);
	}
}

/**
 * Instance counter
 * @memberof List
 */
List.counter = 0;

/**
 * Allows to show the created masks during execution.
 * @memberof List
 */
List.showMask = false;
;/** @file This file contains the Card class. */

(function(){

	/** private attributes */
	var list_onPressBtnClose = [];
	var list_onPressBtnEdit = [];

	/**
	 * Provides cards
	 * @constructor
	 * @param {object} parentList - The list which contains the card.
	 * @param {string} [text] - The card's text.
	 * @returns {object} card - The DOM object representing the card.
	 */
	Card = function(parentList, text){
		if(typeof(parentList) == "undefined"){
			throw "The card must have a parent list to be create.";
		}

		/** defines as draggable all the other cards */
		if(Card.cardList.length > 0){
			for(var element in Card.cardList){
				if(Card.cardList[element].editable){
					Card.cardList[element].setDraggable(true);
				}
			}
		}

		Card.cardList.push(this);

		this.parentList = parentList;
		this.text = "";
		this.textHTML = "";

		/** creates the card in the DOM */
		var card = document.createElement("div");
		card.className = "card";

		/** the edition area */
		this.editionArea = new RichTextArea("div");
		this.editionArea.className = "card-text";
		this.editionArea.setAttribute("data-translatable", true);
		card.appendChild(this.editionArea);
		
		/** the context menu of the edition area */
		this.editionArea.cMenu = ContextMenu(this.editionArea, 
			[ /** the labels of the context menu */
				function(){ return app.TEXT["Undo"]},
				function(){ return app.TEXT["Redo"]},
				function(){ return app.TEXT["Bold"]},
				function(){ return app.TEXT["Italic"]},
				function(){ return app.TEXT["Underline"]}
			],
			[ /** the actions of the context menu */
				this.editionArea.undo.bind(this.editionArea),
				this.editionArea.redo.bind(this.editionArea),
				this.editionArea.bold.bind(this.editionArea),
				this.editionArea.italic.bind(this.editionArea),
				this.editionArea.underline.bind(this.editionArea)
			]
		)
		
		/** disable the context menu */
		this.editionArea.cMenu.enable = false;

		/** the edit bar */
		this.editBar = document.createElement("div");
		this.editBar.style.top = "100%";
		this.editBar.className = "card-editBar";
		card.appendChild(this.editBar);

		/** close Button */
		this.btnClose = document.createElement("div");
		this.btnClose.className = "card-btnClose";
		this.editBar.appendChild(this.btnClose);

		/** edit Button */
		this.btnEdit = document.createElement("div");
		this.btnEdit.className = "card-btnEdit";
		this.editBar.appendChild(this.btnEdit);

		if(typeof(text) != "undefined"){
			this.setText(text);
		}else{
			this.setText(app.TEXT["New card"]);
		}

		this.offsetX = 0;
		this.offsetY = 0;
		this.dropArea;
		this.dragged = false;
		this.draggable = false;
		this.editable = false;

		/** hides the edit bar */
		this.anim;
		this.editBarVisible = false;
		this.editBarAnimated = false;
		this.hideEditBar();

		/** the card inherit from the current object */
		util.inherit(card, this);

		/** references on functions which handle animations. */
		card.REF_EVENT_onmousedown = card.EVENT_onmousedown.bind(card);
		card.REF_EVENT_onmousemove = card.EVENT_onmousemove.bind(card);
		card.REF_EVENT_onmouseup = card.EVENT_onmouseup.bind(card);
		card.REF_EVENT_onmouseover = card.EVENT_onmouseover.bind(card);
		card.REF_EVENT_onkeydown = card.EVENT_onkeydown.bind(card);

		/** events */
		util.addEvent(document, "mousedown", card.REF_EVENT_onmousedown);
		util.addEvent(document, "mouseover", card.REF_EVENT_onmouseover);
		util.addEvent(document, "mouseup", card.REF_EVENT_onmouseup);
		util.addEvent(document, "mousemove", card.REF_EVENT_onmousemove);

		/** set the current card as editable */
		card.setEditable(true);
		
		/** create the context menu */
		card.cMenu = ContextMenu(card, [
				function(){ return app.TEXT["Add a card"]}, 
				function(){ return app.TEXT["Remove the card"]},
				function(){ return app.TEXT["Remove the list"]}
			],[ /** adds actions */
				function(){card.parentList.addCard()},
				function(){card.remove()},
				function(){card.parentList.remove()}
			]
		)
		
		/** return the created card */
		return card;
	}

	/**
	 * @memberof Card#
	 */
	Card.prototype.setDraggable = function(bool){
		if(bool){
			if(!this.draggable){
				this.draggable = true;
				this.setEditable(false);
			}
		}else{
			if(this.draggable){
				this.draggable = false;
				this.setEditable(true);
			}
		}
	}

	/**
	 * @memberof Card#
	 */
	Card.prototype.setEditable = function(bool){
		/** set editable */
		if(bool && !this.editable){
			this.editable = true;
			this.setDraggable(false);
			this.hideEditBar(12);
			
			this.editionArea.contentEditable = true;
			this.editionArea.style.cursor = "text";
			this.editionArea.focus();
			
			/** enable the context menu */
			this.editionArea.cMenu.enable = true;

			/** allows to put the Caret at the end of the text */
			if (document.getSelection) {    // all browsers, except IE before version 9
				var sel = document.getSelection ();
				// sel is a string in Firefox and Opera,
				// and a selectionRange object in Google Chrome, Safari and IE from version 9
			}else{
				if(document.selection) {   // Internet Explorer before version 9
					var textRange = document.selection.createRange ();
				}
			}
			//sel.collapse(this.editionArea.firstChild, this.editionArea.textContent.length);
			
			/** adds the "onkeydown" event */
			util.addEvent(document, "keydown", this.REF_EVENT_onkeydown);
			
		/** set draggable */
		}else if(!bool && this.editable){
			var isEmpty = /^\s*$/gi;
			if(isEmpty.test(this.getText())){
				this.editionArea.blur();
				this.remove();
			}else{
				this.editable = false;
				recoverTextHTML(this); // A VIRER
				
				this.setDraggable(true);
				this.editionArea.blur();
				this.editionArea.contentEditable = false;
				this.editionArea.style.cursor = "default";
				this.editionArea.innerHTML = this.textHTML; // A VIRER
				
				/** disable the context menu */
				this.editionArea.cMenu.enable = false;
				
				/** removes the "onkeydown" event */
				util.removeEvent(document, "keydown", this.REF_EVENT_onkeydown);
			}
		}
	}

	/**
	 * @memberof Card#
	 */
	Card.prototype.remove = function(){
		/** removes the card from the static list */
		if(Card.cardList.length > 0){
			for(var element in Card.cardList){
				if(Card.cardList[element] == this){
					delete Card.cardList[element];
				}
			}
		}

		/** removes the context menu */
		this.cMenu.remove();
		
		/** removes the "onmousedown" event */
		util.removeEvent(document, "mousedown", this.REF_EVENT_onmousedown);

		/** removes the current card */
		this.parentNode.removeChild(this);
	}

	/**
	 * @memberof Card#
	 */
	Card.prototype.setText = function(newText){
		this.text = newText;
		this.textHTML = newText;
		this.editionArea.text = newText;
		this.editionArea.innerHTML = newText;
	}

	/**
	 * Allows to get the text.
	 * @memberof Card#
	 */
	Card.prototype.getText = function(){
		return this.editionArea.textContent;
	}

	/**
	 * Allows to determine actions when the close button is pressed
	 * @memberof Card#
	 */
	Card.prototype.onPressBtnClose = function(callback){
		list_onPressBtnClose.push(callback);
	}
	
	/**
	 * Allows to determine actions when the edit button is pressed
	 * @memberof Card#
	 */
	Card.prototype.onPressBtnEdit = function(callback){
		list_onPressBtnEdit.push(callback);
	}

	/**
	 * @memberof Card#
	 * @event
	 */
	Card.prototype.EVENT_onmousedown = function(event){
		var target = event.target || event.srcElement;

		if(!event.which && event.button){ // Firefox, Chrome, etc...
			var button = event.button;
		}else{ // MSIE
			var button = event.which;
		}

		if(button == 1 && target != this.btnClose && target != this.btnEdit){
			if(this.editable && target != this.editionArea && !this.editionArea.cMenu.member(target)){
				this.setDraggable(true);
			}
			
			if(this.draggable && (target == this || util.hasParent(target, this))){
				/** prevents the default behaviour */
				event.returnValue = false;
				if(event.preventDefault){
					event.preventDefault();
				}

				this.dragged = true;
				this.style.zIndex = 99;
				this.hideEditBar(2);

				/** calculates the mouse position in the object in order to set the object where the mouse catch it, recording the result in the "offset" variables. */ 
				var mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
				var mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;

				/** calculates the offsets of the object */
				var elementX = 0;
				var elementY = 0;
				var element = this;
				do{
					elementX += element.offsetLeft;
					elementY += element.offsetTop;
					element = element.offsetParent;
				}while(element && util.getStyle(element, 'position') != 'absolute'  && util.getStyle(element, 'position') != 'fixed');

				this.offsetX += mouseX - elementX;
				this.offsetY += mouseY - elementY;

				/** creates the drop area */
				this.dropArea = document.createElement("div");
				this.dropArea.style.height = util.getStyle(this, "height");
				this.dropArea.style.width = util.getStyle(this, "width");
				this.dropArea.className = "card-dropArea";
				this.parentNode.insertBefore(this.dropArea, this);

				/** turn the parent object in absolute position */
				this.style.width = util.getStyle(this, "width");
				var marginHeight = (this.offsetHeight - parseFloat(util.getStyle(this, "height")))/2
				this.style.left = elementX + 'px';
				this.style.top = elementY - marginHeight - 1 + 'px';
				this.style.position = "absolute";
				this.style.width = util.getStyle(this, "width");
				this.className = "card-caught";

				/** removes the card from the parentList */
				this.parentList.removeCard(this); 

				/** creates the masks Cards */
				Card.createMask(); 
				
				/** creates the masks for the empty lists */
				List.createMask(true); 
				if(this.parentList.cardNumber() == 1){
					/** creates a mask for the parentList if the current card is alone in it. */
					List.createMask(this.parentList); 
				}

				/** removes the "onmousedown" event */
				util.removeEvent(document, "mousedown", this.REF_EVENT_onmousedown);
			}
		}
	}

	/**
	 * @memberof Card#
	 * @event
	 */
	Card.prototype.EVENT_onmousemove = function(event){
		var target = event.target || event.srcElement;
		if(this.dragged){
			/** gets the mouse coordinates */
			var x = event.clientX + (document.documentElement.scrollLeft + document.body.scrollLeft);
			var y = event.clientY + (document.documentElement.scrollTop + document.body.scrollTop);

			/** applies the different offsets */
			x -= this.offsetX;
			y -= this.offsetY;

			this.className = "card-dragged";
			this.style.left = x + 'px';
			this.style.top = y + 'px';
		}
	}

	/**
	 * @memberof Card#
	 * @event
	 */
	Card.prototype.EVENT_onmouseup = function(event){
		var target = event.target || event.srcElement;

		if(!event.which && event.button){ // Firefox, Chrome, etc...
			var button = event.button;
		}else{ // MSIE
			var button = event.which;
		}

		if(button == 1){
			if(this.dragged){
				/** prevent the default behaviour */
				event.returnValue = false;
				if(event.preventDefault){
					event.preventDefault();
				}

				/** puts back the attributes to 0 */
				this.dragged = false;
				this.offsetX = 0;
				this.offsetY = 0;

				/** remove the masks */
				Card.removeMask()
				List.removeMask()

				/** puts back in place */
				this.removeAttribute("style");
				this.className = "card";
				this.dropArea.parentNode.replaceChild(this, this.dropArea);

				/** handle the parentList property */
				this.parentList.removeCard(this); // removes the card from the parentList
				this.parentList = this.parentNode.parentNode; // changes the "parentList" attribute
				this.parentList.addCard(this); // adds the card to the new parent list

				this.dropArea = 'undefined';	// erases the "dropArea" attribute

				/** adds the "onmousedown" event */
				util.addEvent(document, "mousedown", this.REF_EVENT_onmousedown);
			}else if(target == this.btnEdit){
				for(var i = 0; i < list_onPressBtnEdit.length; i++){
					list_onPressBtnEdit[i]();
				}
			
				this.setEditable(true);
			}else if(target == this.btnClose){
				for(var i = 0; i < list_onPressBtnClose.length; i++){
					list_onPressBtnClose[i]();
				}
			
				this.remove();
			}
		}
	}

	/**
	 * Flies over the other cards or lists. 
	 * @memberof Card#
	 * @event
	 */
	Card.prototype.EVENT_onmouseover = function(event){
		var target = event.target || event.srcElement;

		if(this.dragged && target.className == "card-mask"){
			var parentNode = target.hiddenCard.parentNode;

			/** creates the empty lists's mask */
			List.createMask(true); 

			/** inserts the dragged card before the overflew card */
			if(target.getAttribute("data-position") == "top"){
				parentNode.insertBefore(this.dropArea, target.hiddenCard);
			}

			/** inserts the dragged card after the overflew card */
			if(target.getAttribute("data-position") == "bottom"){
				parentNode.insertBefore(this.dropArea, target.hiddenCard.nextSibling);
			}

			List.resizeMask();

			/** sets the style of the mask */
			Card.replaceMask();
		}

		/** overs an empty list */
		if(this.dragged && target.className == "list-mask"){
			target.hiddenList.cardArea.appendChild(this.dropArea);
			List.resizeMask();
			Card.replaceMask();
		}

		if(target == this || util.hasParent(target, this)){
			this.showEditBar();
		}else{
			this.hideEditBar();
		}
	}

	/**
	 * @memberof Card#
	 * @event
	 */
	Card.prototype.EVENT_onkeydown = function(event){
		var target = event.target || event.srcElement;
		var key;

		if(app.BROWSER == "firefox"){
			key = event.key;
			if(key == "Backspace" || key == "Del"){
				key = '';
			}
		}else{
			key = util.fromKeycodeToHtml(event.keyCode);
		}

		if(event.keyCode != 16){ // "shift"
			recoverTextHTML(this);
			
			this.editBar.style.top = "100%";
		}
	}
	
	// SANS DOUTE A VIRER
	/**
	 * Recovers the content from the edition area and puts it into the "textHTML" attribute. 
	 * @function
	 * @private
	 */
	function recoverTextHTML(card){
		var content = card.editionArea.innerHTML;

		card.textHTML = content;
		/*
		if(app.BROWSER == "firefox"){
			if(content.substring(content.length - 4) == "<br>"){
				// removes the "<br>" automatically created at the end 
				card.textHTML = content.substring(0, content.length - 4) + key; 
			}else{
				card.textHTML = content + key;
			}
		}else if(app.BROWSER == "chrome" || app.BROWSER == "opera"){
			if(content.substring(content.length - 6) == "</div>"){
				// puts the last character in the last div created 
				card.textHTML = content.substring(0, content.length - 6) + key + "</div>"; 
			}else{
				card.textHTML = content + key;
			}
		}
		*/
	}

	/**
	 * @memberof Card#
	 */
	Card.prototype.showEditBar = function(frameRate, firstIteration, secondIteration){
		var anim = true;

		var ref = this.showEditBar.bind(this);

		if(typeof(firstIteration) == "undefined"){
			var firstIteration = true;
		}

		if(typeof(secondIteration) == "undefined"){
			var secondIteration = false;
		}

		if(this.editBarAnimated  && !this.editBarVisible && firstIteration){
			clearTimeout(this.anim);
			this.editBarAnimated = false;
			this.anim = 0;
		}else if(this.editBarVisible && firstIteration){
			anim = false;
		}else if(this.editable || this.dragged){
			this.hideEditBar();
			anim = false;
		}else if(!this.editBarAnimated && !this.editBarVisible){
			this.editBarAnimated = true;
			this.editBarVisible = true;
			
			/** waits before launch the animation */
			this.anim = setTimeout(function(){ref(frameRate, false, true)}, 600) 
			anim = false;
		}

		if(anim){
			if(typeof(frameRate) == "undefined"){
				var frameRate = 10;
			}

			var top = 0;

			if(secondIteration && (app.BROWSER == "chrome" || app.BROWSER == "opera")){
				top = parseFloat(this.offsetHeight); // Useful for Chrome and Opera
			}else{
				top = parseFloat(util.getStyle(this.editBar, "top")); // in pixels
			}

			var heightEditBar = parseFloat(util.getStyle(this.editBar, "height")); // finds it in pixels
			var heightCard = parseFloat(this.offsetHeight);
			var finalTop = heightCard - heightEditBar;

			if(top - 1 > finalTop){
				this.editBarAnimated = true;
				this.editBarVisible = true;
				this.editBar.style.top = top - 1 + "px";
				this.anim = setTimeout(function(){ref(frameRate, false, false)}, frameRate);
			}else{
				this.editBar.style.top = finalTop + "px";
				this.editBarAnimated = false;
				this.editBarVisible = true;
			}
		}
	}

	/**
	 * Allows to animate the edit bar.
	 * @function
	 * @param {number} [frameRate] - The number of milliseconds between two state change.
	 * @memberof Card#
	 */
	Card.prototype.hideEditBar = function(frameRate, firstIteration){
		var anim = true;

		if(typeof(firstIteration) == "undefined"){
			var firstIteration = true;
		}

		if(this.editBarAnimated && this.editBarVisible && firstIteration){
			clearTimeout(this.anim);
			this.editBarAnimated = false;
			this.anim = 0;
		}else if(!this.editBarVisible && firstIteration){
			anim = false;
		}

		if(anim){
			/** @default */
			if(typeof(frameRate) == "undefined"){
				var frameRate = 10;
			}

			var top = parseFloat(util.getStyle(this.editBar, "top")); // in pixels
			var finalTop = parseFloat(this.offsetHeight);
			var ref = this.hideEditBar.bind(this);

			if(top + 1 < finalTop){
				this.editBarAnimated = true;
				this.editBarVisible = false;
				this.editBar.style.top = top + 1 + "px";
				this.anim = setTimeout(function(){ref(frameRate, false)}, frameRate);
			}else{
				this.editBar.style.top = finalTop + "px";
				this.editBarAnimated = false;
				this.editBarVisible = false;
			}
		}
	}

	/*****************************************\
			STATICS ATTRIBUTES AND METHODS
	\*****************************************/

	/**
	 * @memberof Card
	 */
	Card.createMask = function(){
		var card = document.getElementsByClassName("card");
		for(var i = 0; i<card.length; i++){
			/** the top mask */
			var topMask = document.createElement("div");
			topMask.style.left = card[i].offsetLeft + "px";
			topMask.style.top = card[i].offsetTop + "px";
			topMask.style.height = (card[i].offsetHeight/2) + "px";
			topMask.style.width = card[i].offsetWidth + "px";
			topMask.style.position = "absolute";
			topMask.className = "card-mask";
			topMask.setAttribute("data-position", "top");
			topMask.hiddenCard = card[i];

			if(Card.showMask){
				topMask.style.background = "rgba(30, 120, 255, 0.45)";
			}

			topMask.style.zIndex = 100;
			document.getElementsByClassName("body")[0].appendChild(topMask);

			/** the bottom mask */
			var botMask = document.createElement("div");
			botMask.style.left = card[i].offsetLeft + "px";
			botMask.style.top = card[i].offsetTop + (card[i].offsetHeight/2) + "px";
			botMask.style.height = (card[i].offsetHeight/2) + "px";
			botMask.style.width = card[i].offsetWidth + "px";
			botMask.style.position = "absolute";
			botMask.className = "card-mask";
			botMask.setAttribute("data-position", "bottom");
			botMask.hiddenCard = card[i];

			if(Card.showMask){
				botMask.style.background = "rgba(120, 30, 255, 0.45)";
			}

			botMask.style.zIndex = 100;
			document.getElementsByClassName("body")[0].appendChild(botMask);
		}
	}

	/**
	 * @memberof Card
	 */
	Card.resizeMask = function(){
		var allMask = document.getElementsByClassName("card-mask");
		for(var i = 0; i<allMask.length; i++){
			var list = allMask[i].hiddenList;
			if(allMask[i].getAttribute("data-position") == "bottom"){
				allMask[i].style.height = parseFloat(util.getStyle(list, "height"))/2 + "px";
			}else{
				allMask[i].style.height = util.getStyle(list, "height") + "px";
			}
			allMask[i].style.width = parseFloat(util.getStyle(list, "width")) + 4 + "px";
		}
	}

	/**
	 * @memberof Card
	 */
	Card.replaceMask = function(){
		var allMask = document.getElementsByClassName("card-mask");
		for(var i = 0; i<allMask.length; i++){
			allMask[i].style.left = allMask[i].hiddenCard.offsetLeft + "px";
			if(allMask[i].getAttribute("data-position") == "bottom"){
				allMask[i].style.top = allMask[i].hiddenCard.offsetTop + (allMask[i].hiddenCard.offsetHeight/2) + "px";
			}else{
				allMask[i].style.top = allMask[i].hiddenCard.offsetTop + "px";
			}
		}
	}

	/**
	 * @memberof Card
	 */
	Card.removeMask = function(){
		var allMask = document.getElementsByClassName("card-mask");
		var numberMask = allMask.length
		for(var i = 0; i<numberMask; i++){
			allMask[0].parentNode.removeChild(allMask[0]);
		}
	}

	/**
	 * An array containing a reference to each card
	 * @memberof Card
	 */
	Card.cardList = new Array;

})();
;/**
 * @file This is the main file of the application. It creates 
 * all the application.
 */

/**
 * Allows to show all masks.
 * Useful for debug
 * @function showMask
 */
function showMask(){
	List.showMask = true;
	Card.showMask = true;
}

/**
 * Allows to hide all masks.
 * Useful for debug
 * @function hideMask
 */
function hideMask(){
	List.showMask = false;
	Card.showMask = false;
}

/** Create the default lists */
(function(){
	new List(app.TEXT["To do"]).addCard(false);
	new List(app.TEXT["In progress"]).addCard(false);
	new List(app.TEXT["Done"]).addCard(false);
})()

util.addEvent(app.BTN_ADDLIST, "click", function(){new List;});

/** 
 * gets the lang menu
 * @memberof app
 */
app.LANG_MENU = document.getElementsByClassName('lang-menu')[0];

/** @memberof app */
app.LANG_MENU_HEAD = document.getElementsByClassName('lang-menu-head')[0];

/** @memberof app */
app.BTN_LANG_MENU = document.getElementsByClassName('lang-menu-btn')[0];

/** displays the current language */
app.LANG_MENU_HEAD.innerHTML = app.TEXT.__lang__.replace(/^\w/, function($0) { return $0.toUpperCase(); }); // puts the first letter in upper-case

util.addEvent(document, "mousedown", menuLangDown);
util.addEvent(document, "mouseup", menuLangUp);

/**
 * Handles the lang menu.
 * @function menuLangDown
 * @event
 */
function menuLangDown(event){
	var target = event.target || event.srcElement;
	
	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}
	
	if(button == 1 && util.hasParent(target, app.LANG_MENU) && target.localName == "li"){
		target.className = "onclick";
	}	
}

/**
 * Handles the lang menu.
 * @function menuLangUp
 * @event
 */
function menuLangUp(event){
	var target = event.target || event.srcElement;
	
	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}	
	
	if(button == 1 && (target == app.BTN_LANG_MENU || util.hasParent(target, app.BTN_LANG_MENU))){	
		if(util.getStyle(app.LANG_MENU, "display") == "none"){
			app.LANG_MENU.style.display = "block";
		}else{
			app.LANG_MENU.style.display = "none";
		}
	}else if(!util.hasParent(target, app.LANG_MENU)){
		if(util.getStyle(app.LANG_MENU, "display") == "block"){
			app.LANG_MENU.style.display = "none";
		}
	}
	
	/** change the interface language. */
	if(button == 1 && util.hasParent(target, app.LANG_MENU) && target.localName == "li"){
		target.className = "";
		changeLang(target.innerHTML.toLowerCase());
		app.LANG_MENU_HEAD.innerHTML = target.innerHTML;
	}
}
