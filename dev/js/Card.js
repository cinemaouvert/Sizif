/** @file This file contains the Card class. */

(function(){

	/** private attributes */
	var _private = new Private;

	/**
	 * Provides cards
	 * @constructor
	 * @param {object} parentList - The list which contains the card.
	 * @param {string} [text] - The card's text.
	 * @returns {object} card - The DOM object representing the card.
	 */
	Card = function(parentList, text){
		if(typeof(parentList) == "undefined"){
			throw "The card must have a parent list to be create.";
		}

		/** defines as draggable all the other cards */
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
		this.textHTML = "";

		/** creates the card in the DOM */
		var card = document.createElement("div");
		card.className = "card";

		/** the edition area */
		this.editionArea = new RichTextArea("div");
		this.editionArea.className = "card-text";
		this.editionArea.setAttribute("data-translatable", true);
		card.appendChild(this.editionArea);

		/** the edit bar */
		this.editBar = new EditBar();
		card.appendChild(this.editBar);

		if(typeof(text) != "undefined"){
			this.setText(text);
		}else{
			this.setText(app.TEXT["New card"]);
		}
		
		this.offsetX = 0;
		this.offsetY = 0;
		this.dropArea;
		this.dragged = false;
		this.draggable = false;
		this.editable = false;

		/** the card inherit from the current object */
		util.inherit(card, this);

		/** create the links between the card and several functionalities */
		connection(card);
		
		/** return the created card */
		return card;
	}

	/**
	 * @memberof Card#
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
	 * @memberof Card#
	 */
	Card.prototype.setEditable = function(bool){
		/** set editable */
		if(bool && !this.editable){
			var list_onPressEdition = _private.get("list_onPressEdition", this);
			for(var i = 0; i < list_onPressEdition.length; i++){
				list_onPressEdition[i]();
			}
		
			this.editable = true;
			this.setDraggable(false);
			this.editBar.mode("edition");
			this.editBar.locked = true;
			
			this.editionArea.contentEditable = true;
			this.editionArea.style.cursor = "text";
			this.editionArea.focus();
			
			/** enable the context menu */
			this.editionArea.cMenu.enable = true;

			/** allows to put the Caret at the end of the text */
			if (document.getSelection) {    // all browsers, except IE before version 9
				var sel = document.getSelection ();
				// sel is a string in Firefox and Opera,
				// and a selectionRange object in Google Chrome, Safari and IE from version 9
			}else{
				if(document.selection) {   // Internet Explorer before version 9
					var textRange = document.selection.createRange ();
				}
			}
			//sel.collapse(this.editionArea.firstChild, this.editionArea.textContent.length);
			
			/** adds the "onkeydown" event */
			util.addEvent(document, "keydown", this.REF_EVENT_onkeydown);
			
		/** set draggable */
		}else if(!bool && this.editable){
			var isEmpty = /^\s*$/gi;
			if(isEmpty.test(this.getText())){
				this.editionArea.blur();
				this.remove();
			}else{
				this.editable = false;
				
				this.setDraggable(true);
				this.editBar.locked = false;
				if(this.editBar.visible){
					var that = this;
					this.editBar.hide(1, function(){
						that.editBar.mode("standard");
					});
				}else{
					this.editBar.mode("standard");
				}
				
				this.editionArea.blur();
				this.editionArea.contentEditable = false;
				this.editionArea.style.cursor = "default";
				
				/** disable the context menu */
				this.editionArea.cMenu.enable = false;
				
				/** removes the "onkeydown" event */
				util.removeEvent(document, "keydown", this.REF_EVENT_onkeydown);
			}
		}
	}

	/**
	 * @memberof Card#
	 */
	Card.prototype.remove = function(){
		var list_onRemoval = _private.get("list_onRemoval", this);
		for(var i = 0; i < list_onRemoval.length; i++){
			list_onRemoval[i]();
		}
	
		/** removes the card from the static list */
		if(Card.cardList.length > 0){
			for(var element in Card.cardList){
				if(Card.cardList[element] == this){
					delete Card.cardList[element];
				}
			}
		}

		/** removes the context menu */
		this.cMenu.remove();
		
		/** removes the "onmousedown" event */
		util.removeEvent(document, "mousedown", this.REF_EVENT_onmousedown);

		/** removes the current card */
		this.parentNode.removeChild(this);
	}

	/**
	 * @memberof Card#
	 */
	Card.prototype.setText = function(newText){
		this.text = newText;
		this.textHTML = newText;
		this.editionArea.text = newText;
		this.editionArea.innerHTML = newText;
	}

	/**
	 * Allows to get the text.
	 * @memberof Card#
	 */
	Card.prototype.getText = function(){
		return this.editionArea.textContent;
	}

	/**
	 * Allows to determine actions when the close button is pressed
	 * @memberof Card#
	 */
	Card.prototype.onRemoval = function(callback){
		var list_onRemoval = _private.get("list_onRemoval", this);
		list_onRemoval.push(callback);
	}
	
	/**
	 * Allows to determine actions when the edit button is pressed
	 * @memberof Card#
	 */
	Card.prototype.onPressEdition = function(callback){
		var list_onPressEdition = _private.get("list_onRemoval", this);
		list_onPressEdition.push(callback);
	}

	/**
	 * @memberof Card#
	 * @event
	 */
	Card.prototype.EVENT_onmousedown = function(event){
		var target = util.getTarget(event);
		var button = util.getMouseButton(event);

		if(button == 1 && target != this.editBar && !util.hasParent(target, this.editBar)){
			/** makes the card draggable */
			if(this.editable && target != this.editionArea && !this.editionArea.cMenu.isChildNode(target)){
				this.setDraggable(true);
			}
			
			/** drag */
			if(this.draggable && (target == this || util.hasParent(target, this))){
				/** prevents the default behaviour */
				event.returnValue = false;
				if(event.preventDefault){
					event.preventDefault();
				}

				this.dragged = true;
				this.style.zIndex = 99;
				this.editBar.hide(2);
				this.editBar.locked = true;

				/** calculates the mouse position in the object in order to set the object where the mouse catch it, recording the result in the "offset" variables. */ 
				var mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
				var mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;

				/** calculates the offsets of the object */
				var elementX = 0;
				var elementY = 0;
				var element = this;
				do{
					elementX += element.offsetLeft;
					elementY += element.offsetTop;
					element = element.offsetParent;
				}while(element && util.getStyle(element, 'position') != 'absolute'  && util.getStyle(element, 'position') != 'fixed');

				this.offsetX += mouseX - elementX;
				this.offsetY += mouseY - elementY;

				/** creates the drop area */
				this.dropArea = document.createElement("div");
				this.dropArea.style.height = util.getStyle(this, "height");
				this.dropArea.style.width = util.getStyle(this, "width");
				this.dropArea.className = "card-dropArea";
				this.parentNode.insertBefore(this.dropArea, this);

				/** turn the parent object in absolute position */
				this.style.width = util.getStyle(this, "width");
				var marginHeight = (this.offsetHeight - parseFloat(util.getStyle(this, "height")))/2
				this.style.left = elementX + 'px';
				this.style.top = elementY - marginHeight - 1 + 'px';
				this.style.position = "absolute";
				this.style.width = util.getStyle(this, "width");
				this.className = "card-caught";

				/** removes the card from the parentList */
				this.parentList.removeCard(this); 

				/** creates the masks Cards */
				Card.createMask(); 
				
				/** creates the masks for the empty lists */
				List.createMask(true); 
				if(this.parentList.cardNumber() == 1){
					/** creates a mask for the parentList if the current card is alone in it. */
					List.createMask(this.parentList); 
				}

				/** removes the "onmousedown" event */
				util.removeEvent(document, "mousedown", this.REF_EVENT_onmousedown);
			}
		}
	}

	/**
	 * @memberof Card#
	 * @event
	 */
	Card.prototype.EVENT_onmousemove = function(event){
		var target = util.getTarget(event);
		if(this.dragged){
			/** gets the mouse coordinates */
			var x = event.clientX + (document.documentElement.scrollLeft + document.body.scrollLeft);
			var y = event.clientY + (document.documentElement.scrollTop + document.body.scrollTop);

			/** applies the different offsets */
			x -= this.offsetX;
			y -= this.offsetY;

			this.className = "card-dragged";
			this.style.left = x + 'px';
			this.style.top = y + 'px';
		}
	}

	/**
	 * @memberof Card#
	 * @event
	 */
	Card.prototype.EVENT_onmouseup = function(event){
		var target = util.getTarget(event);
		var button = util.getMouseButton(event);

		if(button == 1){
			if(this.dragged){
				/** prevent the default behaviour */
				util.preventDefault(event);

				/** puts back the attributes to 0 */
				this.dragged = false;
				this.offsetX = 0;
				this.offsetY = 0;
				this.editBar.locked = false;

				/** remove the masks */
				Card.removeMask()
				List.removeMask()

				/** puts back in place */
				this.removeAttribute("style");
				this.className = "card";
				this.dropArea.parentNode.replaceChild(this, this.dropArea);

				/** handle the parentList property */
				this.parentList.removeCard(this); // removes the card from the parentList
				this.parentList = this.parentNode.parentNode; // changes the "parentList" attribute
				this.parentList.addCard(this); // adds the card to the new parent list

				this.dropArea = 'undefined';	// erases the "dropArea" attribute

				/** adds the "onmousedown" event */
				util.addEvent(document, "mousedown", this.REF_EVENT_onmousedown);
			}
		}
	}

	/**
	 * Flies over the other cards or lists. 
	 * @memberof Card#
	 * @event
	 */
	Card.prototype.EVENT_onmouseover = function(event){
		var target = util.getTarget(event);

		if(this.dragged && target.className == "card-mask"){
			var parentNode = target.hiddenCard.parentNode;

			/** creates the empty lists's mask */
			List.createMask(true); 

			/** inserts the dragged card before the overflew card */
			if(target.getAttribute("data-position") == "top"){
				parentNode.insertBefore(this.dropArea, target.hiddenCard);
			}

			/** inserts the dragged card after the overflew card */
			if(target.getAttribute("data-position") == "bottom"){
				parentNode.insertBefore(this.dropArea, target.hiddenCard.nextSibling);
			}

			List.resizeMask();

			/** sets the style of the mask */
			Card.replaceMask();
		}

		/** overs an empty list */
		if(this.dragged && target.className == "list-mask"){
			target.hiddenList.cardArea.appendChild(this.dropArea);
			List.resizeMask();
			Card.replaceMask();
		}

		if(target == this || util.hasParent(target, this)){
			this.editBar.show();
		}else{
			this.editBar.hide();
		}
	}

	/**
	 * @memberof Card#
	 * @event
	 */
	Card.prototype.EVENT_onkeydown = function(event){
		var target = util.getTarget(event);
		var key;

		if(app.BROWSER == "firefox"){
			key = event.key;
			if(key == "Backspace" || key == "Del"){
				key = '';
			}
		}else{
			key = util.fromKeycodeToHtml(event.keyCode);
		}
		
		if(event.keyCode != 16){ // "shift"
			var heightEditBar = util.getStyle(this.editBar, "height");
			this.editBar.style.top = "calc(100% - " + heightEditBar + ")";
		}
	}

	/*****************************************\
			STATICS ATTRIBUTES AND METHODS
	\*****************************************/

	/**
	 * @memberof Card
	 */
	Card.createMask = function(){
		var card = document.getElementsByClassName("card");
		for(var i = 0; i<card.length; i++){
			/** the top mask */
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
			document.getElementsByClassName("body")[0].appendChild(topMask);

			/** the bottom mask */
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
			document.getElementsByClassName("body")[0].appendChild(botMask);
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
	 * An array containing a reference to each card
	 * @memberof Card
	 */
	Card.cardList = new Array;

	/*****************************************\
			PRIVATE METHODS
	\*****************************************/
	
	/**
	 * Connect a card with several functionalities
	 * Used by the constructor.
	 * @function
	 * @private
	 */
	function connection(card){
		/** creates privates variables */
		_private.set("list_onRemoval", [], card);
		_private.set("list_onPressEdition", [], card);
	
		/** references on functions which handle animations. */
		card.REF_EVENT_onmousedown = card.EVENT_onmousedown.bind(card);
		card.REF_EVENT_onmousemove = card.EVENT_onmousemove.bind(card);
		card.REF_EVENT_onmouseup = card.EVENT_onmouseup.bind(card);
		card.REF_EVENT_onmouseover = card.EVENT_onmouseover.bind(card);
		card.REF_EVENT_onkeydown = card.EVENT_onkeydown.bind(card);

		/** events */
		util.addEvent(document, "mousedown", card.REF_EVENT_onmousedown);
		util.addEvent(document, "mouseover", card.REF_EVENT_onmouseover);
		util.addEvent(document, "mouseup", card.REF_EVENT_onmouseup);
		util.addEvent(document, "mousemove", card.REF_EVENT_onmousemove);
		
		/** creates the context menu of the card*/
		card.cMenu = ContextMenu(card, [
				function(){ return app.TEXT["Add a card"]}, 
				function(){ return app.TEXT["Remove the card"]},
				function(){ return app.TEXT["Remove the list"]}
			],[ /** adds actions */
				function(){card.parentList.addCard()},
				function(){card.remove()},
				function(){card.parentList.remove()}
			]
		)
		
		/** creates the context menu of the edition area */
		card.editionArea.cMenu = ContextMenu(card.editionArea, 
			[ /** the labels of the context menu */
				function(){ return app.TEXT["Undo"]},
				function(){ return app.TEXT["Redo"]},
				function(){ return app.TEXT["Cut"]},
				function(){ return app.TEXT["Copy"]},
				function(){ return app.TEXT["Paste"]},
				function(){ return app.TEXT["Left align"]},
				function(){ return app.TEXT["Center align"]},
				function(){ return app.TEXT["Right align"]},
				function(){ return app.TEXT["Bold"]},
				function(){ return app.TEXT["Italic"]},
				function(){ return app.TEXT["Underline"]}
			],
			[ /** the actions of the context menu */
				card.editionArea.undo.bind(card.editionArea),
				card.editionArea.redo.bind(card.editionArea),
				card.editionArea.cut.bind(card.editionArea),
				card.editionArea.copy.bind(card.editionArea),
				card.editionArea.paste.bind(card.editionArea),
				card.editionArea.leftAlign.bind(card.editionArea),
				card.editionArea.centerAlign.bind(card.editionArea),
				card.editionArea.rightAlign.bind(card.editionArea),
				card.editionArea.bold.bind(card.editionArea),
				card.editionArea.italic.bind(card.editionArea),
				card.editionArea.underline.bind(card.editionArea)
			]
		)
		
		/** disable the context menu */
		card.editionArea.cMenu.enable = false;
		
		/** connection to the edit bar buttons */
		card.editBar.onPressButton("edition", function(){
			card.setEditable(true);
		});
		card.editBar.onPressButton("remove", function(){
			card.remove();
		});
		card.editBar.onPressButton("bold", function(){
			card.editionArea.bold();
		});
		card.editBar.onPressButton("italic", function(){
			card.editionArea.italic();
		});
		card.editBar.onPressButton("underline", function(){
			card.editionArea.underline();
		});
		
		/** set the card as editable */
		card.setEditable(true);
	}
})();
