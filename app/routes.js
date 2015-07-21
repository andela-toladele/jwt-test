var jwt        = require("jsonwebtoken");
var User     = require('./models/User');
var Role     = require('./models/Role');
var Permission     = require('./models/Permission');
var AuthMethods = require('./middleware/authmethods');

// expose the routes to our app with module.exports
module.exports = function(router) {

  router.route('/')

    .get(function(req, res, next) {
      return res.send({ success : true, message : 'API where you at!' });   
  }); 
  
  router.post('/authenticate', function(req, res) {
    User.findOne({email: req.body.email}, function(err, user) {
      if (err) {
        res.json({
          type: false,
          data: "Error occured: " + err
        });
      } else {
        if (user) {

          // if the user is found but the password is wrong
          if (!user.validPassword(req.body.password)){
            res.json({
              type: false,
              data: "Incorrect password"
            }); 
          }

          AuthMethods.getUserPermissions(user, res, null, function(userObj, response){

            userObj.token = jwt.sign(userObj, process.env.JWT_SECRET);
            userObj.save(function(err, user1) {

              if(err){
                response.json({
                  type: false,
                  data: "Error occured: " + err
                });
              }else{
                response.json({
                  type: true,
                  data: user1,
                  token: user1.token
                });
              }
            });              
          });
          //console.log(user);
          // if the password is correct
          
        } else {
          res.json({
            type: false,
            data: "Incorrect email"
          });    
        }
      }
    });
  });

  router.put('/alterusertype', AuthMethods.isAdmin, function(req, res) {
    
    var username = req.body.username;
    var userType = req.body.userType;



    User.findOne({email: req.body.email}, function(err, user) {
      if (err) {
        res.json({
          type: false,
          data: "Error occured: " + err
        });
      } else {
        if (user) {

          user.userType = req.body.userType;

          user.token = jwt.sign(user, process.env.JWT_SECRET);

          user.save(function(err, user1) {

            if(err){
              res.json({
                type: false,
                data: "Error occured: " + err
              });
            }else{
              res.json({
                type: true,
                data: user1,
                token: user1.token
              });
            }            
          });          
        }else{
          res.json({
            type: false,
            data: "Incorrect email"
          });  
        }
      }
    });    
  });

  router.get('/roles', AuthMethods.isAdmin, function(req, res) {
    Role.find(function(err, roles){
      if (err)
        return res.send(err);

      res.json(roles);
    });   
  });

  router.get('/me', AuthMethods.ensureAuthorized, function(req, res) {
    
    res.json({
      type: true,
      data: req.user
    });
        
  });

  router.get('/users', AuthMethods.ensureAuthorized, function(req, res) {
    User.find(function(err, users) {

        if (err)
          return res.send(err);

        res.json(users);
      });
        
  });


  router.post('/signup', function(req, res) {

    if(!req.body.email || !req.body.password){
      return res.send(422,{ type : false, message : 'Incorrect parameters!' });
    }

    User.findOne({email: req.body.email}, function(err, user) {
      if (err) {
        res.json({
            type: false,
            data: "Error occured: " + err
        });
      } else {
        if (user) {
            res.json({
                type: false,
                data: "User already exists!"
            });
        } else {
          var userModel = new User();
          userModel.email = req.body.email;
          userModel.username = req.body.username;
          userModel.password = userModel.generateHash(req.body.password);
          userModel.save(function(err, user) {
            var secret = process.env.JWT_SECRET || 'wtf';
            user.token = jwt.sign(user, secret);            
            user.save(function(err, user1) {
              res.json({
                type: true,
                data: user1,
                token: user1.token
              });
            });
          })
        }
      }
    });
  });

  router.post('/role', AuthMethods.isAdmin, function(req, res) {
    var role = new Role();

    role.createdBy = req.user.username;
    role.name = req.body.name;
    role.when = Date.now();

    
    role.save(function(err, model) {
      if(err){
        if (err.code == 11000)
          return res.send(422,{ type : false, message : 'Duplicate found!' });

        return res.send(err);
      }          
      
      res.json({ message: 'Role created!', data: model});
    });
  });

  router.get('/roles', AuthMethods.isAdmin, function(req, res) {
    Role.find(function(err, roles){
      if (err)
        return res.send(err);

      res.json(roles);
    });   
  });

  router.post('/permission', AuthMethods.isAdmin, function(req, res) {
    var permission = new Permission();

    permission.createdBy = req.user.username;
    permission.name = req.body.name;
    permission.when = Date.now();
    
    permission.save(function(err, model) {
      if(err){
        if (err.code == 11000)
          return res.send(422,{ type : false, message : 'Duplicate found!' });

        return res.send(err);
      }          
      
      res.json({ message: 'Permission object created!', data: model});
    });
  });

  router.get('/permissions', AuthMethods.isAdmin, function(req, res) {
    Role.find(function(err, _roles) {
      var roles = _roles;
      if (err)
        return res.send(err);

      Permission.find(function(_err, permissions){
        if (_err)
          return res.send(_err);

        res.json({rolesData: roles, permissionsData: permissions});
      });      
      
    });

  });

  router.put('/permissions', AuthMethods.isAdmin, function(req, res) {
    Role.find(function(err, roles) {

      if (err)
        return res.send(err);

      var roleNames = [];

      for(var i=0; i<roles.length; i++){
        roleNames.push(roles[i].name);
      }

      
      var permissions = req.body.permissions;
      var invalidRoleNames = [];
      var BreakException= {};
      
      permissions.forEach(function(permission){
                
        var valid = permission.roles.every(function(role){
          if (roleNames.indexOf(role) === -1){
            invalidRoleNames.push(role);
            return false;
          }

          return true;
        });

        if(valid){
          Permission.findByIdAndUpdate(permission._id, permission, function(err, user) {
            if (err)
              return res.send(err);                  
          });
        }
      });
        
      res.json({invalidRoles: invalidRoleNames});
      
    });

  });

  router.put('/set-role', AuthMethods.isAdmin, function(req, res) {
    var userId = req.body.userId;
    var role = req.body.role;

    User.findByIdAndUpdate(userId, { $set: {"role" : role} }, function(err, user) {

      if (err)
        return res.send(err);

      res.json(user);
    });
  });

}