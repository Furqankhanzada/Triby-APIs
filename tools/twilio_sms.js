// Load the twilio module
var twilio = require('twilio');

var exports = module.exports = {};

// Create a new REST API client to make authenticated requests against the
// twilio back end
var client = new twilio.RestClient(global.TWILIO_SID, global.TWILIO_TOKEN);

exports.sendSMS = function(phoneNumberTo, aMessage, cb){
	// Pass in parameters to the REST API using an object literal notation. The
	// REST client will handle authentication and response serialzation for you.
	console.log("number: " + phoneNumberTo);
	console.log("aMessage: " + aMessage);
	console.log("global.TWILIO_NUMBER: " + global.TWILIO_NUMBER);
	client.sms.messages.create({
	    to:phoneNumberTo,
	    from:global.TWILIO_NUMBER,
	    body:aMessage
	}, function(error, message) {
	    // The HTTP request to Twilio will run asynchronously. This callback
	    // function will be called when a response is received from Twilio
	    // The "error" variable will contain error information, if any.
	    // If the request was successful, this value will be "falsy"
	    if (!error) {
	        // The second argument to the callback will contain the information
	        // sent back by Twilio for the request. In this case, it is the
	        // information about the text messsage you just sent:
	        console.log('Success! The SID for this SMS message is:');
	        console.log(message.sid);
	 
	        console.log('Message sent on:');
	        console.log(message.dateCreated);
	        cb({"status":"success","message":'Success! The SID for this SMS message is:' + message.sid});
	    } else {
	    	console.log(error);
	        console.log('Oops! There was an error.');
	        cb({"status":"error","message":error.message});
	    }
	});

}