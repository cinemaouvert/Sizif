// MODE STRICT
//"use strict"

/*
	Contient l'objet util et toutes les m�thodes utilis�es
*/

util = {}

/*
	Ajout de scripts de mani�re classique, via la balise <script>
	dans le cas d'un ajout asynchrone, s'il s'agit d'un ajout synchrone,
	on fait une requ�te ajax synchrone puis on place la r�ponse dans une balise
	script qui est donc interpr�t� directement.
*/
util.addScript = function(url, async, callback){
	if(typeof(async) == 'undefined'){
		var async = true;
	}

	if(async){
		var whatis = url.split(".");
		if(whatis[whatis.length - 1] == "js" || whatis[whatis.length - 1] == "php"){
			var src = url;
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = src + '?' + (new Date().getTime()); //-------Evite les problemes de cache
			document.getElementsByTagName('head')[0].appendChild(script);
		}else if(url.substring(0,8) == "<script>"){
			var script = document.createTextNode(url);
			document.getElementsByTagName('head')[0].appendChild(script);
		}else{
			var script = document.createElement('script');
			var code = document.createTextNode(url)
			script = script.appendChild(code);
			document.getElementsByTagName('head')[0].appendChild(script);
		}
	}else{
		if(typeof(callback) == 'undefined'){
			var script = this.addScriptAjax(url);
		}else{
			var script = this.addScriptAjax(url, callback);
		}
	}

	return script;
}

//Permet de charger des script de mani�re synchrone avec l'execution du code
util.addScriptAjax = function(url, miseEnCache, nomMiseEnCache, asynchrone, callback){
	if(url[url.length - 1] != "/"){
		if(typeof(miseEnCache) == "undefined"){
			var miseEnCache = false;
		}
		if(typeof(nomMiseEnCache) == "undefined"){
			var nomMiseEnCache = url;
		}
		if(typeof(asynchrone) == "undefined"){
			var asynchrone = false;
		}

		// on initialise une requ�te Ajax pour t�l�charger le fichier javascript
		var req ;
		if (window.XMLHttpRequest) {
			req = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			req = new ActiveXObject("Microsoft.XMLHTTP");
		}
		req.onreadystatechange = function() {
			if (req.readyState == 4 && req.status == 200) {
				/*
					Si la mise en cache est souhait�e, on stocke le script
					dans le localStorage avec son url comme cl�, comme �a,
					si le script est d�j� pr�sent, on ne fait pas de nouvelle
					requ�te au serveur lors du rechargement.
				*/
				if(miseEnCache && localStorage){
					localStorage.setItem(nomMiseEnCache, req.responseText);
				}

				if(typeof(callback) != "undefined"){
					callback(req.responseText);
				}

				//On execute la r�ponse
				this.launchScript(req.responseText);
			}
		}

		req.open("GET", url, asynchrone);
		req.send(null);
	}else{
		throw 'Impossible d\'ajouter le script, erreur d\'url: "' + url + '".';
	}
}

/*
	Permet d'executer un script comme le ferait "eval" mais est plus appropri� dans le cas de
	d�claration d'objet, de m�thodes ou de fonctions.
*/
util.launchScript = function(string){
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.appendChild(document.createTextNode(string));
	var head = document.head || document.getElementsByTagName('head')[0];
	head.appendChild(script);
	script.parentNode.removeChild(script);
}

util.getJSON = function(url, callback, async){
	if(typeof(async) == "undefined"){
		async = false;
	}

	if(url.substring(url.length - 5) == ".json" || url.substring(url.length - 5) == ".JSON"){

		// on initialise une requ�te Ajax pour t�l�charger le fichier json
		var req ;
		if (window.XMLHttpRequest) {
			req = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			req = new ActiveXObject("Microsoft.XMLHTTP");
		}
		req.onreadystatechange = function(){
			if (req.readyState == 4 && req.status == 200){
				/*
					Si la mise en cache est souhait�e, on stocke le script
					dans le localStorage avec son url comme cl�, comme �a,
					si le script est d�j� pr�sent, on ne fait pas de nouvelle
					requ�te au serveur lors du rechargement.
				*/

				if(typeof(callback) != "undefined"){
					callback(req.responseText);
				}
			}
		}

		req.open("GET", url, async);
		req.send(null);
	}else{
		throw 'Impossible d\'ajouter le script, erreur d\'url: "' + url + '".';
	}
}

