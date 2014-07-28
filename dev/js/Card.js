
/**
 * Provides cards
 * @constructor
 * @param {object} parentList - The list which contains the card.
 * @param {string} [text] - The card's text.
 * @returns {object} card - The DOM object representing the card.
 */
function Card(parentList, text){
	if(typeof(parentList) == "undefined"){
		throw "The card must have a parent list to be create.";
	}

	// we define as draggable all the other cards
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
	this.textHtml = "";

	//We create the card in the DOM
	var card = document.createElement("div");
	card.className = "card";

	//The text
	this.cardText = document.createElement("div");
	this.cardText.className = "card-text";
	this.cardText.setAttribute("data-translatable", true);
	card.appendChild(this.cardText);

	// The edit bar
	this.editBar = document.createElement("div");
	this.editBar.style.top = "100%";
	this.editBar.className = "card-editBar";
	card.appendChild(this.editBar);

	// Close Button
	this.btnClose = document.createElement("div");
	this.btnClose.className = "card-btnClose";
	this.editBar.appendChild(this.btnClose);

	// Edit Button
	this.btnEdit = document.createElement("div");
	this.btnEdit.className = "card-btnEdit";
	this.editBar.appendChild(this.btnEdit);

	if(typeof(text) != "undefined"){
		this.setText(text);
	}else{
		this.setText(TEXT["New card"]);
	}

	this.decalX = 0;
	this.decalY = 0;
	this.dropZone;
	this.dragged = false;
	this.draggable = false;
	this.editable = false;

	// We hide the edit bar
	this.anim;
	this.editBarVisible = false;
	this.editBarAnimated = false;
	this.hideEditBar();

	// The card inherit from the current object
	util.inherit(card, this);

	// References on the functions wich allow to handle animations.
	card.REF_EVENT_onmousedown = card.EVENT_onmousedown.bind(card);
	card.REF_EVENT_onmousemove = card.EVENT_onmousemove.bind(card);
	card.REF_EVENT_onmouseup = card.EVENT_onmouseup.bind(card);
	card.REF_EVENT_onmouseover = card.EVENT_onmouseover.bind(card);
	card.REF_EVENT_onkeydown = card.EVENT_onkeydown.bind(card);

	// Events
	util.addEvent(document, "mousedown", card.REF_EVENT_onmousedown);
	util.addEvent(document, "mouseover", card.REF_EVENT_onmouseover);
	util.addEvent(document, "mouseup", card.REF_EVENT_onmouseup);
	util.addEvent(document, "mousemove", card.REF_EVENT_onmousemove);

	// We set the current card as editable
	card.setEditable(true);
	
	// Add context menu
	
	ContextMenu.add(card, 
		{label: function(){ return TEXT["Add a card"]}, action: function(){card.parentList.addCard()}},
		{label: function(){ return TEXT["Undo"]}, action: function(){}}, 
		{label: function(){ return TEXT["Redo"]}, action: function(){}},
		{label: function(){ return TEXT["Remove the list"]}, action: function(){card.parentList.remove()}}
	)

	// We return the created card
	return card;
}

/**
 * @memberof Card.prototype
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
 * @memberof Card.prototype
 */
Card.prototype.setEditable = function(bool){
	if(bool && !this.editable){
		this.editable = true;
		this.setDraggable(false);
		this.hideEditBar(12);

		this.cardText.contentEditable = true;
		this.cardText.style.cursor = "text";
		this.cardText.focus();

		// Allow to put the Caret at the end of the text
		if (document.getSelection) {    // all browsers, except IE before version 9
			var sel = document.getSelection ();
			// sel is a string in Firefox and Opera,
			// and a selectionRange object in Google Chrome, Safari and IE from version 9
		}else{
			if(document.selection) {   // Internet Explorer before version 9
				var textRange = document.selection.createRange ();
			}
		}
		//sel.collapse(this.cardText.firstChild, this.cardText.textContent.length);

		// We add the "onkeydown" event
		util.addEvent(document, "keydown", this.REF_EVENT_onkeydown);
	}else if(this.editable){
		var isEmpty = /^\s*$/gi;
		if(isEmpty.test(this.getText())){
			this.cardText.blur();
			this.remove();
		}else{
			this.editable = false;
			this.setDraggable(true);
			this.cardText.contentEditable = false;
			this.cardText.style.cursor = "default";
			this.cardText.blur();
			this.cardText.innerHTML = this.textHtml;

			// We remove the "onkeydown" event
			util.removeEvent(document, "keydown", this.REF_EVENT_onkeydown);
		}
	}
}

