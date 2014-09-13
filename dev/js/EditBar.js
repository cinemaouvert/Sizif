/**
 * Contains the EditBar class.
 * @file
 */

(function(){
	/** 
	 * connector 
	 * @private
	 */
	var list_onPressBtnRemove = [];
	var list_onPressBtnEdit = [];

	/** @private */
	var locked = false;

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
		
		/** the editBar inherit from the current object */
		util.inherit(editBar, this);
		
		/** the buttons */
		createButton("remove", editBar);
		createButton("edition", editBar);
		createButton("bold", editBar);
		createButton("italic", editBar);
		createButton("underline", editBar);
		
		/** puts the edit bar in standard mode */
		editBar.standardMode();
		
		/** hides the edit bar */
		editBar.hide();
		
		/** create the reference to the event functions */
		editBar.REF_onMouseUp = editBar.onMouseUp.bind(editBar);
		editBar.REF_onMouseDown = editBar.onMouseDown.bind(editBar);

		/** events */
		util.addEvent(document, "mouseup", editBar.REF_onMouseUp);
		util.addEvent(document, "mousedown", editBar.REF_onMouseDown);
		
		return editBar;
	}
	
	/** return a reference on the node of the named button. */
	EditBar.prototype.button = function(name){
		var listBtn = privateAttribute("listBtn", this);
		for(var i = 0; i < listBtn.length; i++){
			if(listBtn[i].name == name){
				return listBtn[i].node;
			}
		}
	}
	
	/**
	 * Allows to create button.
	 * @private
	 * @function
	 */
	function createButton(name, instance){
		var listBtn = privateAttribute("listBtn", instance);
		if(typeof(listBtn) == "undefined"){
			listBtn = [];
			
			/** adds a new entry */
			listBtn.push({name: name, node: null, onPress: []});
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
				listBtn[id].node = null;
				listBtn[id].onPress = [];
				
			/** adds a new entry */
			}else{
				listBtn.push({name: name, node: null, onPress: []});
			}
		}
		
		setPrivateAttribute("listBtn", listBtn, instance);
	}
	
	/**
	 * Determine a node button
	 * @private
	 * @function
	 */
	function buttonNode(name, node, instance){
		var listBtn = privateAttribute("listBtn", instance);
		for(var i = 0; i < listBtn.length; i++){
			if(listBtn[i].name == name){
				listBtn[i].node = node;
				break;
			}
		}
		setPrivateAttribute("listBtn", listBtn, this);
	}
	
	/**
	 * enable a button
	 * @private
	 * @function
	 */
	function enableButton(name, instance){
		setStateButton(name, "enable", instance);
	}
	
	/**
	 * enable a button
	 * @private
	 * @function
	 */
	function disableButton(name, instance){
		setStateButton(name, "disable", instance);
	}
	
	/**
	 * Set the state of a button.
	 * Used by the functions enableButton and disableButton
	 * @private
	 * @function
	 */
	function setStateButton(name, state, instance){
		var listBtn = privateAttribute("listBtn", instance);
		for(var i = 0; i < listBtn.length; i++){
			if(listBtn[i].name == name){
				listBtn[i].state = state;
				break;
			}
		}
		setPrivateAttribute("listBtn", listBtn, this);
	}
	
	/** prevent the edit bar to be active and animated */
	EditBar.prototype.lock = function(){
		locked = true;
	}
	
	/** puts the edit bar in its normal state */
	EditBar.prototype.unlock = function(){
		locked = false;
	}
	
	/**
	 * Allows to determine actions when a button is pressed
	 * @memberof EditBar#
	 */
	EditBar.prototype.onPressButton = function(name, callback){
		var listBtn = privateAttribute("listBtn", this);
		for(var i = 0; i < listBtn.length; i++){
			if(listBtn[i].name == name){
				listBtn[i].onPress.push(callback);
				break;
			}
		}
		setPrivateAttribute("listBtn", listBtn, this);
	}
	
	/**
	 * Allows to put the edit bar into standard mode.
	 * @memberof EditBar#
	 */
	EditBar.prototype.standardMode = function(erase){
		/** erases the mode. */
		if(typeof(erase) != "undefined" && erase){
			var btnRemove = this.button("remove");
			var btnEdit = this.button("edition");
			
			/** erases the standard mode. */
			btnRemove.parentNode.removeChild(btnRemove);
			btnEdit.parentNode.removeChild(btnEdit);
			
			/** puts the attributes to null */
			disableButton("remove", this);
			disableButton("edition", this);
				
		/** creates the mode. */
		}else{
			var mode = privateAttribute("mode", this);
			if(typeof(mode) == "undefined" || (typeof(mode) != "undefined" && mode != "standard")){
				/** erase the current mode */
				if(typeof(mode) != "undefined" && mode == "edition"){
					this.editionMode(true);
				}
			
				/** close Button */
				btnRemove = document.createElement("div");
				btnRemove.className = "card-btn card-btnRemove";
				btnRemove.title = "Remove";
				this.appendChild(btnRemove);
				buttonNode("remove", btnRemove, this);

				/** edit Button */
				btnEdit = document.createElement("div");
				btnEdit.className = "card-btn card-btnEdit";
				btnEdit.title = "Edition";
				this.appendChild(btnEdit);
				buttonNode("edition", btnEdit, this);
				
				// TEST
				enableButton("remove", this);
				enableButton("edition", this);
				
				/** set the mode */
				setPrivateAttribute("mode", "standard", this);
			}
		}
	}
	
	/**
	 * Allows to put the edit bar into edition mode.
	 * @memberof EditBar#
	 */
	EditBar.prototype.editionMode = function(erase){
		/** erases the mode. */
		if(typeof(erase) != "undefined" && erase){
			var btnBold = this.button("bold");
			var btnItalic = this.button("italic");
			var btnUnderline = this.button("underline");
			
			btnBold.parentNode.removeChild(btnBold);
			btnItalic.parentNode.removeChild(btnItalic);
			btnUnderline.parentNode.removeChild(btnUnderline);
			
			/** disable the button */
			disableButton("bold", this);
			disableButton("italic", this);
			disableButton("underline", this);
			
		/** creates the mode. */
		}else{
			var mode = privateAttribute("mode", this);
			if(typeof(mode) == "undefined" || (typeof(mode) != "undefined" && mode != "edition")){
				/** erase the current mode */
				if(typeof(mode) != "undefined" && mode == "standard"){
					this.standardMode(true);
				}
			
				/** bold Button */
				btnBold = document.createElement("div");
				btnBold.className = "card-btn card-btnBold";
				btnBold.title = "Bold";
				this.appendChild(btnBold);
				buttonNode("bold", btnBold, this);
				
				/** italic Button */
				btnItalic = document.createElement("div");
				btnItalic.className = "card-btn card-btnItalic";
				btnItalic.title = "Italic";
				this.appendChild(btnItalic);
				buttonNode("italic", btnItalic, this);
				
				/** underline Button */
				btnUnderline = document.createElement("div");
				btnUnderline.className = "card-btn card-btnUnderline";
				btnUnderline.title = "Underline";
				this.appendChild(btnUnderline);
				buttonNode("underline", btnUnderline, this);
				
				/** disable the button */
				enableButton("bold", this);
				enableButton("italic", this);
				enableButton("underline", this);
			
				/** set the mode */
				setPrivateAttribute("mode", "edition", this);
			}
		}
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
		}else if(locked){
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
		}else if(locked){
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
	 * Allows to handle buttons 
	 * @event
	 */
	EditBar.prototype.onMouseUp = function(event){
		var target = util.getTarget(event);
		var button = util.getMouseButton(event);
		util.preventDefault(event);

		if(button == 1){
			var listBtn = privateAttribute("listBtn", this);
			
			for(var i = 0; i < listBtn.length; i++){
				if(listBtn[i].state == "enable" && (target == listBtn[i].node || util.hasParent(target, listBtn[i].node))){
					var onPress = listBtn[i].onPress;
					for(var j = 0; j < onPress.length; j++){
						onPress[j]();
					}
				}
			}
		}
	}
	
	/**
	 * Allows to prevent the default behaviour if a button is pressed.
	 * @event
	 */
	EditBar.prototype.onMouseDown = function(event){
		var target = util.getTarget(event);
		var button = util.getMouseButton(event);

		if(button == 1){
			var listBtn = privateAttribute("listBtn", this);
			for(var i = 0; i < listBtn.length; i++){
				if(target == listBtn[i].node || util.hasParent(target, listBtn[i].node)){
					util.preventDefault(event);
					return;
				}
			}
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
	
	// PRIVATE ATTRIBUTES
	var privateAttr_list = []; 
	var privateAttr_lastUsedId = -1;
	
	/** 
	 * Allows to add a private variable to an instance.
	 * @function
	 */
	function setPrivateAttribute(name, value, instance){
		if(privateAttr_lastUsedId != -1 && privateAttr_list[privateAttr_lastUsedId].instance == instance){
			privateAttr_list[privateAttr_lastUsedId].attributes[name] = value;
			return;
		}

		for(var i = 0; i < privateAttr_list.length; i++){
			if(privateAttr_list[i].instance == instance){
				privateAttr_list[i].attributes[name] = value;
				return;
			}
		}
		
		/** creates a new entry */
		var newEntry = {};
		newEntry["instance"] = instance;
		newEntry["attributes"] = [];
		newEntry.attributes[name] = value;
		
		privateAttr_list.push(newEntry); 
	}
	
	/** 
	 * Allows to get a private variable to an instance.
	 * @function
	 */
	function privateAttribute(name, instance){
		if(privateAttr_lastUsedId != -1 && privateAttr_list[privateAttr_lastUsedId].instance == instance){
			return privateAttr_list[privateAttr_lastUsedId].attributes[name];
		}
		
		for(var i = 0; i < privateAttr_list.length; i++){
			if(privateAttr_list[i].instance == instance){
				privateAttr_lastUsedId = i;
				return privateAttr_list[i].attributes[name];
			}
		}
		return undefined;
	}
})()
