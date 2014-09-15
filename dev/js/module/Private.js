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
	/**
	 * @constructor
	 */ 
	Private = function(){
		/** contains the memory used by the handler */
		this.memory = []; 
		
		/** contains the identifier of the memory last entry used. */
		this.lastUsedId = -1;
	}
	
	/** 
	 * Allows to add a private variable to an instance.
	 * @function
	 */
	Private.prototype.set = function(name, value, instance){
		if(this.lastUsedId != -1 && this.memory[this.lastUsedId].instance == instance){
			this.memory[this.lastUsedId].attributes[name] = value;
			return;
		}

		for(var i = 0; i < this.memory.length; i++){
			if(this.memory[i].instance == instance){
				this.lastUsedId = i;
				this.memory[i].attributes[name] = value;
				return;
			}
		}
		
		/** creates a new entry */
		var newEntry = {};
		newEntry["instance"] = instance;
		newEntry["attributes"] = [];
		newEntry.attributes[name] = value;
		
		this.memory.push(newEntry); 
	}
	
	/** 
	 * Allows to get a private variable to an instance.
	 * @function
	 */
	Private.prototype.get = function(name, instance){
		if(this.lastUsedId != -1 && this.memory[this.lastUsedId].instance == instance){
			return this.memory[this.lastUsedId].attributes[name];
		}
		
		for(var i = 0; i < this.memory.length; i++){
			if(this.memory[i].instance == instance){
				this.lastUsedId = i;
				return this.memory[i].attributes[name];
			}
		}
		return undefined;
	}
	
	/** 
	 * Allows to get a private variable to all the instance which has this variable.
	 * @function
	 * @return {array} result - A list of object containing the instance and the value of the private variable.
	 */
	Private.prototype.getAllInstance = function(name){
		var result = [];
		
		for(var i = 0; i < this.memory.length; i++){
			if(typeof(this.memory[i].attributes[name]) != "undefined"){
				var obj = {};
				obj.instance = this.memory[i].instance;
				obj[name] = this.memory[i].attributes[name];
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
		for(var i = 0; i < this.memory.length; i++){
			if(this.memory[i].instance == instance){
				this.memory.splice(i, 1);
			}
		}
	}
})();