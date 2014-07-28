/**
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
			//On charge la nouvelle langue et on redéfini TEXT
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
						
							//On vérifie si on n'a pas déja testé l'objet
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
		
		//On compare le contenu de tous les éléments traductibles avec l'ancienne langue, si ils se ressemblent, on les met dans la nouvelle langue
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
}