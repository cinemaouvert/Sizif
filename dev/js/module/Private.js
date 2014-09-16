/**
 * This module provide a private attribute handler.
 * It allows a user to used private attribute
 * with a class.
 * To work it must be himself a private attribute of the class.
 * @exemple
 * 		(function(){
 * 			var _private = new Private; // it's private himself
 *
 *			function myClass(){
 *				_private.set("privateFunc", function(){ return "something" }, this)
 *			}
 *
 *			// return "something"
 *			myClass.prototype.getSomething = function(){
 *				var privateFunc = _private.get("privateFunc", this);
 *				return privateFunc();
 *			}
 *
 *		})();
 */

(function(){
	/** @private */
	var _storage = [];

	/**
	 * @constructor
	 */ 
	Private = function(){
		_storage.push({
			privateObj: this, /** the current instance of private */
			memory: [], /** contains the memory used by the handler */
			lastUsedId: -1 /** contains the identifier of the memory last entry used. */
		});
	}
	
	/** 
	 * Allows to add a private variable to an instance.
	 * @function
	 */
	Private.prototype.set = function(name, value, instance){
		var memory = getMemory(this);
		var lastUsedId = getLastUsedId(this);
		
		if(lastUsedId != -1 && memory[lastUsedId].instance == instance){
			memory[lastUsedId].attribute[name] = value;
			return;
		}

		for(var i = 0; i < memory.length; i++){
			if(memory[i].instance == instance){
				setLastUsedId(i, this);
				memory[i].attribute[name] = value;
				return;
			}
		}
		
		/** creates a new entry */
		var newEntry = {};
		newEntry["instance"] = instance;
		newEntry["attribute"] = [];
		newEntry.attribute[name] = value;
		
		memory.push(newEntry); 
		setMemory(memory, this);
	}
	
	/** 
	 * Allows to get a private variable to an instance.
	 * @function
	 */
	Private.prototype.get = function(name, instance){
		var memory = getMemory(this);
		var lastUsedId = getLastUsedId(this);
	
		if(lastUsedId != -1 && memory[lastUsedId].instance == instance){
			return memory[lastUsedId].attribute[name];
		}
		
		for(var i = 0; i < memory.length; i++){
			if(memory[i].instance == instance){
				setLastUsedId(i, this);
				return memory[i].attribute[name];
			}
		}
		return undefined;
	}
	
	/** 
	 * Allows to delete a private variable to an instance.
	 * @function
	 */
	Private.prototype.remove = function(name, instance){
		var memory = getMemory(this);
		var lastUsedId = getLastUsedId(this);
	
		if(lastUsedId != -1 && memory[lastUsedId].instance == instance){
			delete memory[lastUsedId].attribute[name];
		}
		
		for(var i = 0; i < memory.length; i++){
			if(memory[i].instance == instance){
				delete memory[lastUsedId].attribute[name];
			}
		}
		setMemory(memory, this);
	}
	
	/** 
	 * Allows to get a private variable to all the instance which has this variable.
	 * @function
	 * @return {array} result - A list of object containing the instance and the value of the private variable.
	 */
	Private.prototype.getAllInstance = function(name){
		var memory = getMemory(this);
		var result = [];
		
		for(var i = 0; i < memory.length; i++){
			if(typeof(memory[i].attribute[name]) != "undefined"){
				var obj = {};
				obj.instance = memory[i].instance;
				obj[name] = memory[i].attribute[name];
				result.push(obj);
			}
		}
		return result;
	}
	
	/** 
	 * Allows to delete an instance entry.
	 * @function
	 */
	Private.prototype.deleteInstance = function(instance){	
		var memory = getMemory(this);
	
		for(var i = 0; i < memory.length; i++){
			if(memory[i].instance == instance){
				memory.splice(i, 1);
			}
		}
		setMemory(memory, this);
	}
	
	/** 
	 * return the memory of the private object 
	 * @function
	 * @private
	 */
	function getMemory(privateObj){
		for(var i = 0; i < _storage.length; i++){
			if(_storage[i].privateObj == privateObj){
				return _storage[i].memory;
			}
		}
	}
	
	/** 
	 * set the memory of the private object
	 * @function
	 * @private
	 */
	function setMemory(memory, privateObj){
		for(var i = 0; i < _storage.length; i++){
			if(_storage[i].privateObj == privateObj){
				_storage[i].memory = memory;
			}
		}
	}
	
	/** 
	 * return the last used id by the private object 
	 * @function
	 * @private
	 */
	function getLastUsedId(privateObj){
		for(var i = 0; i < _storage.length; i++){
			if(_storage[i].privateObj == privateObj){
				return _storage[i].lastUsedId;
			}
		}
	}
		
	/** 
	 * set the last used id by the private object
	 * @function
	 * @private
	 */
	function setLastUsedId(id, privateObj){
		for(var i = 0; i < _storage.length; i++){
			if(_storage[i].privateObj == privateObj){
				_storage[i].lastUsedId = id;
			}
		}
	}
	
})();