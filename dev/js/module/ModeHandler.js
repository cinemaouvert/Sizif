/**
 * Contains the state handler module which allows to manage
 * the different states of a node.
 * @file
 */
(function(){
	var _private = new Private;

	/** @constructor */
	ModeHandler = function(){
	
	}

	ModeHandler.prototype.newMode = function(name, callback){
		var modeList = _private.get("modeList", this);
		
		if(typeof(modeList) == "undefined"){
			modeList = [];
		}
		
		if(typeof(modeList) == "undefined"){
			modeList.push({mode: name});
		}else{
			modeList.push({mode: name, constructor: callback});
		}
		
		_private.set("modeList", modeList, this);
	}
	
	ModeHandler.prototype.constructor = function(name, callback){
		var modeList = _private.get("modeList", this);
		if(typeof(modeList) != "undefined"){
			var id = getId(name, this);
			modeList[id].constructor = callback;
		}
	}
	
	ModeHandler.prototype.mode = function(name){
		var currentMode = _private.get("currentMode", this);
		if(currentMode != name){
			var modeList = _private.get("modeList", this);
			if(typeof(modeList) != "undefined"){
				var idCurrent = getId(currentMode, this);
				
				if(typeof(idCurrent) != "undefined"){
					/** destruct the current mode */
					if(typeof(modeList[idCurrent]["destructor"]) != "undefined"){
						modeList[idCurrent].destructor();
					}
				}
				
				/** construct the new mode */
				var idNew = getId(name, this);
				if(typeof(modeList[idNew].destructor) != "undefined"){
					modeList[idNew].constructor();
				}
			}
			
			/** change the current mode */
			_private.set("currentMode", name, this);
		}
	}
	
	ModeHandler.prototype.destructor = function(name, callback){
		var modeList = _private.get("modeList", this);
		if(typeof(modeList) != "undefined"){
			var id = getId(name, this);
			modeList[id].destructor = callback;
		}
	}
	
	/**
	 * Return the id of the mode in the modeList attribute
	 * @function
	 * @private
	 */
	function getId(name, instance){
		var modeList = _private.get("modeList", instance);
		if(typeof(modeList) != "undefined"){
			for(var i = 0; i < modeList.length; i++){
				if(modeList[i].mode == name){
					return i;
				}
			}
		}
		return undefined;
	}
})();