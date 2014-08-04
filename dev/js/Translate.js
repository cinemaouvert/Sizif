/**
 * @file This file manages translations and provides a function which allows the user to change the lang
 * of the interface.
 * @author Yohann Vioujard
 */
 
/** download lang defined by the "app.SETTING.lang" variable and create the app.TEXT object */
if(localStorage && !localStorage.getItem("lang-" + app.SETTING.lang)){
	util.getJSON("lang/" + app.SETTING.lang + ".json", function(response){
		app.TEXT = JSON.parse(response);
		
		/** stores the json with the lang name */
		localStorage.setItem("lang-" + app.SETTING.lang, response);
	});
}else if(localStorage){
	app.TEXT = JSON.parse(localStorage.getItem("lang-" + app.SETTING.lang));
}else{
	util.getJSON("lang/" + app.SETTING.lang + ".json", function(response){
		app.TEXT = JSON.parse(response);
	});
}

/** adds the lang to the "app.TEXT" variable */
app.TEXT.__lang__ = app.SETTING.lang;

checkText(app.TEXT);

/** checks if the app.TEXT can be used */
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
	
/**
 * Allows to change the lang without reload the page
 * @function changeLang
 * @param {string} newLang - A string of to letters representing the lang (e.g. "fr" for french) 
 */
function changeLang(newLang){
	var oldTEXT = app.TEXT;
	var listTrObject = new Array;
	var listAlreadyDone = new Array;
	if(app.TEXT.__lang__ != newLang){
	
			/** loads the new lang and redefines app.TEXT */
			if(localStorage && !localStorage.getItem("lang-" + newLang)){
				util.getJSON("lang/" + newLang + ".json", function(response){
					app.TEXT = JSON.parse(response);
					
					/** stores the json using the lang name */
					localStorage.setItem("lang-" + newLang, response);
				});
			}else if(localStorage){
				app.TEXT = JSON.parse(localStorage.getItem("lang-" + newLang));
			}else{
				util.getJSON("lang/" + newLang + ".json", function(response){
					app.TEXT = JSON.parse(response);
				});
			}
			
			app.TEXT.__lang__ = newLang;
			checkText(app.TEXT);
		
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
						
							/** check if the object hasn't been tested yet */
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
		
		/** compares the content of all the translatable elements with the old lang, if they're the same, it puts it into the new lang */ 
		for(var obj in listTrObject){
			if(typeof(listTrObject[obj]) != "undefined" && listTrObject[obj].nodeType == 1){
				var text = listTrObject[obj].textContent;
				for(var element in oldTEXT){
					var oldStr = oldTEXT[element];
					if(text.search(oldStr) != -1){
						var newStr = text.replace(oldStr, app.TEXT[element]);
						listTrObject[obj].textContent = newStr;
						listTrObject[obj].innerHTML = newStr;
						listTrObject[obj].text = newStr;
					}
				}
			}
		}
	}
}