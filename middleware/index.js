var models = require('./../models');
var Token = require('./../models/token');
//var User = require('./../models/user');


function requiresUser(req, res, next) {
    //console.log(User);
    
    Token.getEmail( req.headers.authorization , function(err, token) {
        
        if (err || !token){
            res.status(403).send("Forbidden");
        }else{
            models.User.findByEmail( token.email , function(err, user) {
                req.user = user.email;
                req.name = user.firstname + ' ' + user.lastname;
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
