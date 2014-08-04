/**
 * @file This file creates the "util" which
 * contains independent methods used occasionally 
 * by some part of the application.
 */

/** creates the object */
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
 */
util.inherit = function(destination, source){
	for (var element in source) {
		destination[element] = source[element];
	}
}
