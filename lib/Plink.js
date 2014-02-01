var P = require('internet');
var PlinkServer = require('./PlinkServer.js');

function Plink(options){
	this.p = P.create(options);
}

Plink.create = function(options){
	return new Plink(options);
};

module.exports = Plink;

Plink.prototype.connect = function(address){
	var onramp = this.p.connect(address);
	return PlinkServer.create(onramp);
};
