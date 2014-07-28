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
