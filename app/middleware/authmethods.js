var User = require('./../models/User');
var Permission = require('./../models/Permission');

var AuthMethods = function() {

  var self = this;

  this.validateTokenAndExec = function(req, res, next, callback) {

    var bearerToken;

    var bearerHeader = req.headers["authorization"];
    
    if (typeof bearerHeader !== 'undefined') {
      var bearer = bearerHeader.split(" ");
      bearerToken = bearer[1];

      User.findOne({
        token: bearerToken
      }, function(err, user) {
        if (err) {
          return res.send(500);
        } else {

          if (user) {
            self.getUserPermissions(user, req, res, next, callback);         

          } else {

            return res.send(401, {
              type: false,
              message: 'Invalid token!'
            });
          }
        }
      });
    } else {
      return res.send(401, {
        type: false,
        message: 'No token found!'
      });
    }
  };

  this.validateToken = function(req, res, next) {
    self.validateTokenAndExec(req, res, next);
  }

  this.isAdmin = function(req, res, next) {

    self.validateTokenAndExec(req, res, next, function(userObj, request, response, nextObj) {
      
      if (userObj) {
        if (userObj.userType === "admin") {
          nextObj();
        } else {
          
          return response.send(403, {
            type: false,
            message: 'Restricted to admin!'
          });
        }
      }else{
        throw 'Undefined Error';
      }

    });
  };

  this.getUserPermissions = function(user, req, res, next, callback) {
    var permissions = [];


    if (user.role) {
      var allPermission;

      Permission.find({
        'roles': user.role
      }, function(err, data) {
        if (err)
          return res.send(err);
        allPermission = data;


        if (allPermission) {
          allPermission.forEach(function(value) {

            permissions.push(value.name);
            //console.log(permissions);

          });
          user.permission = permissions;
          req.user = user;

          if(callback){
            callback(user, req, res, next);
          }else{
            next();
          }

        }
      });
    }

  }

  this.hasPermission = function(permission) {

    var flag;
    Permission.findOne({
      name: permission
    }, function(err, data) {
      if (err)
        return res.send(err);

      if (data) {
        if (req.user.userType == "admin") {
          next();
          return;
        }

        data.roles.forEach(function(role) {

          if (req.user.role && role.name == req.user.role) {
            flag = true;
            next();
          }

        });
      }

      if (!flag)
        return res.send(401, 'User is not authorized');
    });

  }
}

module.exports = new AuthMethods();
