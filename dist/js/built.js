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
 * Prevent the default behaviour of an event
 */
util.preventDefault = function(event){
	event.returnValue = false;
	if(event.preventDefault){
		event.preventDefault();
	}
}

/**
 * Get the button of the mouse which trigger the event
 */
util.getMouseButton = function(event){
	if(!event.which && event.button){ // Firefox, Chrome, etc...
		return event.button;
	}else{ // MSIE
		return event.which;
	}
}

/**
 * Return the target of the event
 */
util.getTarget = function(event){
	return event.target || event.srcElement;
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
 * This module provide a private attribute handler.
 * It allows a user to used private attribute
 * with a class.
 * To work it must be himself a private attribute of the class.
 * @exemple
 * 		(function(){
 * 			var _private = new Private; // it's private himself
 *
 *			function myClass(){
 *				_private.set("privateFunc", function(){ return "something" }, this)
 *			}
 *
 *			// return "something"
 *			myClass.prototype.getSomething = function(){
 *				var privateFunc = _private.get("privateFunc", this);
 *				return privateFunc();
 *			}
 *
 *		})();
 */

(function(){
	/** @private */
	var _storage = [];

	/**
	 * @constructor
	 */ 
	Private = function(){
		_storage.push({
			privateObj: this, /** the current instance of private */
			memory: [], /** contains the memory used by the handler */
			lastUsedId: -1 /** contains the identifier of the memory last entry used. */
		});
	}
	
	/** 
	 * Allows to add a private variable to an instance.
	 * @function
	 */
	Private.prototype.set = function(name, value, instance){
		var memory = getMemory(this);
		var lastUsedId = getLastUsedId(this);
		
		if(lastUsedId != -1 && memory[lastUsedId].instance == instance){
			memory[lastUsedId].attribute[name] = value;
			return;
		}

		for(var i = 0; i < memory.length; i++){
			if(memory[i].instance == instance){
				setLastUsedId(i, this);
				memory[i].attribute[name] = value;
				return;
			}
		}
		
		/** creates a new entry */
		var newEntry = {};
		newEntry["instance"] = instance;
		newEntry["attribute"] = [];
		newEntry.attribute[name] = value;
		
		memory.push(newEntry); 
		setMemory(memory, this);
	}
	
	/** 
	 * Allows to get a private variable to an instance.
	 * @function
	 */
	Private.prototype.get = function(name, instance){
		var memory = getMemory(this);
		var lastUsedId = getLastUsedId(this);
	
		if(lastUsedId != -1 && memory[lastUsedId].instance == instance){
			return memory[lastUsedId].attribute[name];
		}
		
		for(var i = 0; i < memory.length; i++){
			if(memory[i].instance == instance){
				setLastUsedId(i, this);
				return memory[i].attribute[name];
			}
		}
		return undefined;
	}
	
	/** 
	 * Allows to delete a private variable to an instance.
	 * @function
	 */
	Private.prototype.remove = function(name, instance){
		var memory = getMemory(this);
		var lastUsedId = getLastUsedId(this);
	
		if(lastUsedId != -1 && memory[lastUsedId].instance == instance){
			delete memory[lastUsedId].attribute[name];
		}
		
		for(var i = 0; i < memory.length; i++){
			if(memory[i].instance == instance){
				delete memory[lastUsedId].attribute[name];
			}
		}
		setMemory(memory, this);
	}
	
	/** 
	 * Allows to get a private variable to all the instance which has this variable.
	 * @function
	 * @return {array} result - A list of object containing the instance and the value of the private variable.
	 */
	Private.prototype.getAllInstance = function(name){
		var memory = getMemory(this);
		var result = [];
		
		for(var i = 0; i < memory.length; i++){
			if(typeof(memory[i].attribute[name]) != "undefined"){
				var obj = {};
				obj.instance = memory[i].instance;
				obj[name] = memory[i].attribute[name];
				result.push(obj);
			}
		}
		return result;
	}
	
	/** 
	 * Allows to delete an instance entry.
	 * @function
	 */
	Private.prototype.deleteInstance = function(instance){	
		var memory = getMemory(this);
	
		for(var i = 0; i < memory.length; i++){
			if(memory[i].instance == instance){
				memory.splice(i, 1);
			}
		}
		setMemory(memory, this);
	}
	
	/** 
	 * return the memory of the private object 
	 * @function
	 * @private
	 */
	function getMemory(privateObj){
		for(var i = 0; i < _storage.length; i++){
			if(_storage[i].privateObj == privateObj){
				return _storage[i].memory;
			}
		}
	}
	
	/** 
	 * set the memory of the private object
	 * @function
	 * @private
	 */
	function setMemory(memory, privateObj){
		for(var i = 0; i < _storage.length; i++){
			if(_storage[i].privateObj == privateObj){
				_storage[i].memory = memory;
			}
		}
	}
	
	/** 
	 * return the last used id by the private object 
	 * @function
	 * @private
	 */
	function getLastUsedId(privateObj){
		for(var i = 0; i < _storage.length; i++){
			if(_storage[i].privateObj == privateObj){
				return _storage[i].lastUsedId;
			}
		}
	}
		
	/** 
	 * set the last used id by the private object
	 * @function
	 * @private
	 */
	function setLastUsedId(id, privateObj){
		for(var i = 0; i < _storage.length; i++){
			if(_storage[i].privateObj == privateObj){
				_storage[i].lastUsedId = id;
			}
		}
	}
	
})();;/**
 * Contains the UI class.
 * The UI class provide a meaning to manage
 * buttons and their actions easily.
 * @file
 */

(function(){
	/** @private */
	var _private = new Private;

	/**
	 * Provide the cards's edition bar
	 * @constructor
	 */
	UI = function(){}
	
	/** return a reference on the node of the named button. */
	UI.prototype.button = function(name){
		var listBtn = _private.get("listBtn", this);
		for(var i = 0; i < listBtn.length; i++){
			if(listBtn[i].name == name){
				return listBtn[i].node;
			}
		}
	}
	
	/**
	 * Allows to create button.
	 * @function
	 * @param {string} name - the name of the button
	 * @param {object} [node] - the node of the button
	 */
	UI.prototype.newButton = function(name, node){
		if(typeof(node) == "undefined"){
			node = null;
		}
	
		var listBtn = _private.get("listBtn", this);
		if(typeof(listBtn) == "undefined"){
			listBtn = [];
			
			/** adds a new entry */
			listBtn.push({name: name, node: node, onPress: []});
		}else{
			/** checks if the button already exist */
			var id = -1;
			for(var i = 0; i < listBtn.length; i++){
				if(listBtn[i].name == name){
					id = i;
					break;
				}
			}
			
			/** overloads the existing button */
			if(id != -1){
				listBtn[id].node = node;
				listBtn[id].onPress = [];
				
			/** adds a new entry */
			}else{
				listBtn.push({name: name, node: node, onPress: []});
			}
		}
		
		_private.set("listBtn", listBtn, this);
	}
	
	/**
	 * Define a new node to an existing button
	 * @function
	 */
	UI.prototype.setButtonNode = function(name, node){
		var listBtn = _private.get("listBtn", this);
		for(var i = 0; i < listBtn.length; i++){
			if(listBtn[i].name == name){
				listBtn[i].node = node;
				break;
			}
		}
		_private.set("listBtn", listBtn, this);
	}
	
	/**
	 * enable a button
	 * @function
	 * @param {string} name - the name of the button.
	 */
	UI.prototype.enableButton = function(name){
		setStateButton(name, "enable", this);
	}
	
	/**
	 * disable a button
	 * @function
	 * @param {string} name - the name of the button.
	 */
	UI.prototype.disableButton = function(name){
		setStateButton(name, "disable", this);
	}
	
	/**
	 * get a button state
	 * @function
	 * @param {string} name - the name of the button.
	 */
	UI.prototype.getStateButton = function(name){
		var listBtn = _private.get("listBtn", this);
		for(var i = 0; i < listBtn.length; i++){
			if(listBtn[i].name == name){
				return listBtn[i].state;
			}
		}
	}
	
	/** prevent the contact area to be active */
	UI.prototype.lock = function(){
		_private.set("locked", true, this);
	}
	
	/** prevent the contact area to be active  */
	UI.prototype.unlock = function(){
		_private.set("locked", false, this);
	}
	
	/** return the current state of the contact manager */
	UI.prototype.getState = function(){
		return _private.get("locked", this);
	}
	
	/**
	 * Allows to determine actions when a button is pressed
	 * @memberof UI#
	 */
	UI.prototype.onPressButton = function(name, callback){
		var listBtn = _private.get("listBtn", this);
		for(var i = 0; i < listBtn.length; i++){
			if(listBtn[i].name == name){
				listBtn[i].onPress.push(callback);
				break;
			}
		}
		_private.set("listBtn", listBtn, this);
	}
	
	// PRIVATE FUNCTIONS
	/**
	 * Set the state of a button.
	 * Used by the functions enableButton and disableButton
	 * @private
	 * @function
	 */
	function setStateButton(name, state, instance){
		var listBtn = _private.get("listBtn", instance);
		for(var i = 0; i < listBtn.length; i++){
			if(listBtn[i].name == name){
				listBtn[i].state = state;
				break;
			}
		}
		_private.set("listBtn", listBtn, instance);
	}
	
	// EVENTS
	/**
	 * Allows to handle buttons 
	 * @event
	 * @private
	 */
	function onmouseup(event){
		var target = util.getTarget(event);
		var button = util.getMouseButton(event);
		util.preventDefault(event);

		if(button == 1){
			var allListBtn = _private.getAllInstance("listBtn");
			
			for(var i = 0; i < allListBtn.length; i++){
				/** checks if the instance is locked */
				var allLocked = _private.getAllInstance("locked");
				var locked = false;
				for(var j = 0; j < allLocked.length; j++){
					if(allLocked[j].instance == allListBtn[i].instance){
						locked = allLocked[j].locked;
						break;
					}
				}
			
				/** launches the recorded actions */
				if(!locked){
					var listBtn = allListBtn[i].listBtn
					
					for(var j = 0; j < listBtn.length; j++){
						if(listBtn[j].state == "enable" && (target == listBtn[j].node || util.hasParent(target, listBtn[j].node))){
							var onPress = listBtn[j].onPress;
							for(var k = 0; k < onPress.length; k++){
								/** launches the callback with the button node as argument */
								onPress[k](listBtn[j].node);
							}
						}
					}
				}
			}
		}
	}
	
	/**
	 * Allows to prevent the default behaviour if a button is pressed.
	 * @event
	 * @private
	 */
	function onmousedown(event){
		var target = util.getTarget(event);
		var button = util.getMouseButton(event);

		if(button == 1){
			var allInstance = _private.getAllInstance("listBtn");
			for(var i = 0; i < allInstance.length; i++){
				var listBtn = allInstance[i].listBtn
				for(var j = 0; j < listBtn.length; j++){
					if(target == listBtn[j].node || util.hasParent(target, listBtn[j].node)){
						util.preventDefault(event);
						return;
					}
				}
			}
		}
	}

	/** adds the events */
	util.addEvent(document, "mouseup", onmouseup);
	util.addEvent(document, "mousedown", onmousedown);
})()
;/**
 * Contains the state handler module which allows to manage
 * the different states of a node.
 * @file
 */
(function(){
	var _private = new Private;

	/** @constructor */
	ModeHandler = function(){
	
	}

	ModeHandler.prototype.newMode = function(name, callback){
		var modeList = _private.get("modeList", this);
		
		if(typeof(modeList) == "undefined"){
			modeList = [];
		}
		
		if(typeof(modeList) == "undefined"){
			modeList.push({mode: name});
		}else{
			modeList.push({mode: name, constructor: callback});
		}
		
		_private.set("modeList", modeList, this);
	}
	
	ModeHandler.prototype.constructor = function(name, callback){
		var modeList = _private.get("modeList", this);
		if(typeof(modeList) != "undefined"){
			var id = getId(name, this);
			modeList[id].constructor = callback;
		}
	}
	
	ModeHandler.prototype.mode = function(name){
		var currentMode = _private.get("currentMode", this);
		if(currentMode != name){
			var modeList = _private.get("modeList", this);
			if(typeof(modeList) != "undefined"){
				var idCurrent = getId(currentMode, this);
				
				if(typeof(idCurrent) != "undefined"){
					/** destruct the current mode */
					if(typeof(modeList[idCurrent]["destructor"]) != "undefined"){
						modeList[idCurrent].destructor();
					}
				}
				
				/** construct the new mode */
				var idNew = getId(name, this);
				if(typeof(modeList[idNew].destructor) != "undefined"){
					modeList[idNew].constructor();
				}
			}
			
			/** change the current mode */
			_private.set("currentMode", name, this);
		}
	}
	
	ModeHandler.prototype.destructor = function(name, callback){
		var modeList = _private.get("modeList", this);
		if(typeof(modeList) != "undefined"){
			var id = getId(name, this);
			modeList[id].destructor = callback;
		}
	}
	
	/**
	 * Return the id of the mode in the modeList attribute
	 * @function
	 * @private
	 */
	function getId(name, instance){
		var modeList = _private.get("modeList", instance);
		if(typeof(modeList) != "undefined"){
			for(var i = 0; i < modeList.length; i++){
				if(modeList[i].mode == name){
					return i;
				}
			}
		}
		return undefined;
	}
})();;/**
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
		RTA.hyperlink = function(link){
			if(link && link != '' && link != 'http://'){
				formatDoc('createlink',link)
			}
		};
		RTA.cut = function(){formatDoc('cut')};
		RTA.copy = function(){formatDoc('copy')};
		RTA.paste = function(){formatDoc('paste')};
		RTA.font = function(fontName){formatDoc('fontname', fontName)};

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
 * @author Yohann Vioujard
 */

(function(){
	/** 
	 * the memory containing the informations about all the context menus 
	 * @private
	 */
	var memory = [];
	
	/** 
	 * the identifier of the current context menu in the memory 
	 * @private
	 */
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
			ui = undefined;
		};
		
		/** contains the DOM node of his context menu. */
		ui.node = undefined;
		
		/** 
		 * test if the target is a node member of the context menu handle by the UI.
		 * @function
		 */
		ui.isChildNode = function(DOMNode){
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
		
		/** pushes the new context menu in the memory */ 
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
			if(typeof(memory[currentId]) != "undefined"){
				memory[currentId].ui.node = undefined;
			}
		}
	}

    /**
     * Return the html element of the button which contains the given text
     * @function ContextMenu.btn
	 * @param {string|function} str - The text of the button that the user wants to retrieve, it can be a function which return a string. 
     * @return {object} The html element containing the text send in parameter.
	 * @memberof ContextMenu
     */
    ContextMenu.btn = function(strOrFn){
		var str = strOrFn;
		if(str instanceof Function){
			str = str();
		}
	
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
	
	/** 
	 * the dom node targeted by the context menu module. 
	 * @member {object} ContextMenu.target
	 */
	ContextMenu.target; 
	
	/** 
	 * contains the dom node of the context menu when it's visible. 
	 * @member {object} ContextMenu.node
	 */
	ContextMenu.node; 

	// PRIVATE FUNCTION

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
				memory.splice(i, 1);
			}
		}
	}
	
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

			if(target.className == "contextMenu-btn"){
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
		ContextMenu.node.className = "contextMenu";
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
			newBtn.className = "contextMenu-btn";
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
	
	/** adds the events handler */
	util.addEvent(document, "contextmenu", oncontextmenu);
	util.addEvent(document, "mousedown", onmousedown);
	util.addEvent(document, "mouseup", onmouseup);
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
	var target = util.getTarget(event);
	var button = util.getMouseButton(event);	
	
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
	var target = util.getTarget(event);
	var button = util.getMouseButton(event);

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
	var target = util.getTarget(event);

	if(!this.listTitle.isInputEdited){
		var button = util.getMouseButton(event);

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
	var target = util.getTarget(event);
	var button = util.getMouseButton(event);

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
	var maskTarget = util.getTarget(event);

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
;/**
 * Contains the EditBar class.
 * @file
 */

(function(){

	/** @private */
	var _private = new Private;

	/**
	 * Provide the cards's edition bar
	 * @constructor
	 */
	EditBar = function(){
		var editBar = document.createElement("div");
		editBar.style.top = "100%";
		editBar.className = "card-editBar";
		
		/** used to animate the edit bar */
		this.animId;
		this.visible = false;
		this.animated = false;
		
		/** allows to lock the edit bar */
		this.locked = false;
		
		/** create the interface manager to manage buttons. */
		this.UI = new UI;
		
		/** create the mode handler to manage modes. */
		this.modeHandler = new ModeHandler;
		
		/** the editBar inherit from the current object */
		util.inherit(editBar, this);
		
		/** the buttons */
		editBar.UI.newButton("remove");
		editBar.UI.newButton("edition");
		editBar.UI.newButton("fontFamily");
		editBar.UI.newButton("bold");
		editBar.UI.newButton("italic");
		editBar.UI.newButton("underline");
		
		/** creates the font family menu */
		editBar.UI.onPressButton("fontFamily", createFontFamilyMenu);
		
		/** the standard mode */
		editBar.modeHandler.newMode("standard", function(){
			/** close Button */
			btnRemove = document.createElement("div");
			btnRemove.className = "card-btn card-btnRemove";
			btnRemove.title = "Remove";
			editBar.appendChild(btnRemove);
			editBar.UI.setButtonNode("remove", btnRemove);

			/** edit Button */
			btnEdit = document.createElement("div");
			btnEdit.className = "card-btn card-btnEdit";
			btnEdit.title = "Edition";
			editBar.appendChild(btnEdit);
			editBar.UI.setButtonNode("edition", btnEdit);
			
			/** enable the buttons */
			editBar.UI.enableButton("remove");
			editBar.UI.enableButton("edition");
			
			/** set the mode */
			_private.set("mode", "standard", editBar);
		});
		
		editBar.modeHandler.destructor("standard", function(){
			var btnRemove = editBar.button("remove");
			var btnEdit = editBar.button("edition");
			
			/** erases the standard mode. */
			btnRemove.parentNode.removeChild(btnRemove);
			btnEdit.parentNode.removeChild(btnEdit);
			
			/** puts the attributes to null */
			editBar.UI.disableButton("remove");
			editBar.UI.disableButton("edition");
		});
		
		/** the edition mode */
		editBar.modeHandler.newMode("edition", function(){
			/** fontFamily */
			var btnFontFamily = document.createElement("div");
			btnFontFamily.className = "card-btn card-btnFontFamily";
			btnFontFamily.title = "Font Style";
			var fontName = document.createTextNode("Verdana");
			btnFontFamily.appendChild(fontName);
			editBar.appendChild(btnFontFamily);
			editBar.UI.setButtonNode("fontFamily", btnFontFamily);
		
			/** bold Button */
			var btnBold = document.createElement("div");
			btnBold.className = "card-btn card-btnBold";
			btnBold.title = "Bold";
			editBar.appendChild(btnBold);
			editBar.UI.setButtonNode("bold", btnBold);
			
			/** italic Button */
			var btnItalic = document.createElement("div");
			btnItalic.className = "card-btn card-btnItalic";
			btnItalic.title = "Italic";
			editBar.appendChild(btnItalic);
			editBar.UI.setButtonNode("italic", btnItalic);
			
			/** underline Button */
			var btnUnderline = document.createElement("div");
			btnUnderline.className = "card-btn card-btnUnderline";
			btnUnderline.title = "Underline";
			editBar.appendChild(btnUnderline);
			editBar.UI.setButtonNode("underline", btnUnderline, editBar);
			
			/** enable the button */
			editBar.UI.enableButton("fontFamily");
			editBar.UI.enableButton("bold");
			editBar.UI.enableButton("italic");
			editBar.UI.enableButton("underline");
		
			/** set the mode */
			_private.set("mode", "edition", editBar);
		});
		
		editBar.modeHandler.destructor("edition", function(){
			/** get buttons */
			var btnFontFamily = editBar.button("fontFamily");
			var btnBold = editBar.button("bold");
			var btnItalic = editBar.button("italic");
			var btnUnderline = editBar.button("underline");
			
			/** remove nodes */
			btnFontFamily.parentNode.removeChild(btnFontFamily);
			btnBold.parentNode.removeChild(btnBold);
			btnItalic.parentNode.removeChild(btnItalic);
			btnUnderline.parentNode.removeChild(btnUnderline);
			
			/** disable the buttons */
			editBar.UI.disableButton("fontFamily");
			editBar.UI.disableButton("bold");
			editBar.UI.disableButton("italic");
			editBar.UI.disableButton("underline");
		});
		
		/** puts the edit bar in standard mode */
		editBar.mode("standard");
		
		/** hides the edit bar */
		editBar.hide();
		
		return editBar;
	}
	
	/** return a reference on the node of the named button. */
	EditBar.prototype.button = function(name){
		return this.UI.button(name);
	}
	
	/**
	 * Allows to determine actions when a button is pressed
	 * @memberof EditBar#
	 */
	EditBar.prototype.onPressButton = function(name, callback){
		this.UI.onPressButton(name, callback);
	}
	
	/**
	 * Allows to put the edit bar into standard mode.
	 * @memberof EditBar#
	 */
	EditBar.prototype.mode = function(name){
		this.modeHandler.mode(name);
	}
	
	/**
	 * @memberof EditBar#
	 */
	EditBar.prototype.show = function(frameRate, firstIteration){
		var anim = true;

		if(typeof(firstIteration) == "undefined"){
			var firstIteration = true;
		}

		if(this.animated  && !this.visible && firstIteration){
			clearTimeout(this.animId);
			this.animated = false;
			this.animId = 0;
		}else if(this.visible && firstIteration){
			anim = false;
		}else if(this.locked){
			this.hide();
			anim = false;
		}else if(!this.animated && !this.visible){
			var ref = this.show.bind(this);
			this.animated = true;
			this.visible = true;
			
			/** waits before launch the animation */
			this.animId = setTimeout(function(){ref(frameRate, false)}, 600) 
			anim = false;
		}

		if(anim){
			/** @default */
			if(typeof(frameRate) == "undefined"){
				var frameRate = 10;
			}

			var heightEditBar = parseFloat(util.getStyle(this, "height")); // finds it in pixels
			var heightCard = parseFloat(this.parentNode.offsetHeight);
			var finalTop = heightCard - heightEditBar;
			var that = this;
			animate(this, "up", frameRate, finalTop, function(){
				that.animated = false;
				that.visible = true;
			});
		}
	}

	/**
	 * Allows to animate the edit bar.
	 * @function
	 * @param {number} [frameRate] - The number of milliseconds between two state change.
	 * @memberof EditBar#
	 */
	EditBar.prototype.hide = function(frameRate, callback){
		var anim = true;

		if(this.animated && this.visible){
			clearTimeout(this.animId);
			this.animated = false;
			this.animId = 0;
		}else if(!this.visible){
			anim = false;
		}else if(this.locked){
			this.show();
			anim = false;
		}

		if(anim){
			/** @default */
			if(typeof(frameRate) == "undefined"){
				var frameRate = 10;
			}
			
			/** the height of its parent card */
			var finalTop = parseFloat(this.parentNode.offsetHeight);
			var that = this;
			
			this.animated = true;
			this.visible = false;
			animate(this, "down", frameRate, finalTop, function(){
				that.animated = false;
				that.visible = false;
				
				if(typeof(callback) != "undefined"){
						callback();
				}
			});
		}
	}
	
	/**
	 * allows to animate the edit bar
	 * @private
	 */
	function animate(editBar, direction, frameRate, finalTop, callback, firstIteration){
		/** @default */
		if(typeof(callback) == "undefined"){
			callback = function(){};
		}
	
		/** determine the operation among the direction */
		if(direction == "down"){
			operation = "+";
			comparison = "<";
		}else{
			operation = "-";
			comparison = ">";
		}
	
		/** @default */
		if(typeof(frameRate) == "undefined"){
			var frameRate = 10;
		}
		
		/** first iteration */
		if(typeof(firstIteration) == "undefined"){
			var firstIteration = true;
		}
		
		var top;
		if(firstIteration){
			top = parseFloat(util.getStyle(editBar, "top")); // in pixels
		}else{
			top = parseFloat(editBar.currentStyleTop);
		}

		if(eval("top " + operation + " 1 " + comparison + " finalTop")){
			if(firstIteration){
				firstIteration = false;
			}
		
			/** records the current style top */
			editBar.currentStyleTop = eval("top " + operation + " 1 + 'px'");
			editBar.style.top = eval("top " + operation + " 1 + 'px'");
			editBar.animId = setTimeout(function(){animate(editBar, direction, frameRate, finalTop, callback, firstIteration)}, frameRate);
		}else{
			editBar.style.top = finalTop + "px";
			callback();
		}
	}
	
	/**
	 *
	 * @function
	 */
	function createFontFamilyMenu(btnFontFamily){
		var menu = document.createElement("div");
		menu.className = "fontFamilyMenu";
		menu.style.position = "absolute";
		
		/** calculate the font family button absolute position */
		var elementX = 0;
		var elementY = 0;
		var element = btnFontFamily;
		do{
			elementX += element.offsetLeft;
			elementY += element.offsetTop;
			element = element.offsetParent;
		}while(element);
		
		var leftPaddingEditBar = util.getStyle(btnFontFamily.parentNode, 'padding-left');

		menu.style.top = elementY + parseFloat(util.getStyle(btnFontFamily, 'height')) + "px";
		menu.style.left = elementX - parseFloat(leftPaddingEditBar) + "px";
		document.body.appendChild(menu);
	}
})()
;/** @file This file contains the Card class. */

(function(){

	/** private attributes */
	var _private = new Private;

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

		/** the edit bar */
		this.editBar = new EditBar();
		card.appendChild(this.editBar);

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

		/** the card inherit from the current object */
		util.inherit(card, this);

		/** create the links between the card and several functionalities */
		connection(card);
		
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
			var list_onPressEdition = _private.get("list_onPressEdition", this);
			for(var i = 0; i < list_onPressEdition.length; i++){
				list_onPressEdition[i]();
			}
		
			this.editable = true;
			this.setDraggable(false);
			this.editBar.mode("edition");
			this.editBar.locked = true;
			
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
				
				this.setDraggable(true);
				this.editBar.locked = false;
				if(this.editBar.visible){
					var that = this;
					this.editBar.hide(1, function(){
						that.editBar.mode("standard");
					});
				}else{
					this.editBar.mode("standard");
				}
				
				this.editionArea.blur();
				this.editionArea.contentEditable = false;
				this.editionArea.style.cursor = "default";
				
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
		var list_onRemoval = _private.get("list_onRemoval", this);
		for(var i = 0; i < list_onRemoval.length; i++){
			list_onRemoval[i]();
		}
	
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
	Card.prototype.onRemoval = function(callback){
		var list_onRemoval = _private.get("list_onRemoval", this);
		list_onRemoval.push(callback);
	}
	
	/**
	 * Allows to determine actions when the edit button is pressed
	 * @memberof Card#
	 */
	Card.prototype.onPressEdition = function(callback){
		var list_onPressEdition = _private.get("list_onRemoval", this);
		list_onPressEdition.push(callback);
	}

	/**
	 * @memberof Card#
	 * @event
	 */
	Card.prototype.EVENT_onmousedown = function(event){
		var target = util.getTarget(event);
		var button = util.getMouseButton(event);

		if(button == 1 && target != this.editBar && !util.hasParent(target, this.editBar)){
			/** makes the card draggable */
			if(this.editable && target != this.editionArea && !this.editionArea.cMenu.isChildNode(target)){
				this.setDraggable(true);
			}
			
			/** drag */
			if(this.draggable && (target == this || util.hasParent(target, this))){
				/** prevents the default behaviour */
				event.returnValue = false;
				if(event.preventDefault){
					event.preventDefault();
				}

				this.dragged = true;
				this.style.zIndex = 99;
				this.editBar.hide(2);
				this.editBar.locked = true;

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
		var target = util.getTarget(event);
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
		var target = util.getTarget(event);
		var button = util.getMouseButton(event);

		if(button == 1){
			if(this.dragged){
				/** prevent the default behaviour */
				util.preventDefault(event);

				/** puts back the attributes to 0 */
				this.dragged = false;
				this.offsetX = 0;
				this.offsetY = 0;
				this.editBar.locked = false;

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
			}
		}
	}

	/**
	 * Flies over the other cards or lists. 
	 * @memberof Card#
	 * @event
	 */
	Card.prototype.EVENT_onmouseover = function(event){
		var target = util.getTarget(event);

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
			this.editBar.show();
		}else{
			this.editBar.hide();
		}
	}

	/**
	 * @memberof Card#
	 * @event
	 */
	Card.prototype.EVENT_onkeydown = function(event){
		var target = util.getTarget(event);
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
			var heightEditBar = util.getStyle(this.editBar, "height");
			this.editBar.style.top = "calc(100% - " + heightEditBar + ")";
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

	/*****************************************\
			PRIVATE METHODS
	\*****************************************/
	
	/**
	 * Connect a card with several functionalities
	 * Used by the constructor.
	 * @function
	 * @private
	 */
	function connection(card){
		/** creates privates variables */
		_private.set("list_onRemoval", [], card);
		_private.set("list_onPressEdition", [], card);
	
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
		
		/** creates the context menu of the card*/
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
		
		/** creates the context menu of the edition area */
		card.editionArea.cMenu = ContextMenu(card.editionArea, 
			[ /** the labels of the context menu */
				function(){ return app.TEXT["Undo"]},
				function(){ return app.TEXT["Redo"]},
				function(){ return app.TEXT["Cut"]},
				function(){ return app.TEXT["Copy"]},
				function(){ return app.TEXT["Paste"]},
				function(){ return app.TEXT["Left align"]},
				function(){ return app.TEXT["Center align"]},
				function(){ return app.TEXT["Right align"]},
				function(){ return app.TEXT["Bold"]},
				function(){ return app.TEXT["Italic"]},
				function(){ return app.TEXT["Underline"]}
			],
			[ /** the actions of the context menu */
				card.editionArea.undo.bind(card.editionArea),
				card.editionArea.redo.bind(card.editionArea),
				card.editionArea.cut.bind(card.editionArea),
				card.editionArea.copy.bind(card.editionArea),
				card.editionArea.paste.bind(card.editionArea),
				card.editionArea.leftAlign.bind(card.editionArea),
				card.editionArea.centerAlign.bind(card.editionArea),
				card.editionArea.rightAlign.bind(card.editionArea),
				card.editionArea.bold.bind(card.editionArea),
				card.editionArea.italic.bind(card.editionArea),
				card.editionArea.underline.bind(card.editionArea)
			]
		)
		
		/** disable the context menu */
		card.editionArea.cMenu.enable = false;
		
		/** connection to the edit bar buttons */
		card.editBar.onPressButton("edition", function(){
			card.setEditable(true);
		});
		card.editBar.onPressButton("remove", function(){
			card.remove();
		});
		card.editBar.onPressButton("bold", function(){
			card.editionArea.bold();
		});
		card.editBar.onPressButton("italic", function(){
			card.editionArea.italic();
		});
		card.editBar.onPressButton("underline", function(){
			card.editionArea.underline();
		});
		
		/** set the card as editable */
		card.setEditable(true);
	}
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
