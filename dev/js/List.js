/** @file This file contains the List class. */

/**
 * Provides lists.
 * @constructor
 * @param {string} [title] - The list title.
 * @param {string} [textBtnFooter] - The text displayed in the list footer.
 * @returns {object} list - The DOM object representing the list.
 */
function List(title, textBtnFooter){
	List.counter++;

	/** @default */
	if(typeof(title) == "undefined"){
		title = app.TEXT["New list"];
	}

	/** @default */
	if(typeof(textBtnFooter) == "undefined"){
		textBtnFooter = app.TEXT["Add a card"] + "...";
	}

	var list = document.createElement("div");
	list.className = "list";

	/** header */
	var listHeader = document.createElement("div");
	listHeader.className = "list-header";

	/** 
	 * @member {object} List#listTitle 
	 */
	this.listTitle = new ListTitle(title, "h2");
	this.listTitle.style.display = "inline-block";

	/** manages the overflow of the title */
	this.listTitle.intag.style.overflow = "hidden";        //
	this.listTitle.intag.style.whiteSpace = "nowrap";      // A gérer autrement (mettre dans le CSS)
	this.listTitle.intag.style.textOverflow = "ellipsis";  //
	this.listTitle.setAttribute("data-translatable", true);
	this.listTitle.setInputEditable(true);
	listHeader.appendChild(this.listTitle);

	list.appendChild(listHeader);

	/** 
	 * The list body which contains cards.
	 * @member {object} List#cardArea 
	 * @instance
	 */
	this.cardArea = document.createElement("div");
	this.cardArea.className = "list-cardArea";
	list.appendChild(this.cardArea);

	/** 
	 * The "add list" button in the list footer.
	 * @member {object} List#btnFooter
	 */
	this.btnFooter = document.createElement("a");
	this.btnFooter.className = "list-footer";
	this.btnFooter.setAttribute("data-translatable", true);
	this.btnFooter.innerHTML = textBtnFooter;
	list.appendChild(this.btnFooter);

	document.getElementsByClassName("body")[0].insertBefore(list, app.BTN_ADDLIST);

	/** fix the height of the list's title */
	this.listTitle.style.height = this.listTitle.offsetHeight + "px";

	/** now that the element is embedded in the DOM, we fix the width Label's input */
	this.listTitle.style.width = "99%"; // subtracts 1 by security, due to rounding
	this.listTitle.inputWidth = "100%";

	/** 
	 * The position number of the current list according to the others.
	 * @member {number} List#position
	 */
	this.position = List.counter;
	
	/** 
	 * It allows to now if the list is dragged by the user.
	 * @member {boolean} List#dragged
	 */
	this.dragged = false;
	
	/** 
	 * It stores the horizontal offset of the list.
	 * @member {number} List#offsetX
	 */
	this.offsetX = 0;
	
	/** 
	 * It stores the vertical offset of the list.
	 * @member {number} List#offsetX
	 */
	this.offsetY = 0;
	
	/** 
	 * It allows to know if the list is clicked by the user.
	 * @member {boolean} List#clicked
	 */
	this.clicked = false;
	
	/** 
	 * It stores the node which represents the drop area of the list.
	 * @member {object} List#dropArea
	 */
	this.dropArea = 'undefined';

	/** 
	 * It is used to handle cards.
	 * @member {object} List#cardList
	 */
	this.cardList = new Array;

	util.inherit(list, this);

	/** references on functions which handle animations. */
	list.REF_EVENT_onmousedown = list.EVENT_onmousedown.bind(list);
	list.REF_EVENT_onmouseup = list.EVENT_onmouseup.bind(list);
	list.REF_EVENT_onmousemove = list.EVENT_onmousemove.bind(list);
	list.REF_EVENT_onmouseover = list.EVENT_onmouseover.bind(list);

	/** add events */
	util.addEvent(document, "mousedown", list.REF_EVENT_onmousedown);
	util.addEvent(document, "mouseup", list.REF_EVENT_onmouseup);

	/** add the context menu */
	list.cMenu = ContextMenu(list, [
			function(){ return app.TEXT["Add a card"] },
			function(){ return app.TEXT["Remove the list"] }
		],[
			list.addCard.bind(list),
			list.remove.bind(list)
		]
	)
	
	return list;
}

/**
 * @memberof List#
 */
List.prototype.setPosition = function(newPosition){
	this.position = newPosition;
}