/**
 * @memberof Card.prototype
 */
Card.prototype.remove = function(){
	// We remove the card from the static list
	if(Card.cardList.length > 0){
		for(var element in Card.cardList){
			if(Card.cardList[element] == this){
				delete Card.cardList[element];
		 	}
		}
	}

	// We remove the context menu
	ContextMenu.remove(this)
	
	// We remove the "onmousedown" event
	util.removeEvent(document, "mousedown", this.REF_EVENT_onmousedown);

	// We remove the current card
	this.parentNode.removeChild(this);
}

/**
 * @memberof Card.prototype
 */
Card.prototype.setText = function(newText){
	this.text = newText;
	this.textHtml = newText;
	this.cardText.text = newText;
	this.cardText.innerHTML = newText;
}

/**
 * @memberof Card.prototype
 */
Card.prototype.getText = function(){
	// Delete the style tags
	var childs = this.cardText.childNodes;

	for(var i = 0; i < childs.length; i++){
		if(childs[i].nodeType != 3){
			childs[i].parentNode.removeChild(childs[i]);
		}
	}

	var text = this.cardText.innerHTML;

	return text;
}

/**
 * @memberof Card.prototype
 * @event
 */
Card.prototype.EVENT_onmousedown = function(event){
	var target = event.target || event.srcElement;

	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}

	if(button == 1 && target != this.btnClose && target != this.btnEdit){
		if(this.editable && target != this.cardText){
			this.setDraggable(true);
		}

		if(this.draggable && (target == this || util.hasParent(target, this))){
			//On empèche le comportement par défaut
			event.returnValue = false;
			if(event.preventDefault){
				event.preventDefault();
			}

			this.dragged = true;
			this.style.zIndex = 99;
			this.hideEditBar(2);

			//On calcul la position de la souris dans l'objet afin de la fixer à l'endroit où elle le saisie en enregistrant le calcul dans les variable "decal".
			var mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
			var mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;

			//On calcul les eléments extérieurs à l'objet
			var elementX = 0;
			var elementY = 0;
			var element = this;
			do{
				elementX += element.offsetLeft;
				elementY += element.offsetTop;
				element = element.offsetParent;
			}while(element && util.getStyle(element, 'position') != 'absolute'  && util.getStyle(element, 'position') != 'fixed');

			this.decalX += mouseX - elementX;
			this.decalY += mouseY - elementY;

			// We create the drop zone
			this.dropZone = document.createElement("div");
			this.dropZone.style.height = util.getStyle(this, "height");
			this.dropZone.style.width = util.getStyle(this, "width");
			this.dropZone.className = "card-dropZone";
			this.parentNode.insertBefore(this.dropZone, this);

			// On transforme l'objet parent en position absolute
			this.style.width = util.getStyle(this, "width");
			var marginHeight = (this.offsetHeight - parseFloat(util.getStyle(this, "height")))/2
			this.style.left = elementX + 'px';
			this.style.top = elementY - marginHeight - 1 + 'px';
			this.style.position = "absolute";
			this.style.width = util.getStyle(this, "width");
			this.className = "card-caught";

			this.parentList.removeCard(this); // We remove the card from the parentList

			Card.createMask(); // We create the Cards's masks
			List.createMask(true); // We create the masks for the empty lists
			if(this.parentList.cardNumber() == 1){
				List.createMask(this.parentList); // We create a mask for the parentList if the current card is alone in it
			}

			// We remove the "onmousedown" event
			util.removeEvent(document, "mousedown", this.REF_EVENT_onmousedown);
		}
	}
}

