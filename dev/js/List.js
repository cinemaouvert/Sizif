/**
 * Create a list.
 * @constructor
 * @param {string} [title] - The title of the list.
 * @param {string} [textBtnFooter] - The text displayed in the footer of the list.
 * @returns {object} list - The DOM object representing the list.
 */
function List(title, textBtnFooter){
	List.counter++;

	if(typeof(title) == "undefined"){
		title = TEXT.LIST_defaultTitle;
	}

	if(typeof(textBtnFooter) == "undefined"){
		textBtnFooter = TEXT.LIST_btnAddCard;
	}

	var list = document.createElement("div");
	list.className = "list";

	// HEADER
	var listHeader = document.createElement("div");
	listHeader.className = "list-header";

	// title
	this.labelHead = new Label(title, "h2");
	this.labelHead.style.display = "inline-block";

	// Manage the overflow of the title
	this.labelHead.intag.style.overflow = "hidden";        //
	this.labelHead.intag.style.whiteSpace = "nowrap";      // A g�rer autrement (mettre dans le CSS)
	this.labelHead.intag.style.textOverflow = "ellipsis";  //
	this.labelHead.setAttribute("data-translatable", true);
	this.labelHead.setInputEditable(true);
	listHeader.appendChild(this.labelHead);

	list.appendChild(listHeader);

	// BODY
	this.cardZone = document.createElement("div");
	this.cardZone.className = "list-cardZone";
	list.appendChild(this.cardZone);

	// FOOTER
	this.btnFooter = document.createElement("a");
	this.btnFooter.className = "list-footer";
	this.btnFooter.setAttribute("data-translatable", true);
	this.btnFooter.innerHTML = textBtnFooter;
	list.appendChild(this.btnFooter);

	document.getElementsByClassName("Body")[0].insertBefore(list, BTN_ADDLIST);

	// We fix the height of the list's title
	this.labelHead.style.height = this.labelHead.offsetHeight + "px";

	// Now than the element is embedded in the DOM, we fixe
	// the width Label's input
	this.labelHead.style.width = "99%"; //On enleve 1 par s�curit� rapport aux arrondis
	this.labelHead.inputWidth = "100%";

	this.position = List.counter;
	this.dragged = false;
	this.decalX = 0;
	this.decalY = 0;
	this.clicked = false;
	this.clickDuration = 115;
	this.dropZone = 'undefined';
	this.btnRemove;
	this.btnAddCard;

	// Attributes used to handle cards
	this.cardList = new Array;

	// We set the duration of the click for the label
	this.labelHead.clickDuration = this.clickDuration - 1;

	util.inherit(list, this);

	// References on the functions which handle the animations
	list.REF_EVENT_onmousedown = list.EVENT_onmousedown.bind(list);
	list.REF_EVENT_onmouseup = list.EVENT_onmouseup.bind(list);
	list.REF_EVENT_onmousemove = list.EVENT_onmousemove.bind(list);
	list.REF_EVENT_onmouseover = list.EVENT_onmouseover.bind(list);

	// Events
	util.addEvent(document, "mousedown", list.REF_EVENT_onmousedown);
	util.addEvent(document, "mouseup", list.REF_EVENT_onmouseup);

	//ADD A CONTEXT MENU
	var hasDot = /\.+/gi;
	var btnAddCard = TEXT.LIST_btnAddCard;
	if(hasDot.test(btnAddCard)){
		btnAddCard = btnAddCard.replace(hasDot, "");
	}
	ContextMenu.add(list, [btnAddCard, TEXT.LIST_btnRemove], true)

	return list;
}
/**
 * @memberof List.prototype
 */
List.prototype.setClickDuration = function(milliseconds){
	this.clickDuration = milliseconds;
	this.labelHead.clickDuration = this.clickDuration - 1;
}

/**
 * @memberof List.prototype
 */
List.prototype.destructor = function(){
	this.parentNode.removeChild(this);
	List.counter--;
}

/**
 * @memberof List.prototype
 */
List.prototype.setPosition = function(newPosition){
	this.position = newPosition;
}

/**
 * @memberof List.prototype
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
		editable = true;
	}

	if(typeof(cardOrBool) != "undefined" && typeof(cardOrBool) != "boolean"){
		card = cardOrBool;
	}else{
		card = new Card();
	}

	if(typeof(cardOrBool) != "undefined" && typeof(cardOrBool) != "boolean"){
		var childs = this.cardZone.childNodes;
		for(var i = 0; i < childs.length; i++){
			if(childs[i] == card){
				alreadyInDom = true;
			}
		}
	}

	if(!alreadyInDom){
		this.cardZone.appendChild(card);
		card.setEditable(editable);
	}
	card.setParentList(this);

	var index = this.cardList.length;
	this.cardList[index] = card;

	return card; // POUR DEBUG
}

/**
 * @memberof List.prototype
 */