/**
 * @memberof List#
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
		/** @default */
		editable = true;
	}

	if(typeof(cardOrBool) != "undefined" && typeof(cardOrBool) != "boolean"){
		card = cardOrBool;
		
		var childs = this.cardArea.childNodes;
		for(var i = 0; i < childs.length; i++){
			if(childs[i] == card){
				alreadyInDom = true;
			}
		}
	}else{
		card = new Card(this);
	}
	
	if(!alreadyInDom){
		this.cardArea.appendChild(card);
		card.setEditable(editable);
	}

	var index = this.cardList.length;
	this.cardList[index] = card;
	card.editionArea.focus(); // A VIRER
}

/**
 * @memberof List#
 */
List.prototype.removeCard = function(card){
	/** remove the card from the array */
	for(var element in this.cardList){
		if(this.cardList[element] == card){
			this.cardList.splice(element,1);
		}
	}
}

/**
 * @memberof List#
 */
List.prototype.remove = function(){
	/** removes the HTMLElement */
	this.parentNode.removeChild(this);
	
	/** removes the context menu */
	this.cMenu.remove();
	
	/** decrements the counter */
	List.counter--;
}

/**
 * @memberof List#
 * @event
 */
List.prototype.EVENT_onmousedown = function(event){
	var target = util.getTarget(event);

	if(!this.listTitle.isInputEdited){
		var button = util.getMouseButton(event);

		if(button == 1 && util.hasParent(target, this) && (target.className == "list-header" || target.parentNode.className == "list-header" || target.parentNode.parentNode.className == "list-header")){
			var that = this;
			this.clicked = true;

			/** prevents the default behaviour */
			event.returnValue = false;
			if(event.preventDefault){
				event.preventDefault();
			}

			this.dragged = true;
			this.style.zIndex = 99;

			/** removes the "onmousedown" event */
			util.removeEvent(document, "mousedown", this.REF_EVENT_onmousedown);

			/** adds the "onmousemove" event */
			util.addEvent(document, "mousemove", this.REF_EVENT_onmousemove);

			/** calculates the mouse position in the object in order to set the object where the mouse catch it, recording the result in the "offset" variables. */ 
			var mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
			var mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;

			/** calculates the offsets */
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
			this.dropArea.style.float = "left";
			this.dropArea.className = "list-dropArea";
			this.dropArea.position = this.position;
			this.dropArea.setPosition = function(newPosition){ that.dropArea.position = newPosition; }
			this.parentNode.insertBefore(this.dropArea, this);
			
			/** turns the list in absolute position */
			this.style.left = elementX - parseFloat(util.getStyle(this, "margin-left")) + 'px';
			this.style.top = elementY - parseFloat(util.getStyle(this, "margin-top")) + 'px';
			this.style.width = this.offsetWidth + "px";
			this.style.position = "absolute";
			this.className = "list-dragged";
			
			/** creates the masks */
			List.createMask();

			/** adds the "onmouseover" event */
			util.addEvent(document, "mouseover", this.REF_EVENT_onmouseover);
		}
	}
}

/**
 * @memberof List#
 * @event
 */
List.prototype.EVENT_onmousemove = function(event){
	if(this.dragged){
		/** gets the mouse position */
		var x = event.clientX + (document.documentElement.scrollLeft + document.body.scrollLeft);
		var y = event.clientY + (document.documentElement.scrollTop + document.body.scrollTop);

		/** applies the different offsets */
		x -= this.offsetX;
		y -= this.offsetY;

		this.style.left = x + 'px';
		this.style.top = y + 'px';
	}
}

/**
 * @memberof List#
 * @event
 */
List.prototype.EVENT_onmouseup = function(event){
	var target = util.getTarget(event);
	var button = util.getMouseButton(event);

	if(button == 1){
		this.clicked = false;
		
		/** handles the list */
		if(this.dragged){
			/** removes the "onmousemove" event */
			util.removeEvent(document, "mousemove", this.REF_EVENT_onmousemove);

			/** adds the "onmousedown" event */
			util.addEvent(document, "mousedown", this.REF_EVENT_onmousedown);

			/** puts back the attributes to 0 */
			this.dragged = false;
			this.offsetX = 0;
			this.offsetY = 0;

			/** removes the "onmouseover" event */
			util.removeEvent(document, "mouseover", this.REF_EVENT_onmouseover);

			/** remove the lists masks */
			List.removeMask()

			/** puts back in place */
			this.removeAttribute("style");
			this.className = "list";
			document.getElementsByClassName("body")[0].replaceChild(this, this.dropArea);
			this.dropArea = 'undefined';
		}else if(target == this.btnFooter){
			/** the button in the list footer is clicked */
			this.addCard();
		}
	}
}

