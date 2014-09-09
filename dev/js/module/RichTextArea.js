
(function(){

	/**
	 *
	 * @function RichTextArea
	 * @param {string|object} input - The object to augment or the tag of the object to create.
	 */
	RichTextArea = function(input){
		var RTA;

		if(typeof(input) == "undefined"){
			RTA = document.createElement("div");
		}else if(typeof(input) == "string"){
			RTA = document.createElement(input);
		}else if(typeof(input) == "object"){
			RTA = input;
		}

		var defTxt = RTA.innerHTML;
		//if (document.compForm.switchMode.checked){
			//setDocMode(true);
		//}
		RTA.contentEditable = true;

		function formatDoc(cmd, value){
  			if(validateMode()){
  				document.execCommand(cmd, false, value);
  				RTA.focus();
  			}
		}

		function validateMode(){
		  	//if(!document.compForm.switchMode.checked){
		  		return true;
		  	//}
		  	//alert("Uncheck \"Show HTML\".");
		  	RTA.focus();
		  	return false;
		}

		function setDocMode(bToSource){
		  	var content;
		  	if(bToSource){
		    	content = document.createTextNode(RTA.innerHTML);
		    	RTA.innerHTML = "";
		    	var pre = document.createElement("pre");
		    	RTA.contentEditable = false;
		    	pre.id = "sourceText";
		    	pre.contentEditable = true;
		    	pre.appendChild(content);
		    	RTA.appendChild(pre);
		  	}else{
		    	if(document.all){
		      	RTA.innerHTML = RTA.innerText;
		    	}else{
		      	content = document.createRange();
		      	content.selectNodeContents(RTA.firstChild);
		      	RTA.innerHTML = content.toString();
		    	}
		    	RTA.contentEditable = true;
		  	}
		  	RTA.focus();
		}

		function printDoc() {
		  	if(!validateMode()){
		  		return;
		  	}
		  	var printWin = window.open("","_blank","width=450,height=470,left=400,top=100,menubar=yes,toolbar=no,location=no,scrollbars=yes");
		  	printWin.document.open();
		  	printWin.document.write("<!doctype html><html><head><title>Print<\/title><\/head><body onload=\"print();\">" + RTA.innerHTML + "<\/body><\/html>");
		  	printWin.document.close();
		}

		/**
		 * Creating all the functionalities
		 */
		RTA.clean = function(){
			if(validateMode() && confirm('Are you sure?')){
				RTA.innerHTML = "";
			};
		};
		RTA.print = function(){printDoc()};
		RTA.undo = function(){formatDoc('undo')};
		RTA.redo = function(){formatDoc('redo')};
		RTA.removeFormat = function(){formatDoc('removeFormat')};
		RTA.bold = function(){formatDoc('bold')};
		RTA.italic = function(){formatDoc('italic')};
		RTA.underline = function(){formatDoc('underline')};
		RTA.leftAlign = function(){formatDoc('justifyleft')};
		RTA.centerAlign = function(){formatDoc('justifycenter')};
		RTA.rightAlign = function(){formatDoc('justifyright')};
		RTA.numberedList = function(){formatDoc('insertorderedlist')};
		RTA.dottedList = function(){formatDoc('insertunorderedlist')};
		RTA.quote = function(){formatDoc('formatblock', 'blockquote')};
		RTA.addIndent = function(){formatDoc('outdent')};
		RTA.deleteIndent = function(){formatDoc('indent')};
		RTA.deleteIndent = function(){formatDoc('indent')};
		RTA.hyperlink = function(link){
			if(link && link != '' && link != 'http://'){
				formatDoc('createlink',link)
			}
		};
		RTA.cut = function(){formatDoc('cut')};
		RTA.copy = function(){formatDoc('copy')};
		RTA.paste = function(){formatDoc('paste')};

		if(typeof(input) == "string" || typeof(input) == "undefined"){
			return RTA;
		}
	}

})()
