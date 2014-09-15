/**
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
		
		/** create the contact manager to manage buttons. */
		this.contact = new ContactManager;
		
		/** the editBar inherit from the current object */
		util.inherit(editBar, this);
		
		/** the buttons */
		editBar.contact.newButton("remove");
		editBar.contact.newButton("edition");
		editBar.contact.newButton("fontStyle");
		editBar.contact.newButton("bold");
		editBar.contact.newButton("italic");
		editBar.contact.newButton("underline");
		
		/** puts the edit bar in standard mode */
		editBar.standardMode();
		
		/** hides the edit bar */
		editBar.hide();
		
		return editBar;
	}
	
	/** return a reference on the node of the named button. */
	EditBar.prototype.button = function(name){
		return this.contact.button(name);
	}
	
	/**
	 * Allows to determine actions when a button is pressed
	 * @memberof EditBar#
	 */
	EditBar.prototype.onPressButton = function(name, callback){
		return this.contact.onPressButton(name, callback);
	}
	
	/**
	 * Allows to put the edit bar into standard mode.
	 * @memberof EditBar#
	 */
	EditBar.prototype.standardMode = function(erase){
		/** erases the mode. */
		if(typeof(erase) != "undefined" && erase){
			var btnRemove = this.contact.button("remove");
			var btnEdit = this.contact.button("edition");
			
			/** erases the standard mode. */
			btnRemove.parentNode.removeChild(btnRemove);
			btnEdit.parentNode.removeChild(btnEdit);
			
			/** puts the attributes to null */
			this.contact.disableButton("remove");
			this.contact.disableButton("edition");
				
		/** creates the mode. */
		}else{
			var mode = _private.get("mode", this);
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
				this.contact.setButtonNode("remove", btnRemove);

				/** edit Button */
				btnEdit = document.createElement("div");
				btnEdit.className = "card-btn card-btnEdit";
				btnEdit.title = "Edition";
				this.appendChild(btnEdit);
				this.contact.setButtonNode("edition", btnEdit);
				
				/** enable the buttons */
				this.contact.enableButton("remove");
				this.contact.enableButton("edition");
				
				/** set the mode */
				_private.set("mode", "standard", this);
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
			var btnFontStyle = this.contact.button("fontStyle");
			var btnBold = this.contact.button("bold");
			var btnItalic = this.contact.button("italic");
			var btnUnderline = this.contact.button("underline");
			
			btnBold.parentNode.removeChild(btnBold);
			btnItalic.parentNode.removeChild(btnItalic);
			btnUnderline.parentNode.removeChild(btnUnderline);
			
			/** disable the button */
			this.contact.disableButton("fontStyle");
			this.contact.disableButton("bold");
			this.contact.disableButton("italic");
			this.contact.disableButton("underline");
			
		/** creates the mode. */
		}else{
			var mode = _private.get("mode", this);
			if(typeof(mode) == "undefined" || (typeof(mode) != "undefined" && mode != "edition")){
				/** erase the current mode */
				if(typeof(mode) != "undefined" && mode == "standard"){
					this.standardMode(true);
				}
			
				/** fontStyle */
				var btnFontStyle = document.createElement("div");
				btnFontStyle.className = "card-btn card-btnFontStyle";
				btnFontStyle.title = "Font Style";
				this.appendChild(btnFontStyle);
				this.contact.setButtonNode("bold", btnFontStyle);
			
				/** bold Button */
				var btnBold = document.createElement("div");
				btnBold.className = "card-btn card-btnBold";
				btnBold.title = "Bold";
				this.appendChild(btnBold);
				this.contact.setButtonNode("bold", btnBold);
				
				/** italic Button */
				var btnItalic = document.createElement("div");
				btnItalic.className = "card-btn card-btnItalic";
				btnItalic.title = "Italic";
				this.appendChild(btnItalic);
				this.contact.setButtonNode("italic", btnItalic);
				
				/** underline Button */
				var btnUnderline = document.createElement("div");
				btnUnderline.className = "card-btn card-btnUnderline";
				btnUnderline.title = "Underline";
				this.appendChild(btnUnderline);
				this.contact.setButtonNode("underline", btnUnderline, this);
				
				/** enable the button */
				this.contact.enableButton("fontStyle");
				this.contact.enableButton("bold");
				this.contact.enableButton("italic");
				this.contact.enableButton("underline");
			
				/** set the mode */
				_private.set("mode", "edition", this);
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
})()