util.addEvent = function(objet, event, fonction, capture){ //Ajouter un �couteur d'�v�nement.
	if(typeof(capture) == 'undefined'){
		capture = false;
	}

	if(objet.attachEvent){
		objet.attachEvent('on' + event, fonction);
	}
	else if (objet.addEventListener){
		objet.addEventListener(event, fonction, capture);
	}
}

util.removeEvent = function(objet, event, fonction, capture){
	if(typeof(capture) == 'undefined'){
		capture = false;
	}

	if (objet.detachEvent){
		objet.detachEvent ('on' + event, fonction);
	}
	else if (objet.removeEventListener){
		objet.removeEventListener (event, fonction, capture);
	}
}

/**
 * Test the parents of a child according to criteria
 */
util.hasParent = function(supposedChild, supposedParentOrProp, supposedParentOrValue){
	if(typeof(supposedParentOrProp) == "string"){
		var prop = supposedParentOrProp;
		var value = supposedParentOrValue;
	}else if(typeof(supposedParentOrProp) == "object"){
		var supposedParent = supposedParentOrProp;
	}

	if(typeof(supposedChild) != "undefined" && typeof(supposedParent) != "undefined"){
		var parent = supposedChild.parentNode;
		do{
			if(parent == supposedParent){
				return true;
			}else{
				if(parent != null){
					parent = parent.parentNode;
				}else{
					return false;
				}
			}
		}while(parent);
	}else if(typeof(supposedChild) != "undefined" && typeof(prop) != "undefined"){
		var parent = supposedChild;
		do{
			if(parent[prop] == value){
				return true;
			}else{
				if(parent != null){
					parent = parent.parentNode;
				}else{
					return false;
				}
			}
		}while(parent);
	}else{
		return false;
	}
	return false;
}

util.getStyle = function(element, styleProp){
	var result = "";
	if (element.currentStyle){ //-----pour IE
		try{
			result = element.currentStyle[styleProp];
		}
		catch(e){
			if(typeof(DebugAlert) != "undefined"){
				DebugAlert(e, "exception");
			}
			else{
				DisplayAlert("Une exception s'est produite: " + e);
			}
			result = false;
		}
	}
	else if (document.defaultView && document.defaultView.getComputedStyle){ //----pour Firefox, Opera...
		if(typeof(element) != "undefined" && element.nodeType == 1){
			try{
				result = document.defaultView.getComputedStyle(element,null).getPropertyValue(styleProp);
			}
			catch(e){
				if(typeof(DebugAlert) != "undefined"){
					DebugAlert(e, "exception");
				}
				else{
					DisplayAlert("Une exception s'est produite: " + e);
				}
				result = false;
			}
		}
	}

	return result;
}

util.fromKeycodeToHtml = function(keyCode){
	var result = "";

	var equiv = {
		8: '', // == "Backspace"
		46: '', // == "Del"
		13: '<br>',
		32: ' ',
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down',
		48: '&agrave;', // == "�"
		49: '&',
		50: '&eacute;', // == "�"
		51: '"',
		52: '\'',
		53: '(',
		54: '-',
		55: '&egrave;', // == "�"
		56: '_',
		57: '&ccedil;', // == "�"
		65: 'a',
		66: 'b',
		67: 'c',
		68: 'd',
		69: 'e',
		70: 'f',
		71: 'g',
		72: 'h',
		73: 'i',
		74: 'j',
		75: 'k',
		76: 'l',
		77: 'm',
		78: 'n',
		79: 'o',
		80: 'p',
		81: 'q',
		82: 'r',
		83: 's',
		84: 't',
		85: 'u',
		86: 'v',
		87: 'w',
		88: 'x',
		89: 'y',
		90: 'z',
		186: '$',
		187: '=',
		188: ',',
		190: ';',
		191: ':',
		192: '&ugrave', // == "�"
		219: ')',
		220: '*',
		223: '!',
		226: '<'
	}

	if(typeof(equiv[keyCode]) != "undefined"){
		result = equiv[keyCode];
	}else{
		result = null;
	}

	return result;
}

