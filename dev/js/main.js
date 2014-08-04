/**
 * @file This main file of the application. It's the script which create 
 * all the application.
 */

/**
 * Allows to show all masks.
 * Useful for debug
 * @function showMask
 */
function showMask(){
	List.showMask = true;
	Card.showMask = true;
}

/**
 * Allows to hide all masks.
 * Useful for debug
 * @function hideMask
 */
function hideMask(){
	List.showMask = false;
	Card.showMask = false;
}

/** Create the default lists */
(function(){
	new List(app.TEXT["To do"]).addCard(false);
	new List(app.TEXT["In progress"]).addCard(false);
	new List(app.TEXT["Done"]).addCard(false);
})()

util.addEvent(app.BTN_ADDLIST, "click", function(){new List;});

/** gets the lang menu */
app.LANG_MENU = document.getElementsByClassName('lang-menu')[0];
app.LANG_MENU_HEAD = document.getElementsByClassName('lang-menu-head')[0];
app.BTN_LANG_MENU = document.getElementsByClassName('lang-menu-btn')[0];

/** displays the current language */
app.LANG_MENU_HEAD.innerHTML = app.TEXT.__lang__.replace(/^\w/, function($0) { return $0.toUpperCase(); }); // puts the first letter in upper-case

util.addEvent(document, "mousedown", menuLangDown);
util.addEvent(document, "mouseup", menuLangUp);

/**
 * Handles the lang menu.
 * @function menuLangDown
 * @event
 */
function menuLangDown(event){
	var target = event.target || event.srcElement;
	
	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}
	
	if(button == 1 && util.hasParent(target, app.LANG_MENU) && target.localName == "li"){
		target.className = "onclick";
	}	
}

/**
 * Handles the lang menu.
 * @function menuLangUp
 * @event
 */
function menuLangUp(event){
	var target = event.target || event.srcElement;
	
	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}	
	
	if(button == 1 && (target == app.BTN_LANG_MENU || util.hasParent(target, app.BTN_LANG_MENU))){	
		if(util.getStyle(app.LANG_MENU, "display") == "none"){
			app.LANG_MENU.style.display = "block";
		}else{
			app.LANG_MENU.style.display = "none";
		}
	}else if(!util.hasParent(target, app.LANG_MENU)){
		if(util.getStyle(app.LANG_MENU, "display") == "block"){
			app.LANG_MENU.style.display = "none";
		}
	}
	
	/** change the interface language. */
	if(button == 1 && util.hasParent(target, app.LANG_MENU) && target.localName == "li"){
		target.className = "";
		changeLang(target.innerHTML.toLowerCase());
		app.LANG_MENU_HEAD.innerHTML = target.innerHTML;
	}
}