List.prototype.removeCard = function(card){
	// We remove the card from the array
	for(var element in this.cardList){
		if(this.cardList[element] == card){
			this.cardList.splice(element,1);
		}
	}
}

/**
 * @memberof List.prototype
 */
List.prototype.remove = function(){
	this.parentNode.removeChild(this);
}

/**
 * @memberof List.prototype
 */
List.prototype.EVENT_onmousedown = function(event){
	var target = event.target || event.srcElement;

	if(!this.labelHead.isInputEdited){

		if(!event.which && event.button){ // Firefox, Chrome, etc...
			var button = event.button;
		}else{ // MSIE
			var button = event.which;
		}

		if(button == 1 && util.hasParent(target, this) && (target.className == "list-header" || target.parentNode.className == "list-header" || target.parentNode.parentNode.className == "list-header")){
			var that = this;
			this.clicked = true;

			// On emp�che le comportement par d�faut
			event.returnValue = false;
			if(event.preventDefault){
				event.preventDefault();
			}

			setTimeout(function(){if(that.clicked){that.EVENT_movelist(event)}}, 121);
		}
	}
}

/**
 * @memberof List.prototype
 */
List.prototype.EVENT_movelist = function(event){
	var target = event.target || event.srcElement;

	this.dragged = true;
	this.style.zIndex = 99;

	// We remove the "onmousedown" event
	util.removeEvent(document, "mousedown", this.REF_EVENT_onmousedown);

	// We add the "onmousemove" event
	util.addEvent(document, "mousemove", this.REF_EVENT_onmousemove);

	// Prevent the default behavior
	event.returnValue = false;
	if(event.preventDefault){
		event.preventDefault();
	}

	// On calcul la position de la souris dans l'objet afin de la fixer � l'endroit o� elle le saisie en enregistrant le calcul dans les variable "decal".
	var mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
	var mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;

	// On calcul les el�ments ext�rieurs � l'objet
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

	//On cr�e la zone de collage
	this.dropZone = document.createElement("div");
	this.dropZone.style.height = util.getStyle(this, "height");
	this.dropZone.style.width = util.getStyle(this, "width");
	this.dropZone.style.float = "left";
	this.dropZone.className = "list-dropZone";
	this.dropZone.position = this.position;
	this.dropZone.setPosition = function(newPosition){ that.dropZone.position = newPosition; }
	this.parentNode.insertBefore(this.dropZone, this);

	// On transforme l'objet parent en position absolute
	this.style.left = elementX - 6 + 'px';
	this.style.top = elementY + 'px';
	this.style.position = "absolute";
	this.className = "list-dragged";

	// On cr�e tous les masks
	List.createMask();

	// We add the "onmouseover" event
	util.addEvent(document, "mouseover", this.REF_EVENT_onmouseover);
}

/**
 * @memberof List.prototype
 */
List.prototype.EVENT_onmousemove = function(event){
	if(this.dragged){
		// On r�cup�re la position de la souris
		var x = event.clientX + (document.documentElement.scrollLeft + document.body.scrollLeft);
		var y = event.clientY + (document.documentElement.scrollTop + document.body.scrollTop);

		// On applique les diff�rents d�calages
		x -= this.decalX;
		y -= this.decalY;

		this.style.left = x + 'px';
		this.style.top = y + 'px';
	}
}

/**
 * @memberof List.prototype
 */
List.prototype.EVENT_onmouseup = function(event){
	var target = event.target || event.srcElement;

	//------  -BRICOLAGE-  ------
	var hasDot = /\.+/gi;
	var btnAddCard = TEXT.LIST_btnAddCard;
	if(hasDot.test(btnAddCard)){
		btnAddCard = btnAddCard.replace(hasDot, "");
	}
	//---------------------------

	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}

	if(button == 1 && this.dragged){
		// We remove the "onmousemove" event
		util.removeEvent(document, "mousemove", this.REF_EVENT_onmousemove);

		// We add the "onmousedown" event
		util.addEvent(document, "mousedown", this.REF_EVENT_onmousedown);

		// On remet les attributs � 0
		this.dragged = false;
		this.decalX = 0;
		this.decalY = 0;

		// We remove the "onmouseover" event
		util.removeEvent(document, "mouseover", this.REF_EVENT_onmouseover);

		// On supprime les mask des listes
		List.removeMask()

		// On remet tout en �tat
		this.removeAttribute("style");
		this.className = "list";
		document.getElementsByClassName("Body")[0].replaceChild(this, this.dropZone);
		this.dropZone = 'undefined';
	}

	if(button == 1){
		this.clicked = false;
	}

	if(button == 1 && (target == this.btnFooter || (target == ContextMenu.btn(btnAddCard) && (ContextMenu.target == this || util.hasParent(ContextMenu.target, this))))){
		var card = this.addCard();
		card.cardText.focus();
		ContextMenu.remove();
	}

	if(target == ContextMenu.btn(TEXT.LIST_btnRemove) && (ContextMenu.target == this || util.hasParent(ContextMenu.target, this))){
		this.remove();
		ContextMenu.remove();
	}
}

