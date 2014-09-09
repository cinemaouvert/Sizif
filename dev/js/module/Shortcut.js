/**
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
