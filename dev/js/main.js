
// Allows to show all masks
function showMask(){
	List.showMask = true;
	Card.showMask = true;
}

// Allows to hide all masks
function hideMask(){
	List.showMask = false;
	Card.showMask = false;
}

/** Create the default lists */
(function(){
	new List(TEXT["To do"]).addCard(false);
	new List(TEXT["In progress"]).addCard(false);
	new List(TEXT["Done"]).addCard(false);
})()

util.addEvent(BTN_ADDLIST, "click", function(){new List;});

//Le menu de la langue
LANG_MENU = document.getElementsByClassName('lang-menu')[0];
LANG_MENU_HEAD = document.getElementsByClassName('lang-menu-head')[0];
BTN_LANG_MENU = document.getElementsByClassName('lang-menu-btn')[0];

// We display the current language
LANG_MENU_HEAD.innerHTML = TEXT.lang.replace(/^\w/, function($0) { return $0.toUpperCase(); }); // The first letter in uppercase

util.addEvent(document, "mousedown", menuLangDown);
util.addEvent(document, "mouseup", menuLangUp);

function menuLangDown(event){
	var target = event.target || event.srcElement;
	
	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}
	
	if(button == 1 && util.hasParent(target, LANG_MENU) && target.localName == "li"){
		target.className = "onclick";
	}	
}

function menuLangUp(event){
	var target = event.target || event.srcElement;
	
	if(!event.which && event.button){ // Firefox, Chrome, etc...
		var button = event.button;
	}else{ // MSIE
		var button = event.which;
	}	
	
	if(button == 1 && (target == BTN_LANG_MENU || util.hasParent(target, BTN_LANG_MENU))){	
		if(util.getStyle(LANG_MENU, "display") == "none"){
			LANG_MENU.style.display = "block";
		}else{
			LANG_MENU.style.display = "none";
		}
	}else if(!util.hasParent(target, LANG_MENU)){
		if(util.getStyle(LANG_MENU, "display") == "block"){
			LANG_MENU.style.display = "none";
		}
	}
	
	// Change the lang of the interface.
	if(button == 1 && util.hasParent(target, LANG_MENU) && target.localName == "li"){
		target.className = "";
		changeLang(target.innerHTML.toLowerCase());
		LANG_MENU_HEAD.innerHTML = target.innerHTML;
	}
}