util.inherit = function(destination, source){
	for (var element in source) {
		destination[element] = source[element];
	}
}
;//Variables globales utilis�es par tout le programme
var SETTING,
	TEXT, //L'objet contenant les string de l'interface
	BTN_ADDLIST = document.getElementsByClassName("btn_addList")[0];
	BROWSER = "";

(function(){
	//On charge les param�tres
	util.getJSON("setting.json", function(response){
		SETTING = JSON.parse(response);
		if(typeof(console.clear) != "undefined"){
			console.clear();
		}
	})
	
	// On cherche le navigateur
	var userAgent = navigator.userAgent;
	var isChrome = /chrome/gi;
		
	if(isChrome.test(userAgent)){
		BROWSER = "chrome";
	}else{
		var isOpera = /(opera|\sopr)/gi; 
		
		if(isOpera.test(userAgent)){
			BROWSER = "opera";
		}else{
			var isMSIE = /(msie|trident)/gi; // On v�rifie s'il y a la signature MSIE d'internet explorer ou "Trident", son moteur de rendu.
		
			if(isMSIE.test(userAgent)){
				BROWSER = "msie";
			}else{
				var isFirefox = /firefox/gi; // On v�rifie s'il y a la signature MSIE d'internet explorer ou "Trident", son moteur de rendu.
		
				if(isFirefox.test(userAgent)){
					BROWSER = "firefox";
				}else{
					var isSafari = /safari/gi;
			
					if(isSafari.test(userAgent)){
						BROWSER = "safari";
					}
				}
			}
		}
	}
	
	//For now there are troubles with MSIE
	if(BROWSER == "msie"){
		var msgEN = "[en]\nFor now the application isn't completely \ncompatible with Internet Explorer, use \nrather Firefox, Google Chrome, Safari or Opera."
		var msgFR = "[fr]\nPour l'instant l'application n'est pas completement \ncompatible avec Internet Explorer, utilisez \nplutot Firefox, Google Chrome, Safari ou Opera."
		var msg = msgEN + "\n\n" + msgFR;
		alert(msg);
		console.warn(msg);	
	}
	
	//Si la langue est r�gl�e sur "Auto", on la d�fini selon la langue du navigateur
	if(SETTING.lang == "auto" || SETTING.lang == "Auto" || SETTING.lang == "AUTO"){
		var isLong = /-/g;
		if(isLong.test(window.navigator.language)){
			var posEnd = window.navigator.language.indexOf("-");
			var language = window.navigator.language.substring(0, posEnd);
			SETTING.lang = language;
		}else{
			SETTING.lang = window.navigator.language;
		}
	}
	
	//On g�re le hors-ligne
	if(SETTING.offline){
		var cool = document.getElementsByTagName("html")[0];
		cool.setAttribute("manifest", "offline.appcache");
		window.applicationCache.update();
	}

})();/**
 * @file This file manages translations and provides a function which allows the user to change the lang
 * of the interface.
 * @author Yohann Vioujard
 */
 
/** download lang defined by the LANG variable and create the TEXT object */
if(localStorage && !localStorage.getItem("lang-" + SETTING.lang)){
	util.getJSON("lang/" + SETTING.lang + ".json", function(response){
		TEXT = JSON.parse(response);
		//On stocke le json sous le nom de la langue
		localStorage.setItem("lang-" + SETTING.lang, response);
	});
}else if(localStorage){
	TEXT = JSON.parse(localStorage.getItem("lang-" + SETTING.lang));
}else{
	util.getJSON("lang/" + SETTING.lang + ".json", function(response){
		TEXT = JSON.parse(response);
	});
}

//On ajoute la langue au text
TEXT.lang = SETTING.lang;

checkText(TEXT);

// We check if the TEXT can be used
function checkText(text){
	var listProperty = ["New list", "Add a card", "Remove the list", "New card"];
	
	for(var i = 0; i<listProperty.length; i++){
		if(typeof(text[listProperty[i]]) == "undefined"){
			var msgEN = "[en]\n\nWARNING:\n the set used for the interface's language is \nnot completely usable, the propertie \n\"" + listProperty[i] + "\" is missing.\n";
			var msgFR = "[fr]\n\nATTENTION:\n l'ensemble choisi pour la langue de l'interface \nn'est pas completement utilisable, la proprietee \n\"" + listProperty[i] + "\" est absente\n";
			var msg = msgEN + "\n\n" + msgFR;	
			alert(msg);
			console.warn(msg);
		}	
	}	
}
	
