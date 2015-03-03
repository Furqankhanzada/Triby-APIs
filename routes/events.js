var express = require('express');
var router = express.Router();
var middleware = require('./../middleware');
var Event = require('./../models').Event;
var Tribe = require('./../models').Tribe;

router.get('/tribes/:tribeid/events', middleware.requiresUser, function(req, res) {
    Tribe.listEvent(req.param('tribeid') , function(err, events) {
        if(err || !events){
            var ret = middleware.handleDbError(err, events);
            res.send(ret);
        }
        Event.findByIds(events , function(err, evt) {
            res.send({"status":"success", "events":evt});		
        });
    });
});


router.post('/tribes/:tribeid/events', middleware.requiresUser, function(req, res) {
    var event = new Event();
    event.name = req.body.name;
    event.description = req.body.description;
    event.privacy = req.body.privacy;
    event.createdby = req.user;
    event.tribes = [req.param('tribeid')];
    event.save(function () {
        req.eventid = event._id;
        Tribe.addEvent( req , function(err, tribe) {
            if(err || !tribe){
                var ret = middleware.handleDbError(err, tribe);
                res.send(ret);
            }
            res.send({"status":"success", "tribe":tribe});
        });
    });        
});

/*router.post('/events', middleware.requiresUser, function(req, res) {
    var event = new Event();
    event.name = req.body.name;
    event.description = req.body.description;
    event.privacy = req.body.privacy;
    event.createdby = req.user;
    event.tribes = req.body.tribes;
    event.save(function () {
        req.eventid = event._id;
        Tribe.addEvent( req , function(err, tribe) {
            if(err || !tribe){
                var ret = middleware.handleDbError(err, tribe);
                res.send(ret);
            }
            res.send(tribe);
        });
    });        
});*/

router.get('/tribes/:tribeid/events/:eventid', middleware.requiresUser, function(req, res) {
    Event.findById(req.param('eventid') , function(err, event) {
        res.send({"status":"success", "event":event});		
    });
});

router.put('/tribes/:tribeid/events/:eventid', middleware.requiresUser, function(req, res) {
    Event.update(req , function(err, event) {
        res.send({"status":"success", "event":event});		
    });
});


router.put('/events/:eventid/respond', middleware.requiresUser, function(req, res) {
    Event.addToInvite( req , function(err, event) {
                res.send({"status":"success", "event":event});
        });
});

router.get('/getallevents', middleware.requiresUser, function(req, res) {
    Event.listByUser(req.user , function(err, events) {
        res.send({"status":"success", "events":events});		
    });
});

module.exports = router;
