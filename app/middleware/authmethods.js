var User     = require('./../models/User');
var Permission     = require('./../models/Permission');

var AuthMethods = function(){

  var self = this;

  this.ensureAuthorized = function (req, res, next) {
    
    var bearerToken;

    var bearerHeader = req.headers["authorization"];
    
    if (typeof bearerHeader !== 'undefined') {
      var bearer = bearerHeader.split(" ");
      bearerToken = bearer[1];
      
      User.findOne({token: bearerToken}, function(err, user) {
        if (err) {
         return res.send(500);
        } else {

          if(user){
            //user.permission = self.listUserPermissions(user.role);
            self.getUserPermissions(user, req, next, function(userObj, request, nextObj){

              request.user = userObj;            
              nextObj();
              
            });
            
          } else {
            return res.send(401,{ type : false, message : 'Invalid token!' });
          }   
        }
      });      
    } else {
      return res.send(401);
    }
  };

  this.isAdmin = function(req, res, next) {
    
    self.ensureAuthorized(req, res, next);

    if(req.user){
      if(req.user.userType ==="admin"){
        next();
      }else{
        return res.send(403, { type : false, message : 'Restricted to admin!' });
      }
    }      
  };

  this.getUserPermissions = function(user, reqOrRes, next, callback) {
    var permissions = [];

    
    if(user.role){
      var allPermission;

      Permission.find({'roles': user.role},function(err, data){
        if (err)
          return res.send(err);
        allPermission = data;
        

        if(allPermission){
          allPermission.forEach(function(value) {

            permissions.push(value.name);
            //console.log(permissions);
            
          });
          user.permission = permissions;
          callback(user, reqOrRes, next);
                
        }
      });      
    }
    
  }

  this.hasPermission = function(permission){

    var flag;
    Permission.findOne({name: permission}, function(err, data){
      if (err)
        return res.send(err);

      if(data){
        if(req.user.userType=="admin"){
          next();
          return;
        }

        data.roles.forEach(function(role) {

          if(req.user.role && role.name == req.user.role){
            flag = true;
            next();
          }
          
        });
      }

      if(!flag)
      return res.send(401, 'User is not authorized');
    });
    
  }
}

module.exports = new AuthMethods();
