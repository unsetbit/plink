var when = require('when');

function PlinkServer(onramp){
	this.promises = {};
	this.onramp = onramp;
	this.waitForOpenQueue = [];

	this.onramp.on('message', this.messageHandler.bind(this));
	this.onramp.on('open', this.openHandler.bind(this));
}

PlinkServer.create = function(onramp){
	return new PlinkServer(onramp);
};

module.exports = PlinkServer;

PlinkServer.prototype.on = function(){
	this.onramp.on.call(this.onramp, arguments);
	return this;
};

PlinkServer.prototype.removeListener = function(){
	this.onramp.removeListener.call(this.onramp, arguments);
	return this;
};

PlinkServer.prototype.openHandler = function(){
	var self = this;
	this.waitForOpenQueue.forEach(function(call){
		call();
	});
	
	this.waitForOpenQueue = [];
};

PlinkServer.prototype.setKey = function(key, timeout){
	var self = this,
		deferred = this.promises['set' + key];

	if(!deferred){
		deferred = this.promises['set' + key] = when.defer();
	}

	if(this.onramp.isOpen()){
		this.onramp.send({
			type: 'set key',
			key: key,
			timeout: timeout
		});
	} else {
		this.waitForOpenQueue.push(function(){
			self.onramp.send({
				type: 'set key',
				key: key,
				timeout: timeout
			});
		});
	}

	return deferred.promise;
};

PlinkServer.prototype.revokeKey = function(key){
	var deferred = this.promises['revoke' + key];

	if(!deferred){
		deferred = this.promises['revoke' + key] = when.defer();
	}
	
	this.onramp.send({
		type: 'revoke key',
		key: key
	});

	return deferred.promise;
};

PlinkServer.prototype.useKey = function(key){
	var deferred = this.promises['use' + key];

	if(!deferred){
		deferred = this.promises['use' + key] = when.defer();
	}
	
	if(this.onramp.isOpen()){
		this.onramp.send({
			type: 'use key',
			key: key
		});
	} else {
		this.waitForOpenQueue.push(function(){
			self.onramp.send({
				type: 'use key',
				key: key
			});
		});		
	}
	
	return deferred.promise;
};

PlinkServer.prototype.messageHandler = function(message){
	if(message.type){
		var key = message.key,
			promise;

		switch(message.type){
			case 'address':
				var peer = this.onramp.connect(message.address);
				promise = this.promises['use' + key];
				promise.resolve(peer);
				delete this.promises['use' + key];
				break;
		
			case 'invalid key':
				promise = this.promises['use' + key];
				promise.reject(new Error('invalid key: ' + message.key));
				delete this.promises['use' + key];
				break;
		
			case 'key set':
				promise = this.promises['set' + key];
				promise.resolve(message.key);
				delete this.promises['set' + key];
				break;
		
			case 'key not set':
				promise = this.promises['set' + key];
				promise.reject(new Error('key not set: ' + message.key));
				delete this.promises['set' + key];
				break;
		
			case 'key revoked':
				promise = this.promises['revoke' + key];
				promise.resolve(message.key);
				delete this.promises['revoke' + key];
				break;

			case 'key revoked':
				promise = this.promises['revoke' + key];
				promise.resolve(new Error('key not revoked: ' + message.key));
				delete this.promises['revoke' + key];
				break;
		}
	}
};