//Fonction permettant de changer la langue sans rechargement
/**
 * Allows to change the lang without reload the page
 * @function changeLang
 * @param {string} newLang - A string of to letters representing the lang (e.g. "fr" for french) 
 */
function changeLang(newLang){
	var oldTEXT = TEXT;
	var listTrObject = new Array;
	var listAlreadyDone = new Array;
	if(TEXT.lang != newLang){
			//On charge la nouvelle langue et on red�fini TEXT
			if(localStorage && !localStorage.getItem("lang-" + newLang)){
				util.getJSON("lang/" + newLang + ".json", function(response){
					TEXT = JSON.parse(response);
					//On stocke le json sous le nom de la langue
					localStorage.setItem("lang-" + newLang, response);
				});
			}else if(localStorage){
				TEXT = JSON.parse(localStorage.getItem("lang-" + newLang));
			}else{
				util.getJSON("lang/" + newLang + ".json", function(response){
					TEXT = JSON.parse(response);
				});
			}
			
			TEXT.lang = newLang;
			checkText(TEXT);
		
		/**
		 * List all the translatable elements
		 * @function
		 */
		function listingTranslatableObject(object){
			if(typeof(object) == "undefined"){
				var object = document.body; 
			}
			
			if(object.isTranslatable){
				listTrObject.push(object[child]);
			}else{
				for(var child in object){
					try{
						if(object[child] != null && (object[child] instanceof HTMLElement || object[child] instanceof Element)){
							var newObj = true;
						
							//On v�rifie si on n'a pas d�ja test� l'objet
							for(var obj in listAlreadyDone){
								if(listAlreadyDone[obj] == object[child]){
									newObj = false;
									break;
								}
							}
						
							if(newObj){
								listAlreadyDone.push(object[child]);
								if(object[child].hasAttribute("data-translatable") && object[child].getAttribute("data-translatable")){
									listTrObject.push(object[child]);
								}else{
									listingTranslatableObject(object[child]);
								}
							}
						}
					}catch(e){}
				}
			}
		}
		
		listingTranslatableObject();
		
		//On compare le contenu de tous les �l�ments traductibles avec l'ancienne langue, si ils se ressemblent, on les met dans la nouvelle langue
		for(var obj in listTrObject){
			if(typeof(listTrObject[obj]) != "undefined" && listTrObject[obj].nodeType == 1){
				var text = listTrObject[obj].textContent;
				for(var element in oldTEXT){
					var oldStr = oldTEXT[element];
					if(text.search(oldStr) != -1){
						var newStr = text.replace(oldStr, TEXT[element]);
						listTrObject[obj].textContent = newStr;
						listTrObject[obj].innerHTML = newStr;
						listTrObject[obj].text = newStr;
					}
				}
			}
		}
	}
};/**
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
;/**
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
	
	this.defaultInputWidth = 20; // In pixel
	this.maxInputWidth = 0;
	this.inputWidth = 0;

	this.text = "";
	this.inputEditable = false;
	this.isInputEdited = false;
	this.listIntagAttribute = [];
	
	//On cr�e l'objet
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
	container.REF_EVENT_ondblclick = container.EVENT_ondblclick.bind(container);
	container.REF_EVENT_onkeydown = container.EVENT_onkeydown.bind(container);
	container.REF_EVENT_writing = container.EVENT_writing.bind(container);
	
	// return the container
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
	
	//We set the attributes
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
		//On emp�che le comportement par d�faut de l'�v�nement
		event.returnValue = false; 
		if(event.preventDefault) event.preventDefault();

		this.reset();
		
		// We remove the "onkeydown" events
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
		//On lance l'edition via un input
		this.inputEdit();
		
		// we add the "onkeydown" event which will allow to restore the ListTitle
		util.addEvent(document, 'keydown', this.REF_EVENT_onkeydown);
	}
}

/**
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.EVENT_onkeydown = function(event){ // On remet tout dans son �tat normal si la touche "Entr�e" a �t� pr�ss�e
	if(event.keyCode == 13){
		var target = event.target || event.srcElement;
		if(this.isInputEdited){
			//On emp�che le comportement par d�faut de l'�v�nement
			event.returnValue = false; 
			if(event.preventDefault) event.preventDefault();
	
			this.reset();
			
			// We remove the "onclick" event and the "keydown" event
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

		//On remplace la balise "p" du dom par une balise 'input type="text"'
		//Partie 1: on g�re le style
		newInput = document.createElement("input");
		this.inheritStyleInput(newInput);
		
		//Partie 2: on efface la balise de texte pour mettre un input � la place
		this.innerHTML = "";
		newInput.setAttribute("type", "text");
		this.appendChild(newInput);
		newInput.focus(); //On met le focus sur l'input text
		newInput.value = this.text; //On place le texte apr�s le focus afin que le curseur soit plac� � la fin du texte
		
		//Partie 3: on ajoute un �venement sur l'input qui permet de l'agrandir si on a plus de lettres qu'au d�part.
		util.addEvent(document, 'keydown', this.REF_EVENT_writing);
		this.listIntagAttribute = this.intag.attributes;
		this.intag = newInput;
	}
}

//NOTE: varie selon le caract�re, � rendre plus pr�cis.
/**
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.EVENT_writing = function(event){
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
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.reset = function(){
	this.isInputEdited = false;

	//On remet en �tat la balise
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
 * @memberof ListTitle.prototype
 */
