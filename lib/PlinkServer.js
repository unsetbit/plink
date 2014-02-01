var when = require('when');

function PlinkServer(onramp){
	this.promises = {};
	this.onramp = onramp;

	this.onramp.on('message', this.messageHandler.bind(this));

	this.on = this.onramp.on.bind(this.onramp);
	this.removeListener = this.onramp.removeListener.bind(this.onramp);
}

PlinkServer.create = function(onramp){
	return new PlinkServer(onramp);
};

module.exports = PlinkServer;

PlinkServer.prototype.setPasscode = function(passcode, timeout){
	var deferred = this.promises['set' + passcode];

	if(!deferred){
		deferred = this.promises['set' + passcode] = when.defer();
	}
	
	this.onramp.send({
		type: 'set passcode',
		passcode: passcode,
		timeout: timeout
	});

	return deferred.promise;
};

PlinkServer.prototype.revokePasscode = function(passcode){
	var deferred = this.promises['revoke' + passcode];

	if(!deferred){
		deferred = this.promises['revoke' + passcode] = when.defer();
	}
	
	this.onramp.send({
		type: 'revoke passcode',
		passcode: passcode
	});

	return deferred.promise;
};

PlinkServer.prototype.usePasscode = function(passcode){
	var deferred = this.promises['use' + passcode];

	if(!deferred){
		deferred = this.promises['use' + passcode] = when.defer();
	}
	
	this.onramp.send({
		type: 'use passcode',
		passcode: passcode
	});
	
	return deferred.promise;
};

PlinkServer.prototype.messageHandler = function(message){
	if(message.type){
		var passcode = message.passcode,
			promise;
			
		switch(message.type){
			case 'address':
				var peer = this.onramp.connect(message.address);
				promise = this.promises['use' + passcode];
				promise.resolve(peer);
				delete this.promises['use' + passcode];
				break;
		
			case 'invalid passcode':
				promise = this.promises['use' + passcode];
				promise.reject(new Error('invalid passcode: ' + message.passcode));
				delete this.promises['use' + passcode];
				break;
		
			case 'passcode set':
				promise = this.promises['set' + passcode];
				promise.resolve(message.passcode);
				delete this.promises['set' + passcode];
				break;
		
			case 'passcode not set':
				promise = this.promises['set' + passcode];
				promise.reject(new Error('passcode not set: ' + message.passcode));
				delete this.promises['set' + passcode];
				break;
		
			case 'passcode revoked':
				promise = this.promises['revoke' + passcode];
				promise.resolve(message.passcode);
				delete this.promises['revoke' + passcode];
				break;

			case 'passcode revoked':
				promise = this.promises['revoke' + passcode];
				promise.resolve(new Error('passcode not revoked: ' + message.passcode));
				delete this.promises['revoke' + passcode];
				break;
		}
	}
};