/**
 * @memberof Card.prototype
 * @event
 */
Card.prototype.EVENT_onmousemove = function(event){
	var target = event.target || event.srcElement;
	if(this.dragged){
		// On récupère la position de la souris
		var x = event.clientX + (document.documentElement.scrollLeft + document.body.scrollLeft);
		var y = event.clientY + (document.documentElement.scrollTop + document.body.scrollTop);

		// On applique les différents décalages
		x -= this.decalX;
		y -= this.decalY;

		this.className = "card-dragged";
		this.style.left = x + 'px';
		this.style.top = y + 'px';
	}
}

/**
 * @memberof Card.prototype
 * @event
 */
Card.prototype.EVENT_onmouseup = function(event){
	var target = event.target || event.srcElement;

	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}

	if(button == 1 && this.dragged){
		/** prevent the default behavior */
		event.returnValue = false;
		if(event.preventDefault){
			event.preventDefault();
		}

		// On remet les attributs à 0
		this.dragged = false;
		this.decalX = 0;
		this.decalY = 0;

		/** remove the masks */
		Card.removeMask()
		List.removeMask()

		//On remet tout en état
		this.removeAttribute("style");
		this.className = "card";
		this.dropZone.parentNode.replaceChild(this, this.dropZone);

		/** handle the parentList property */
		this.parentList.removeCard(this); // remove the card from the parentList
		this.parentList = this.parentNode.parentNode; // change the "parentList" attribute
		this.parentList.addCard(this); // add the card to the new parent list

		this.dropZone = 'undefined';	// erase the "dropZone" attribute

		/** We add the "onmousedown" event */
		util.addEvent(document, "mousedown", this.REF_EVENT_onmousedown);

	}else if(button == 1 && target == this.btnEdit){
		this.setEditable(true);
	}else if(button == 1 && target == this.btnClose){
		this.remove();
	}
}

/**
 * Over the other lists
 * @memberof Card.prototype
 */
Card.prototype.EVENT_onmouseover = function(event){
	var target = event.target || event.srcElement;

	if(this.dragged && target.className == "card-mask"){
		var parentNode = target.hiddenCard.parentNode;

		List.createMask(true); // We create the empty lists's mask

		// On insert la carte draggée avant la carte survolée
		if(target.getAttribute("data-position") == "top"){
			parentNode.insertBefore(this.dropZone, target.hiddenCard);
		}

		// On insert la carte draggée après la carte survolée
		if(target.getAttribute("data-position") == "bottom"){
			parentNode.insertBefore(this.dropZone, target.hiddenCard.nextSibling);
		}

		List.resizeMask();

		// We set the style of the mask
		Card.replaceMask();
	}

	// We over an empty list
	if(this.dragged && target.className == "list-mask"){
		target.hiddenList.cardZone.appendChild(this.dropZone);
		List.resizeMask();
		Card.replaceMask();
	}

	if(target == this || util.hasParent(target, this)){
		this.showEditBar();
	}else{
		this.hideEditBar();
	}
}

/**
 * @memberof Card.prototype
 */
Card.prototype.EVENT_onkeydown = function(event){
	var target = event.target || event.srcElement;
	var key;

	if(BROWSER == "firefox"){
		key = event.key;
		if(key == "Backspace" || key == "Del"){
			key = '';
		}
	}else{
		key = util.fromKeycodeToHtml(event.keyCode);
	}

	if(event.keyCode != 16){ // "shift"
		var content = this.cardText.innerHTML;
		if(BROWSER == "firefox"){
			if(content.substring(content.length - 4) == "<br>"){
				this.textHtml = content.substring(0, content.length - 4) + key; // We remove the "<br>" automatically created at the end
			}else{
				this.textHtml = content + key;
			}
		}else if(BROWSER == "chrome" || BROWSER == "opera"){
			if(content.substring(content.length - 6) == "</div>"){
				this.textHtml = content.substring(0, content.length - 6) + key + "</div>"; // We put the last character in the last div created
			}else{
				this.textHtml = content + key;
			}
		}
		this.editBar.style.top = "100%";
	}
}

