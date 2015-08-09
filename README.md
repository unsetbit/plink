# Plink makes networking browsers easy

Plink is small tool (a thin layer on top of [P](https://github.com/unsetbit/p))
for creating data channels between two browsers.

## Example
Here's an example of two applications which will establish
a peer-to-peer connection with each other using a 
[plink-server](http://github.com/unsetbit/plink-server) and
then send greetings to each other via a peer-to-peer data channel.

hello.html
```html
<!doctype html><title>Hello!</title>
<script src="/plink.js"></script>
<script>
	// Connect to plink-server and await connection using
	// 'something secret' as the key.
	Plink.create()
		.connect('ws://' + location.hostname + ':20500/')
		.on('connection', function(peer){
			peer.on('open', function(){
				peer.send('Hello!');
			});
		})
		.setKey('something secret');
</script>
```
hi.html
```html
<!doctype html><title>Hi!</title>
<script src="/plink.js"></script>
<script>
	// Connect to plink-server and attempt to connect to
	// peer using 'something secret' as the key.
	Plink.create()
		.connect('ws://' + location.hostname + ':20500/')
		.useKey('something secret')
		.then(function(peer){
			peer.on('open', function(){
				peer.send('Hi!');
			});
		});
</script>
```

Note that the "Hello!" and "Hi!" messages never go through the
plink-server. The plink-server is only used to help the two peers
connect to each other using a shared passcode. 

## API
* For WebRtcNode API documentation, see [P](https://github.com/unsetbit/p).
* For Promise API documentation, see [when.js](https://github.com/cujojs/when).

```javascript
// Create root plink instance
var plink = Plink.create();

// Connect to a plink-server
var plinkServer = plink.connect(plinkServerAddress);

// Set a key. Other peers can use to connect to this browser using this 
// key via a the connected plink-server.
// Returns a promise on whether the operation succeeded.
var promise = plinkServer.setKey(mySecretKeyString);

// Set a key with an expiration in milliseconds
// Returns a promise on whether the operation succeeded.
var promise = plinkServer.setKey(mySecretKeyString, 60 * 1000);

// Revoke a key.
// Returns a promise on whether the operation succeeded.
var promise = plinkServer.revokeKey(mySecretKeyString);

// Use a key to connect to a peer.
// Returns a promise for a WebRtcNode, please see the P documentation for
// the API of the WebRtcNode.
var webRtcNodePromise = plinkServer.useKey(theirSecretKeyString);

// Events
plinkServer.on('connection', webRTCNodeHandler);
plinkServer.on('open', openHandler);
plinkServer.on('close', closeHandler);
plinkServer.on('error', errorHandler);
plinkServer.removeListener(eventName, optionalBoundHandler);
```
