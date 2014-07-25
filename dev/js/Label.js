/**
 * Allows to create labels with advanced properties.
 * NOTE: 
 *		Cette version des label ne fait pas augmenter la taille de l'input
 *		en fonction de ce qui est tapé. La taille est fixe.
 *
 * @constructor
 * @param {string} [text] - The text contained in the label.
 * @param {string} [tag] - The tag used to create the label.
 * @returns {object} container - The DOM object representing the label
 */
function Label(text, tag){
	if(typeof(tag) == "undefined"){
		this.tag = "p";
	}else{
		this.tag = tag;
	}
	
	this.defaultInputWidth = 20; // In pixel
	this.maxInputWidth = 0;
	this.inputWidth = 0;

	this.text = "";
	this.inputEditable = false;
	this.isInputEdited = false;
	this.startClick = 0;
	this.clickDuration = 100
	this.listIntagAttribute = [];
	
	//On crée l'objet
	var container = document.createElement("span");
	
	// Create the object inside
	this.intag = document.createElement(this.tag);
	
	container.appendChild(this.intag);
	
	// The container inherit from the current object
	util.inherit(container, this);
	
	//We set the text
	if(typeof(text) != "undefined"){
		container.setText(text)
	}
	
	// References on the functions which allow to handle the animations
	container.REF_EVENT_onmousedown = container.EVENT_onmousedown.bind(container);
	container.REF_EVENT_onmouseup = container.EVENT_onmouseup.bind(container);
	container.REF_EVENT_onkeydown = container.EVENT_onkeydown.bind(container);
	container.REF_EVENT_writing = container.EVENT_writing.bind(container);
	
	// return the container
	return container;
}

/**
 * Getter for the text attribute.
 * @function getText
 * @memberof Label.prototype
 * @returns {string}  
 */
Label.prototype.getText = function(){
	return this.text;
}

/**
 * Setter for the text attribute.
 * @function setText
 * @memberof Label.prototype
 * @param {string} newText
 */
Label.prototype.setText = function(newText){
	var listAttributes = this.intag.attributes;
	this.text = newText;
	this.removeChild(this.intag);
	
	this.intag = document.createElement(this.tag);
	this.intag.innerHTML = this.text;
	
	//We set the attributes
	for(var i = 0; i<listAttributes.length; i++){
		this.intag.setAttribute(listAttributes.item(i).name, listAttributes.item(i).nodeValue);
	}

	this.appendChild(this.intag);
}

/**
 * @memberof Label.prototype
 */
Label.prototype.setAttribute = function(attribute, value){
	this.intag.setAttribute(attribute, value);
}

/**
 * Standard Editable
 * @memberof Label.prototype
 */
Label.prototype.isStandardEditable = function(){
	return this.contentEditable;
}

/**
 * @memberof Label.prototype
 */
Label.prototype.setStandardEditable = function(bool){
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
 * @memberof Label.prototype
 */
Label.prototype.isInputEditable = function(){
	return this.inputEditable;
}

/**
 * @memberof Label.prototype
 */
Label.prototype.setInputEditable = function(bool){
	if(bool){
		this.inputEditable = true;
		util.addEvent(document, 'mousedown', this.REF_EVENT_onmousedown);
		util.addEvent(document, 'mouseup', this.REF_EVENT_onmouseup);
	}else{
		if(this.inputEditable){
			this.inputEditable = false;
			util.removeEvent(document, 'mousedown', this.REF_EVENT_onmousedown);
		}
	}
}

/**
 * @memberof Label.prototype
 */
Label.prototype.EVENT_onmousedown = function(event){
	var target = event.target || event.srcElement;

	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}	
	
	if(button == 1 && (target == this || util.hasParent(target, this))){
		this.startClick = new Date();
	}else if(button == 1 && this.isInputEdited){
		//On empèche le comportement par défaut de l'évênement
		event.returnValue = false; 
		if(event.preventDefault) event.preventDefault();

		this.reset();
		
		// We remove the "onkeydown" events
		util.removeEvent(document, 'keydown', this.REF_EVENT_onkeydown);
		
		// We add the "onmouseup" event
		util.addEvent(document, 'mouseup', this.REF_EVENT_onmouseup);
	}
}

/**
 * @memberof Label.prototype
 */
Label.prototype.EVENT_onmouseup = function(event){
	var target = event.target || event.srcElement;
	
	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}

	if(button == 1 && (target == this || util.hasParent(target, this))){
		var now = new Date();
		var currentClickDuration = now - this.startClick;

		if(currentClickDuration < this.clickDuration){
			//On empèche le comportement par défaut de l'évênement
			event.returnValue = false; 
			if(event.preventDefault) event.preventDefault();
			
			// We remove the event		
			util.removeEvent(document, 'click', this.REF_EVENT_ondblclick);		
			
			//On lance l'edition via un input
			this.inputEdit();
			
			// we add the "onkeydown" event which will allow to restore the label
			util.addEvent(document, 'keydown', this.REF_EVENT_onkeydown);
		}
	}
}

/**
 * @memberof Label.prototype
 */
