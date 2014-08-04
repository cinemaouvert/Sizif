/** @file This file contains the ListTitle class. */

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
 * @todo varie selon le caractère, à rendre plus précis.
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
}