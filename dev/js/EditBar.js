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