/**
 * Handles when the other lists are overflew.
 * @memberof List#
 * @event
 */
List.prototype.EVENT_onmouseover = function(event){
	var maskTarget = util.getTarget(event);

	if(maskTarget.className == "list-mask"){

		/** the overflew position is recorded */
		var targetPos = maskTarget.hiddenList.position;

		/** calculates the difference between lists */
		var difference = targetPos - this.position;

		/** 
		 * inserts the dragged list after the overflew list 
		 * if the position of the overflew list is greater than the dragged one 
		 */
		if(difference > 0){
			maskTarget.parentNode.insertBefore(this.dropArea, maskTarget.hiddenList.nextSibling);
			
			/**
			 * decreases of 1 the position of all lists which are before the current one
			 * if it wasn't an exchange between two lists which were side by side.
			 */
			if(targetPos != this.position + 1){
				var allMask = document.getElementsByClassName("list-mask"); // gets all masks
				for(var i = 0; i < allMask.length; i++){
					var listPosition = allMask[i].hiddenList.position;
					if(listPosition <= targetPos){
						allMask[i].hiddenList.setPosition(listPosition - 1);
					}
				}
			}else{
				/** else we change the position number of the target and its mask style. */
				maskTarget.hiddenList.setPosition(this.position);
			}
		}
		
		/** 
		 * inserts the dragged list after the overflew list 
		 * if the position of the overflew list is smaller than the dragged one 
		 */
		if(difference < 0){
			maskTarget.parentNode.insertBefore(this.dropArea, maskTarget.hiddenList);

			/**
			 * defines again the positions of all lists
			 * if it wasn't an exchange between two lists which were side by side.
			 */
			if(targetPos != this.position - 1){
				var allMask = document.getElementsByClassName("list-mask"); // get all the masks
				for(var i = 0; i < allMask.length; i++){
					var listPosition = allMask[i].hiddenList.position;
					if(listPosition >= targetPos && listPosition != List.counter){
						allMask[i].hiddenList.setPosition(listPosition + 1);
					}
				}
			}else{
				/** else we change the position number of the target and its mask style. */
				maskTarget.hiddenList.setPosition(this.position);
			}
		}

		/** changes the position number of the dragged list */
		this.setPosition(targetPos);

		/** sets the mask style */
		maskTarget.style.left = maskTarget.hiddenList.offsetLeft + "px";
		maskTarget.style.top = maskTarget.hiddenList.offsetTop + "px";
	}
}

/**
 * @memberof List#
 */
List.prototype.cardNumber = function(){
	var count = 0;

	var childs = this.cardArea.childNodes;
	for(var i = 0; i<childs.length; i++){
		if(childs[i].className != "card-dropArea"){
			count++;
		}
	}
	return count;
}

/*****************************************\
		STATICS ATTRIBUTES AND METHODS
\*****************************************/

/**
 * @memberof List
 */
List.createMask = function(emptyListOrList){
	/** @default */
	var emptyList = false;

	if(typeof(emptyListOrList) == "boolean"){
		emptyList = emptyListOrList;
	}else if(typeof(emptyListOrList) == "object"){
		var givenList = emptyListOrList;
	}

	var list = document.getElementsByClassName("list");
	for(var i = 0; i<list.length; i++){
		var create = true;

		/** looks for the empty lists */
		if(emptyList){
			var childs = list[i].childNodes;
			for(var j = 0; j<childs.length; j++){
				if(childs[j].className == "list-cardArea"){
					var childNumber = childs[j].childNodes.length;
					if(childNumber != 0){
						create = false;
					}
				}
			}
		}

		/** checks if it's the given list */
		if(typeof(givenList) != "undefined"){
			if(list[i] != givenList){
				create = false;
			}
		}

		/** checks if there is not already a mask */
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

			mask.style.zIndex = 100;
			document.getElementsByClassName("body")[0].appendChild(mask);
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
 * Instance counter
 * @memberof List
 */
List.counter = 0;

/**
 * Allows to show the created masks during execution.
 * @memberof List
 */
List.showMask = false;
