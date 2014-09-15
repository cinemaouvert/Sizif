/**
 * Allows to put the edit bar into standard mode.
 * @memberof ContactArea#
 */
ContactArea.prototype.standardMode = function(erase){
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
 * @memberof ContactArea#
 */
ContactArea.prototype.editionMode = function(erase){
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