Label.prototype.EVENT_onkeydown = function(event){ // On remet tout dans son état normal si la touche "Entrée" a été préssée
	if(event.keyCode == 13){
		var target = event.target || event.srcElement;
		if(this.isInputEdited){
			//On empèche le comportement par défaut de l'évênement
			event.returnValue = false; 
			if(event.preventDefault) event.preventDefault();
	
			this.reset();
			
			// We remove the "onclick" event and the "keydown" event
			util.removeEvent(document, 'keydown', this.REF_EVENT_onkeydown);
		}
	}
}

/**
 * @memberof Label.prototype
 */
Label.prototype.inputEdit = function(){
	if(!this.isInputEdited){
		this.isInputEdited = true;

		this.setText(this.intag.innerHTML);

		//On remplace la balise "p" du dom par une balise 'input type="text"'
		//Partie 1: on gère le style
		newInput = document.createElement("input");
		this.inheritStyleInput(newInput);
		
		//Partie 2: on efface la balise de texte pour mettre un input à la place
		this.innerHTML = "";
		newInput.setAttribute("type", "text");
		this.appendChild(newInput);
		newInput.focus(); //On met le focus sur l'input text
		newInput.value = this.text; //On place le texte après le focus afin que le curseur soit placé à la fin du texte
		
		//Partie 3: on ajoute un évenement sur l'input qui permet de l'agrandir si on a plus de lettres qu'au départ.
		util.addEvent(document, 'keydown', this.REF_EVENT_writing);
		this.listIntagAttribute = this.intag.attributes;
		this.intag = newInput;
	}
}

//NOTE: varie selon le caractère, à rendre plus précis.
/**
 * @memberof Label.prototype
 */
Label.prototype.EVENT_writing = function(event){
	var input = this.intag;		
	
	if(this.inputWidth == 0){
		// We calculate the width of a medium char
		var currentWidth = parseInt(input.style.width);
		
		if(event.keyCode != 8 && event.keyCode != 46){ // We add letters
			if(this.maxInputWidth == 0 || currentWidth + parseInt(this.oneCharWidth) <= this.maxInputWidth){
				input.style.width = currentWidth + parseInt(this.oneCharWidth) + "px"; 	//TAILLE
			}else{
				input.style.width = this.maxInputWidth + "px"; 	//TAILLE
			}
		}else{ // We remove letters
			if(this.maxInputWidth == 0 || currentWidth - parseInt(this.oneCharWidth) <= this.maxInputWidth){
				input.style.width = currentWidth - parseInt(this.oneCharWidth) + "px"; 	//TAILLE
			}else{
				input.style.width = this.maxInputWidth + "px"; 	//TAILLE
			}
		}
	}

	this.text = input.value;
}

/**
 * @memberof Label.prototype
 */
Label.prototype.reset = function(){
	this.isInputEdited = false;

	//On remet en état la balise
	this.text = this.intag.value;
	this.innerHTML = "";
	this.intag = document.createElement(this.tag);
	this.intag.innerHTML = this.text;
	
	//We set the attributes
	for(var i = 0; i<this.listIntagAttribute.length; i++){
		this.intag.setAttribute(this.listIntagAttribute.item(i).name, this.listIntagAttribute.item(i).nodeValue);
	}
	
	this.appendChild(this.intag);
	
	util.removeEvent(document, 'keydown', this.REF_EVENT_writing);
}

/**
 * @memberof Label.prototype
 */
Label.prototype.inheritStyleInput = function(newInput){
	var parentNode = this.parentNode;
	var oldContent = this.intag;
	var textOldContent = oldContent.firstChild;
	
	//AFFICHAGE
	newInput.style.display = "block";
	
	//TAILLE
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
	
	//MARGIN
	if(util.getStyle(oldContent, "margin-left") != "0px"){ //Gauche
		newInput.style.marginLeft = util.getStyle(oldContent, "margin-left");
	}
	if(util.getStyle(oldContent, "margin-right") != "0px"){ //Droite
		newInput.style.marginRight = util.getStyle(oldContent, "margin-right");
	}
	
	if(util.getStyle(parentNode, "text-align") == "center"){ //Centrage
		newInput.style.margin = "0 auto";
	}
	
	if(util.getStyle(oldContent, "margin-top") != "0px"){ //Haut
		newInput.style.marginTop = util.getStyle(oldContent, "margin-top");
	}
	if(util.getStyle(oldContent, "margin-bottom") != "0px"){ //Bas
		newInput.style.marginBottom = util.getStyle(oldContent, "margin-bottom");
	}
	
	//FONT
	newInput.style.fontSize = util.getStyle(oldContent, "font-size");
	newInput.style.fontWeight = util.getStyle(oldContent, "font-weight");
	newInput.style.fontFamily = util.getStyle(oldContent, "font-family");
	
	//ALIGNEMENT DU TEXTE
	if(util.getStyle(parentNode, "text-align") == "left"){ //Gauche
		newInput.style.textAlign = "left";
	}
	if(util.getStyle(parentNode, "text-align") == "right"){ //Droite
		newInput.style.textAlign = "right";
	}
	if(util.getStyle(parentNode, "text-align") == "center"){ //Centrage
		newInput.style.textAlign = "center";
	}
	if(util.getStyle(parentNode, "text-align") == "justify"){ //Justifié
		newInput.style.textAlign = "justify";
	}
}