/**
 * @memberof Card.prototype
 */
Card.prototype.showEditBar = function(frameRate, firstIteration, secondIteration){
	var anim = true;

	var ref = this.showEditBar.bind(this);

	if(typeof(firstIteration) == "undefined"){
		var firstIteration = true;
	}

	if(typeof(secondIteration) == "undefined"){
		var secondIteration = false;
	}

	if(this.editBarAnimated  && !this.editBarVisible && firstIteration){
		clearTimeout(this.anim);
		this.editBarAnimated = false;
		this.anim = 0;
	}else if(this.editBarVisible && firstIteration){
		anim = false;
	}else if(this.editable || this.dragged){
		this.hideEditBar();
		anim = false;
	}else if(!this.editBarAnimated && !this.editBarVisible){
		this.editBarAnimated = true;
		this.editBarVisible = true;
		this.anim = setTimeout(function(){ref(frameRate, false, true)}, 600) // Wait before launch the animation
		anim = false;
	}

	if(anim){
		if(typeof(frameRate) == "undefined"){
			var frameRate = 10;
		}

		var top = 0;

		if(secondIteration && (BROWSER == "chrome" || BROWSER == "opera")){
			top = parseFloat(this.offsetHeight); // Useful for Chrome and Opera
		}else{
			top = parseFloat(util.getStyle(this.editBar, "top")); // in pixels
		}

		var heightEditBar = parseFloat(util.getStyle(this.editBar, "height")); // We find it in pixels
		var heightCard = parseFloat(this.offsetHeight);
		var finalTop = heightCard - heightEditBar;

		if(top - 1 > finalTop){
			this.editBarAnimated = true;
			this.editBarVisible = true;
			this.editBar.style.top = top - 1 + "px";
			this.anim = setTimeout(function(){ref(frameRate, false, false)}, frameRate);
		}else{
			this.editBar.style.top = finalTop + "px";
			this.editBarAnimated = false;
			this.editBarVisible = true;
		}
	}
}

/**
 * @memberof Card.prototype
 */
Card.prototype.hideEditBar = function(frameRate, firstIteration){
	var anim = true;

	if(typeof(firstIteration) == "undefined"){
		var firstIteration = true;
	}

	if(this.editBarAnimated && this.editBarVisible && firstIteration){
		clearTimeout(this.anim);
		this.editBarAnimated = false;
		this.anim = 0;
	}else if(!this.editBarVisible && firstIteration){
		anim = false;
	}

	if(anim){
		if(typeof(frameRate) == "undefined"){
			var frameRate = 10;
		}

		var top = parseFloat(util.getStyle(this.editBar, "top")); // in pixels
		var finalTop = parseFloat(this.offsetHeight);
		var ref = this.hideEditBar.bind(this);

		if(top + 1 < finalTop){
			this.editBarAnimated = true;
			this.editBarVisible = false;
			this.editBar.style.top = top + 1 + "px";
			this.anim = setTimeout(function(){ref(frameRate, false)}, frameRate);
		}else{
			this.editBar.style.top = finalTop + "px";
			this.editBarAnimated = false;
			this.editBarVisible = false;
		}
	}
}

// STATIC ATTRIBUTES AND METHODES

/**
 * @memberof Card
 */
Card.createMask = function(){
	var card = document.getElementsByClassName("card");
	for(var i = 0; i<card.length; i++){
		// The top mask
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
		document.getElementsByClassName("Body")[0].appendChild(topMask);

		// The bottom mask
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
		document.getElementsByClassName("Body")[0].appendChild(botMask);
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
 * @memberof Card
 */
Card.cardList = new Array; // An array containing a reference to all cards
