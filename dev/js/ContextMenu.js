/**
 * @file This file manages the context menu event.
 * In use the context menu can be hidden manually using the ContextMenu.hide method.
 * If the target to which you are assigned a context menu is destroyed, you must remove
 * its context menu using the ContextMenu.remove method. It takes the relevant target
 * as argument. 
 * @todo créer une zone de raccourci
 * @author Yohann Vioujard
 */

(function(){
	ContextMenu = {};
	ContextMenu.visible = false;
	ContextMenu.target; // The html element targeted by the context menu.
	var setting = [];

	util.addEvent(document, "contextmenu", oncontextmenu);
	util.addEvent(document, "mousedown", onmousedown);
	util.addEvent(document, "mouseup", onmouseup);

	function oncontextmenu(event){
		var target = event.target || event.srcElement;

		if(target["className"] == "list" || util.hasParent(target, "className", "list")){
			ContextMenu.target = target;

			// On empeche le comportement par d�faut
			event.returnValue = false;
			if(event.preventDefault){
				event.preventDefault();
			}

			var mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
			var mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;

			create(mouseX, mouseY);
		}
	}

	/**
	 * Manage the onmousedown event for the context menu
	 * @event
	 */
	function onmousedown(event){
		var target = event.target || event.srcElement;

		if(ContextMenu.visible && target != ContextMenu.dom && !util.hasParent(target, ContextMenu.dom)){
			ContextMenu.hide();
			return;
		}

		// We prevent the context menu's buttons to be selected
		if(target.className == "ContextMenu-btn"){
			event.returnValue = false;
			if(event.preventDefault){
				event.preventDefault();
			}
		}
	}

	/**
	 * Manage the onmouseup event for the context menu
	 * @event
	 */
	function onmouseup(event){
		if(ContextMenu.visible){
			var target = event.target || event.srcElement;

			if(target.className == "ContextMenu-btn"){
				for(var i = 0; i < setting.length; i++){
					if(ContextMenu.target == setting[i].target || util.hasParent(ContextMenu.target, setting[i].target)){
						
						var content = setting[i].content;
						for(var j = 0; j < content.length; j++){
							var label = content[j].label;
							if(label instanceof Function){
								label = label();
							}
							
							if(target.textContent == label){
								/** 
								 * Apply the defined action
								 * then remove the context menu.
								 */
								content[j].action();
								ContextMenu.hide();
								return;
							}
						}
					}
				}
			}
		}
	}

    /**
     * create the context menu
     * @function create
	 * @private
     */
	function create(mouseX, mouseY){
		for(var i = 0; i < setting.length; i++){
			var uCanCreate = true;

			if(util.hasParent(ContextMenu.target, setting[i].target)){
				// Check if the parent isn't defined too, manage conflicts
				for(var k = 0; k < setting.length; k++){
					if(setting[k].target == ContextMenu.target){
						uCanCreate = false;
					}else if(setting[k].target != setting[i].target
						&& util.hasParent(setting[k].target, setting[i].target)
						&& (util.hasParent(ContextMenu.target, setting[k].target)
						|| setting[k].target == ContextMenu.target)){
						uCanCreate = false;
					}
				}
			}else if(ContextMenu.target != setting[i].target){
				uCanCreate = false;
			}
			if(uCanCreate){
				/** built the context menu */
				ContextMenu.visible = true;

				ContextMenu.dom = document.createElement("div");
				ContextMenu.dom.className = "ContextMenu";
				ContextMenu.dom.style.position = "fixed";
				ContextMenu.dom.style.left = mouseX + "px";
				ContextMenu.dom.style.top = mouseY + "px";
				document.body.appendChild(ContextMenu.dom);

				var content = setting[i].content
				for(var j = 0; j < content.length; j++){
					var label = content[j].label;
					if(label instanceof Function){
						label = label();
					}
				
					var newBtn = document.createElement("div");
					newBtn.className = "ContextMenu-btn";
					newBtn.setAttribute("data-translatable", true);
					newBtn.innerHTML = label;
					ContextMenu.dom.appendChild(newBtn);
				}
			}
		}
	}

  /**
   * Add a context menu
   * There's a content object by label and as much content object as you want
   * @function ContextMenu.add
   * @param {object} target - the target of the context menu
   * @param {object} content - An object with the label of an action and a reference to the function which applies the action.
   * @param {string|object} content.label - The action name, it can be a function which recovers the value of a variable, it just must return a string.
   * @param {object} content.action - A reference to a function
   * @todo Manage the case that there's non content send by the user.
   */
   ContextMenu.add = function(){
		if(typeof(arguments[0]) != "object"){
			throw "TypeError: the first argument in ContextMenu.add must be an HTMLElement.";
		}
		var target = arguments[0];
		var content = [];
		
		for(var i = 0; i< arguments.length; i++){
			if(i != 0){
				content.push(arguments[i]);
			}
		}
		
		setting.push({target: target, content: content})
   }

	/**
	 * Remove a context menu
	 * @function ContextMenu.remove
	 * @param {object} target - the target of the context menu
	 */
	ContextMenu.remove = function(target){
		if(typeof(target) == "undefined" || typeof(target) == "string"){
			throw "The first argument in ContextMenu.remove must be an HTMLElement.";
		}
		
		for(var i = 0; i< setting.length; i++){
			if(setting[i].target == target){
				setting.splice(i, 1);
			}
		}
	}
   
    /**
     * Remove the context menu if it's visible.
     * @function ContextMenu.hide
     */
	ContextMenu.hide = function(){
		if(ContextMenu.visible){
			ContextMenu.visible = false;
			ContextMenu.target = "undefined";
			ContextMenu.dom.parentNode.removeChild(ContextMenu.dom);
		}
	}

    /**
     * Return the html element of the button which contains the given text
     * @function ContextMenu.btn
     * @return {object} The html element containing the text send in parameter.
     */
    ContextMenu.btn = function(string){
		if(ContextMenu.visible){
			var childs = ContextMenu.dom.childNodes;
			for(var i = 0; i < childs.length; i++){
				if(childs[i].textContent == string){
					return childs[i];
				}
			}
		}else{
			return false;
		}
    }
	
})()
