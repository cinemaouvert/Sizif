/**
 * Contains the ContactManager class.
 * The ContactManager class provide a meaning to manage
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
	ContactManager = function(){}
	
	/** return a reference on the node of the named button. */
	ContactManager.prototype.button = function(name){
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
	ContactManager.prototype.newButton = function(name, node){
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
	ContactManager.prototype.setButtonNode = function(name, node){
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
	ContactManager.prototype.enableButton = function(name){
		setStateButton(name, "enable", this);
	}
	
	/**
	 * disable a button
	 * @function
	 * @param {string} name - the name of the button.
	 */
	ContactManager.prototype.disableButton = function(name){
		setStateButton(name, "disable", this);
	}
	
	/**
	 * get a button state
	 * @function
	 * @param {string} name - the name of the button.
	 */
	ContactManager.prototype.getStateButton = function(name){
		var listBtn = _private.get("listBtn", this);
		for(var i = 0; i < listBtn.length; i++){
			if(listBtn[i].name == name){
				return listBtn[i].state;
			}
		}
	}
	
	/** prevent the contact area to be active */
	ContactManager.prototype.lock = function(){
		_private.set("locked", true, this);
	}
	
	/** prevent the contact area to be active  */
	ContactManager.prototype.unlock = function(){
		_private.set("locked", false, this);
	}
	
	/** return the current state of the contact manager */
	ContactManager.prototype.getState = function(){
		return _private.get("locked", this);
	}
	
	/**
	 * Allows to determine actions when a button is pressed
	 * @memberof ContactManager#
	 */
	ContactManager.prototype.onPressButton = function(name, callback){
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
