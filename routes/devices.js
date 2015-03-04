var express = require('express');
var router = express.Router();

var Device = require('./../models').Device;

// add or update device
router.post('/device', function(req, res) {
	// Set the user properties that came from the POST data
	Device.findOneAndUpdate({"device_id":req.body.device_id},req.body,{upsert:true},function(err,device){
		if(err) {
			res.json({status:"error",message:err});
			return;
		}
		res.json({status:"success", message: 'Device update in the system', data: device});
	});
});