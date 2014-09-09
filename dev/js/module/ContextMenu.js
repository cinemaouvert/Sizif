/**
 * @file This file manages the context menu event. It allows
 * to create a custom context menu.
 * In use the context menu can be hidden manually using the ContextMenu.hide method.
 * If the target to which you are assigned a context menu is destroyed, you must remove
 * its context menu using the ContextMenu.remove method. It takes the relevant target
 * as argument. 
 * @todo créer une zone de raccourci (d'une manière général créer sur chaque boutons d'avantage de zones.)
 * @todo gérer les cas ou l'utilisateur n'envoi aucun contenu
 * @todo gérer les cas ou l'utilisateur défini plusieurs menu contextuels pour une même cible.
 * @todo permettre une vrai suppression de la mémoire (pour l'instant on ne fait que la mettre en "undefined").
 * @author Yohann Vioujard
 */

(function(){
	/** the memory containing the informations about all the context menus */
	var memory = [];
	
	/** the identifier of the current context menu in the memory */
	var currentId; 

	/**
     * Add a context menu
     * There's a content object by label and as much content object as you want
     * @function ContextMenu
     * @param {object} target - the target of the context menu
     * @param {array} content - A list of string or of functions which returns strings (useful for translation).
	 * @param {array} [actionList] - The list of action in the same order than the label list.
     * @memberof ContextMenu
    */
    ContextMenu = function(target, content, actionList){
		if(typeof(target) != "object"){
			throw "TypeError: the first argument in ContextMenu must be an HTMLElement.";
		}
		
		var id = memory.length;
		
		// THE USER INTERFACE
		/** create the user object */
		var ui = {};
		
		/** allows to remove the context menu */
		ui.remove = function(){ 
			/** remove the context menu */
			remove(target);
			
			/** remove the user interface */
			//ui = undefined;
		};
		
		/** contains the DOM node of his context menu. */
		ui.node = undefined;
		
		/** 
		 * test if the target is a node member of the context menu handle by the UI.
		 * @function
		 */
		ui.member = function(DOMNode){
			if(typeof(ui.node) != "undefined"){
				if(DOMNode == ui.node || util.hasParent(DOMNode, ui.node)){
					return true;
				}
			}
			return false;
		}
		
		/** allows to enable or disable the context menu of the element. */
		ui.enable = true;
		
		/**
		 * Allows to determine the action to do when a button is pressed.
		 * @function
		 * @param {string|function} label - the text on the button which will be pressed. It may be a function which return a string.
		 */
		ui.onPress = function(label, callback){
			memory[id].onPress.push({label: label, action: callback})
		};
		
		memory.push({target: target, content: content, onPress: [], ui: ui});
		
		/** 
		 * If the action list is defined, we add them. 
		 * It doesn't care if the two list haven't the same length. 
		 */
		if(typeof(actionList) != "undefined"){
			for(var i = 0; i < content.length; i++){
				if(typeof(actionList[i]) != "undefined"){
					ui.onPress(content[i], actionList[i]);
				}
			}
		}
		
		return ui;
    }

	/**
	 * Remove a context menu
	 * @function remove
	 * @private
	 * @param {object} target - the target of the context menu
	 * @memberof ContextMenu
	 */
	function remove(target){
		if(typeof(target) == "undefined" || typeof(target) == "string"){
			throw "The first argument in ContextMenu.remove must be an HTMLElement.";
		}
		
		for(var i = 0; i< memory.length; i++){
			if(memory[i].target == target){
				memory[i] = "undefined";
			}
		}
	}
   
    /**
     * Remove the context menu if it's visible.
     * @function ContextMenu.hide
	 * @memberof ContextMenu
     */
	ContextMenu.hide = function(){
		if(ContextMenu.visible){
			ContextMenu.visible = false;
			ContextMenu.target = undefined;
			ContextMenu.node.parentNode.removeChild(ContextMenu.node);
			ContextMenu.node = undefined;
			
			/** remove the node from the user interface. */
			memory[currentId].ui.node = undefined;
		}
	}

    /**
     * Return the html element of the button which contains the given text
     * @function ContextMenu.btn
	 * @param {string} str - The text of the button that the user wants to retrieve. 
     * @return {object} The html element containing the text send in parameter.
	 * @memberof ContextMenu
     */
    ContextMenu.btn = function(str){
		if(ContextMenu.visible){
			var childs = ContextMenu.node.childNodes;
			for(var i = 0; i < childs.length; i++){
				if(childs[i].textContent == str){
					return childs[i];
				}
			}
		}else{
			return false;
		}
    }
	
	/**
	 * Allows to test if the custom context menu is visible.
	 * @member {boolean} ContextMenu.visible
	 */
	ContextMenu.visible = false;
	
	/** the dom node targeted by the context menu module. */
	ContextMenu.target; 
	
	/** contains the dom node of the context menu when it's visible. */
	ContextMenu.node; 

	/** adds the events handler */
	util.addEvent(document, "contextmenu", oncontextmenu);
	util.addEvent(document, "mousedown", onmousedown);
	util.addEvent(document, "mouseup", onmouseup);

	/**
	 * Manage the oncontextmenu event.
	 * Makes appear the context menu.
	 * @function
	 * @private
	 * @event
	 */
	function oncontextmenu(event){
		var target = event.target || event.srcElement;
		ContextMenu.target = target;

		/** prevents the default behaviour */
		event.returnValue = false;
		if(event.preventDefault){
			event.preventDefault();
		}

		var mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
		var mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;

		/** find the appropriate context menu */
		var resp = findContextMenu(ContextMenu.target);
		
		if(resp != -1){
			/** records the identifier of the current context menu */
			currentId = resp;
			
			/** launches the creation of the context menu. */
			create(mouseX, mouseY);
		}
	}

	/**
	 * Manage the onmousedown event for the context menu
	 * @function
	 * @private
	 * @event
	 */
	function onmousedown(event){
		var target = event.target || event.srcElement;

		if(ContextMenu.visible && target != ContextMenu.node && !util.hasParent(target, ContextMenu.node)){
			ContextMenu.hide();
			return;
		}

		/** prevents the context menu's buttons to be selected */
		if(target.className == "ContextMenu-btn"){
			event.returnValue = false;
			if(event.preventDefault){
				event.preventDefault();
			}
		}
	}

	/**
	 * Manage the onmouseup event for the context menu.
	 * When the user click on an item of the context menu.
	 * @function
	 * @private
	 * @event
	 */
	function onmouseup(event){
		if(ContextMenu.visible){
			var target = event.target || event.srcElement;

			if(target.className == "ContextMenu-btn"){
				/** uses the identifier of the current context menu to get the content. */
				var content = memory[currentId].content;
				
				/** treats the pressed label */
				for(var i = 0; i < content.length; i++){
					var label = content[i];
					if(label instanceof Function){
						label = label();
					}
					
					if(target.textContent == label){
						/** 
						 * applies the defined action
						 * then remove the context menu.
						 */
						var onPress = memory[currentId].onPress;
						for(var k = 0; k < onPress.length; k++){
							var onPressLabel = onPress[k].label;
							if(onPressLabel  instanceof Function){
								onPressLabel = onPressLabel();
							}
						
							if(onPressLabel == label){
								onPress[k].action();
							}
						}
						ContextMenu.hide();
						return;
					}
				}
			}
		}
	}

    /**
     * Creates the context menu
     * @function create
	 * @private
     */
	function create(mouseX, mouseY){
		var content = memory[currentId].content;
		
		/** built the context menu */
		ContextMenu.visible = true;

		ContextMenu.node = document.createElement("div");
		ContextMenu.node.className = "ContextMenu";
		ContextMenu.node.style.position = "fixed";
		ContextMenu.node.style.left = mouseX + "px";
		ContextMenu.node.style.top = mouseY + "px";
		document.body.appendChild(ContextMenu.node);

		for(var j = 0; j < content.length; j++){
			var label = content[j];
			if(label instanceof Function){
				label = label();
			}
		
			var newBtn = document.createElement("div");
			newBtn.className = "ContextMenu-btn";
			newBtn.setAttribute("data-translatable", true);
			newBtn.innerHTML = label;
			ContextMenu.node.appendChild(newBtn);
		}
		
		/** puts a reference to the DOM node of the context menu into the user interface. */
		memory[currentId].ui.node = ContextMenu.node;
	}
	
	/** 
	 * Allows to know if a target has an enable context menu or a 
	 * parent with an enable context menu.
	 * Return the identifier in the "memory" attribute of the context menu if it finds it.
	 * If it has found nothing, it returns -1.
	 * @function
	 * @private
	 */
	function findContextMenu(target){
		result = -1;
		
		/** find the target */
		for(var i = 0; i < memory.length; i++){
			if(memory[i].target == target){
				if(memory[i].ui.enable){
					result = i;
				}
				break;
			}
		}

		/** if nothing was found, search the parent */
		if(result == -1 && target != document.body){
			result = findContextMenu(target.parentNode);
		}
		
		return result;
	}
})()