/**
 * Over the other lists
 * @memberof List.prototype
 */
List.prototype.EVENT_onmouseover = function(event){
	var maskTarget = event.target || event.srcElement;

	if(maskTarget.className == "list-mask"){

		// On enregistre la position de la liste qu'on a survol�e
		var targetPos = maskTarget.hiddenList.position;

		// Calcul de l'�cart entre les listes.
		var ecart = targetPos - this.position;

		/*
			On insert la list dragg�e apr�s la liste survol�e
			si la position de la liste survol�e est sup�rieure
			� celle dragg�.
		*/
		if(ecart > 0){
			maskTarget.parentNode.insertBefore(this.dropZone, maskTarget.hiddenList.nextSibling);

			// On diminue de 1 la position de toutes les listes positionn�es avant si �a n'a pas �tait un �change entre deux listes qui �taient c�te � c�te.
			if(targetPos != this.position + 1){
				var allMask = document.getElementsByClassName("list-mask"); //On r�cup�re tous les mask.
				for(var i = 0; i < allMask.length; i++){
					var listPosition = allMask[i].hiddenList.position;
					if(listPosition <= targetPos){
						allMask[i].hiddenList.setPosition(listPosition - 1);
					}
				}
			}else{ //Sinon on change la position de la cible et le style de son mask.
				maskTarget.hiddenList.setPosition(this.position);
			}
		}

		/*
			On insert la list dragg�e avant la liste survol�e
			si la position de la liste survol�e est inf�rieure
			� celle dragg�.
		*/
		if(ecart < 0){
			maskTarget.parentNode.insertBefore(this.dropZone, maskTarget.hiddenList);

			// On red�fini les positions de toutes les listes si �a n'a pas �tait un �change entre deux listes qui �taient c�te � c�te.
			if(targetPos != this.position - 1){
				var allMask = document.getElementsByClassName("list-mask"); //On r�cup�re tous les mask.
				for(var i = 0; i < allMask.length; i++){
					var listPosition = allMask[i].hiddenList.position;
					if(listPosition >= targetPos && listPosition != List.counter){
						allMask[i].hiddenList.setPosition(listPosition + 1);
					}
				}
			}else{ //Sinon on change la position de la cible et le style de son mask.
				maskTarget.hiddenList.setPosition(this.position);

			}
		}

		// On change la position de la liste dragg�
		this.setPosition(targetPos);

		// We set the style of the mask
		maskTarget.style.left = maskTarget.hiddenList.offsetLeft + "px";
		maskTarget.style.top = maskTarget.hiddenList.offsetTop + "px";
	}
}

/**
 * @memberof List.prototype
 */
List.prototype.cardNumber = function(){
	var count = 0;

	var childs = this.cardZone.childNodes;
	for(var i = 0; i<childs.length; i++){
		if(childs[i].className != "card-dropZone"){
			count++;
		}
	}
	return count;
}

/******************************************
		STATICS ATTRIBUTES AND METHODES
******************************************/

/**
 * @memberof List
 */
List.createMask = function(emptyListOrList){
	var emptyList = false;

	if(typeof(emptyListOrList) == "boolean"){
		emptyList = emptyListOrList;
	}else if(typeof(emptyListOrList) == "object"){
		var givenList = emptyListOrList;
	}

	var list = document.getElementsByClassName("list");
	for(var i = 0; i<list.length; i++){
		var create = true;

		// We look for the empty lists
		if(emptyList){
			var childs = list[i].childNodes;
			for(var j = 0; j<childs.length; j++){
				if(childs[j].className == "list-cardZone"){
					var childNumber = childs[j].childNodes.length;
					if(childNumber != 0){
						create = false;
					}
				}
			}
		}

		// We check if it's the given list
		if(typeof(givenList) != "undefined"){
			if(list[i] != givenList){
				create = false;
			}
		}

		// We check if there is not already a mask
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

			mask.style.zIndex = 100; //A EFFACER
			document.getElementsByClassName("Body")[0].appendChild(mask);
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
 * @memberof List
 */
List.counter = 0; // Instance counter

/**
 * @memberof List
 */
List.showMask = false;