ListTitle.prototype.inheritStyleInput = function(newInput){
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
	if(util.getStyle(parentNode, "text-align") == "justify"){ //Justifi�
		newInput.style.textAlign = "justify";
	}
};/**
 * Create a list.
 * @constructor
 * @param {string} [title] - The title of the list.
 * @param {string} [textBtnFooter] - The text displayed in the footer of the list.
 * @returns {object} list - The DOM object representing the list.
 */
function List(title, textBtnFooter){
	List.counter++;

	if(typeof(title) == "undefined"){
		title = TEXT["New list"];
	}

	if(typeof(textBtnFooter) == "undefined"){
		textBtnFooter = TEXT["Add a card"] + "...";
	}

	var list = document.createElement("div");
	list.className = "list";

	// HEADER
	var listHeader = document.createElement("div");
	listHeader.className = "list-header";

	// title
	this.labelHead = new ListTitle(title, "h2");
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
	this.offsetX = 0;
	this.offsetY = 0;
	this.clicked = false;
	this.dropZone = 'undefined';

	/** Attributes used to handle cards */
	this.cardList = new Array;

	util.inherit(list, this);

	/** References to the functions which handle the animations */
	list.REF_EVENT_onmousedown = list.EVENT_onmousedown.bind(list);
	list.REF_EVENT_onmouseup = list.EVENT_onmouseup.bind(list);
	list.REF_EVENT_onmousemove = list.EVENT_onmousemove.bind(list);
	list.REF_EVENT_onmouseover = list.EVENT_onmouseover.bind(list);

	/** add events */
	util.addEvent(document, "mousedown", list.REF_EVENT_onmousedown);
	util.addEvent(document, "mouseup", list.REF_EVENT_onmouseup);

	/** add the context menu */
	ContextMenu.add(list, 
		{label: function(){ return TEXT["Add a card"] }, action: list.addCard.bind(list)},
		{label: function(){ return TEXT["Remove the list"] }, action: list.remove.bind(list)}
	)

	return list;
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
		card = new Card(this);
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

	var index = this.cardList.length;
	this.cardList[index] = card;
	card.cardText.focus();
}

/**
 * @memberof List.prototype
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
 * @memberof List.prototype
 */
List.prototype.remove = function(){
	/** remove the HTMLElement */
	this.parentNode.removeChild(this);
	
	/** remove the context menu */
	ContextMenu.remove(this)
	
	/** decrement the counter */
	List.counter--;
}

