var models = require('./../models');
var Token = require('./../models/token');
//var User = require('./../models/user');


function requiresUser(req, res, next) {
    
    Token.getUsername( req.headers.authorization , function(err, token) {
        if (err || !token){
            res.status(403).send("Forbidden");
        }else{
            models.User.findOne( {"username": token.username} , function(err, user) {
                req.userId = user._id;
                //req.name = (user.firstname && user.lastname && user.firstname + ' ' + user.lastname) || user.name || user.username;
                next();
            });
        }
    });
}


function handleDbError(err, obj){
    console.log(obj);
    console.log(err);
    if(err){
        console.log('in handle');
        return {"status":"error"};
    }else if(!obj){
        return {"status":"empty result"};
    }else{
        return;   
    }
}


module.exports.requiresUser = requiresUser;
module.exports.handleDbError = handleDbError;