/**
 * @memberof List.prototype
 * @event
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

			/** Prevent the default behavior */
			event.returnValue = false;
			if(event.preventDefault){
				event.preventDefault();
			}

			this.dragged = true;
			this.style.zIndex = 99;

			/** We remove the "onmousedown" event */
			util.removeEvent(document, "mousedown", this.REF_EVENT_onmousedown);

			/** We add the "onmousemove" event */
			util.addEvent(document, "mousemove", this.REF_EVENT_onmousemove);

			// On calcul la position de la souris dans l'objet afin de la fixer � l'endroit o� elle le saisie en enregistrant le calcul dans les variable "decal".
			var mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
			var mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;

			/** Calculate the offsets */
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

			/** Create the drop zone */
			this.dropZone = document.createElement("div");
			this.dropZone.style.height = util.getStyle(this, "height");
			this.dropZone.style.width = util.getStyle(this, "width");
			this.dropZone.style.float = "left";
			this.dropZone.className = "list-dropZone";
			this.dropZone.position = this.position;
			this.dropZone.setPosition = function(newPosition){ that.dropZone.position = newPosition; }
			this.parentNode.insertBefore(this.dropZone, this);
			
			/** turn the list in absolute position */
			this.style.left = elementX - parseFloat(util.getStyle(this, "margin-left")) + 'px';
			this.style.top = elementY - parseFloat(util.getStyle(this, "margin-top")) + 'px';
			this.style.width = this.offsetWidth + "px";
			this.style.position = "absolute";
			this.className = "list-dragged";
			
			/** We create the masks */
			List.createMask();

			/** We add the "onmouseover" event */
			util.addEvent(document, "mouseover", this.REF_EVENT_onmouseover);
		}
	}
}

/**
 * @memberof List.prototype
 * @event
 */
List.prototype.EVENT_onmousemove = function(event){
	if(this.dragged){
		// We get the mouse position
		var x = event.clientX + (document.documentElement.scrollLeft + document.body.scrollLeft);
		var y = event.clientY + (document.documentElement.scrollTop + document.body.scrollTop);

		// Apply different offsets
		x -= this.offsetX;
		y -= this.offsetY;

		this.style.left = x + 'px';
		this.style.top = y + 'px';
	}
}

/**
 * @memberof List.prototype
 * @event
 */
List.prototype.EVENT_onmouseup = function(event){
	var target = event.target || event.srcElement;

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
		this.offsetX = 0;
		this.offsetY = 0;

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

	if(button == 1 && target == this.btnFooter){
		this.addCard();
	}
}

/**
 * Over the other lists
 * @memberof List.prototype
 */
List.prototype.EVENT_onmouseover = function(event){
	var maskTarget = event.target || event.srcElement;

	if(maskTarget.className == "list-mask"){

		/** the rollover position is recorded */
		var targetPos = maskTarget.hiddenList.position;

		/** calculate the difference between lists */
		var difference = targetPos - this.position;

		/*
			On insert la list dragg�e apr�s la liste survol�e
			si la position de la liste survol�e est sup�rieure
			� celle dragg�.
		*/
		if(difference > 0){
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
			}else{ // else we change the position number of the target and its mask style.
				maskTarget.hiddenList.setPosition(this.position);
			}
		}

		/**
			On insert la list dragg�e avant la liste survol�e
			si la position de la liste survol�e est inf�rieure
			� celle dragg�.
		*/
		if(difference < 0){
			maskTarget.parentNode.insertBefore(this.dropZone, maskTarget.hiddenList);

			// On red�fini les positions de toutes les listes si �a n'a pas �tait un �change entre deux listes qui �taient c�te � c�te.
			if(targetPos != this.position - 1){
				var allMask = document.getElementsByClassName("list-mask"); // get all the masks
				for(var i = 0; i < allMask.length; i++){
					var listPosition = allMask[i].hiddenList.position;
					if(listPosition >= targetPos && listPosition != List.counter){
						allMask[i].hiddenList.setPosition(listPosition + 1);
					}
				}
			}else{ // else we change the position number of the target and its mask style.
				maskTarget.hiddenList.setPosition(this.position);
			}
		}

		/** change the position number of the dragged list */
		this.setPosition(targetPos);

		/** set the mask style */
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

/*****************************************\
		STATICS ATTRIBUTES AND METHODS
\*****************************************/

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

		/** We look for the empty lists */
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

		/** We check if it's the given list */
		if(typeof(givenList) != "undefined"){
			if(list[i] != givenList){
				create = false;
			}
		}

		/** We check if there is not already a mask */
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
 * Instance counter
 * @memberof List
 */
List.counter = 0;

/**
 * @memberof List
 */
List.showMask = false;
;
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
;
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
