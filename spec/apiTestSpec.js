'use strict';

var request = require('supertest');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var User = require('../app/models/User');
var Role = require('../app/models/Role');
var Permission = require('../app/models/Permission');

mongoose.connect('mongodb://localhost/testdb');



var conn = mongoose.connection;

var app = express();
var router = express.Router();


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

conn.on('error', function() {
  throw new Error('unable connect to database');
});


// load the routes
require('../app/routes')(router);

app.use(router);

describe("Server Test", function() {

  describe("GET /", function() {
    it("returns status code 200", function(done) {
      request(app)
        .get("/")
        .expect(200)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            "success": true,
            "message": "API where you at!"
          }));
          done();
        });
    });
  });

  describe("User signup validation", function() {
    it('should not create a new user if there is no email', function(done) {

      request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send({
          email: undefined,
          password: '1234'
        })
        .expect(422)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            message: 'Incorrect parameters!'
          }));
          done();
        });
    });

    it('should not create a new user if there is no password', function(done) {

      request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send({
          email: 'mail@dee',
          password: undefined
        })
        .expect(422)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            message: 'Incorrect parameters!'
          }));
          done();
        });
    });

  });


  describe("User signup", function() {



    beforeEach(function(done) {

      User.remove({}, function(err) {

        if (!err) {
          console.log('User collection removed!');
        }
      });

      done();
    });

    it('should create a new user', function(done) {

      request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send({
          email: 'mail@dee',
          username: 'name',
          password: '1234'
        })
        .expect(200)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            type: true
          }));
          done();
        });
    });

    it('should not create duplicate user', function(done) {

      var user = new User();
      user.email = 'mail@dee';
      user.password = '****';

      user.save(function() {
        request(app)
          .post('/signup')
          .set('Content-Type', 'application/json')
          .send({
            email: 'mail@dee',
            password: '7777'
          })
          .expect(422)
          .end(function(err, response) {
            //console.log(response.body);
            expect(response.body).toEqual(jasmine.objectContaining({
              data: 'User already exists!'
            }));
            done();
          });
      });

    });

  });

  describe("User signin", function() {



    beforeEach(function(done) {

      User.remove({}, function(err) {
        if (!err) {
          console.log('User collection removed!');
        }
      });

      done();
    });

    it('should not allow signin with a wrong email', function(done) {

      request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send({
          email: 'mail@dee',
          username: 'name',
          password: '1234'
        })
        .expect(200)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            type: true
          }));

          request(app)
            .post('/authenticate')
            .set('Content-Type', 'application/json')
            .send({
              email: 'mail2@dee',
              password: '1234'
            })
            .expect(200)
            .end(function(err, response) {
              expect(response.body).toEqual(jasmine.objectContaining({
                data: 'Incorrect email'
              }));
              done();
            });
        });
    });

    it('should not allow signin with a wrong password', function(done) {

      request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send({
          email: 'mail@dee',
          username: 'name',
          password: '1234'
        })
        .expect(200)
        .end(function(err, response) {
          expect(response.body).toEqual(jasmine.objectContaining({
            type: true
          }));
          request(app)
            .post('/authenticate')
            .set('Content-Type', 'application/json')
            .send({
              email: 'mail@dee',
              password: '7777'
            })
            .expect(200)
            .end(function(err, response) {
              expect(response.body).toEqual(jasmine.objectContaining({
                data: 'Incorrect password'
              }));

              done();
            });
        });
    });

    it('should allow user signin with right credentials', function(done) {

      request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send({
          email: 'mail@dee',
          username: 'name',
          password: '1234'
        })
        .expect(200)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            type: true
          }));

          request(app)
            .post('/authenticate')
            .set('Content-Type', 'application/json')
            .send({
              email: 'mail@dee',
              password: '1234'
            })
            .expect(200)
            .end(function(err, response) {
              expect(response.body).toEqual(jasmine.objectContaining({
                type: true
              }));
              expect(typeof response.body.token).toEqual('string');
              done();
            });
        });
    });

  });


  describe("Role creation and fetching", function() {

    var user;
    var role;
    
    beforeEach(function(done) {

      Role.remove({}, function(err) {
        
        if (!err) {
          console.log('Role collection removed!');
        }
      });

      User.remove({}, function(err) {
        
        if (!err) {
          console.log('User collection removed!');
        }
      });

      done();
    });

    it('should not allow role to be created without sending a token', function(done) {

      request(app)
        .post('/role')
        .set('Content-Type', 'application/json')
        .send({
          name: 'role1'
        })
        .expect(401)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            message: 'No token found!'
          }));

          done();
        });
    });

    it('should not allow role to be created with an invalid token', function(done) {

      request(app)
        .post('/role')
        .set('Content-Type', 'application/json')
        .set('authorization', 'abcdef')
        .send({
          name: 'role1'
        })
        .expect(401)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            message: 'Invalid token!'
          }));

          done();
        });
    });

    it('should not allow role to be created by a user not with admin userType', function(done) {

      user = new User();
      user.email = 'mail@dee';
      user.username = 'tester';
      user.password = '****';
      user.token = 'token1';

      user.save(function() {
        request(app)
          .post('/role')
          .set('Content-Type', 'application/json')
          .set('authorization', 'Bearer token1')
          .send({
            name: 'role1'
          })
          .expect(403)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              message: 'Restricted to admin!'
            }));

            done();
          });
      });

    });

    it('should allow role to be created by a user with admin userType', function(done) {

      user = new User();
      user.email = 'mail@dee';
      user.username = 'tester';
      user.password = '****';
      user.token = 'token1';
      user.userType = "admin";

      user.save(function(err) {
        
        request(app)
          .post('/role')
          .set('Content-Type', 'application/json')
          .set('authorization', 'Bearer token1')
          .send({
            name: 'role1'
          })
          .expect(200)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              message: 'Role created!'
            }));

            done();
          });
      });

    });

    it('should not allow duplicate roles to be created by a user', function(done) {

      user = new User();
      user.email = 'mail@dee';
      user.username = 'tester';
      user.password = '****';
      user.token = 'token1';
      user.userType = "admin";

      role = new Role();
      role.name = 'role1';
      role.createdBy = 'me';

      role.save(function() {

        user.save(function() {
          request(app)
            .post('/role')
            .set('Content-Type', 'application/json')
            .set('authorization', 'Bearer token1')
            .send({
              name: 'role1'
            })
            .expect(422)
            .end(function(err, response) {

              expect(response.body).toEqual(jasmine.objectContaining({
                message: 'Duplicate found!'
              }));

              done();
            });
        });

      });

    });


    it('should not allow roles to be fetched by user with no token', function(done) {

      role = new Role();
      role.name = 'role1';
      role.createdBy = 'me';

      role.save(function() {

        request(app)
          .get('/roles')
          .set('Content-Type', 'application/json')
          .expect(401)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              message: 'No token found!'
            }));

            done();
          });
      });

    });

    it('should not allow roles to be fetched by user with invalid token', function(done) {

      role = new Role();
      role.name = 'role1';
      role.createdBy = 'me';

      role.save(function() {

        request(app)
          .get('/roles')
          .set('Content-Type', 'application/json')
          .set('authorization', 'Bearer 121121')
          .expect(401)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              message: 'Invalid token!'
            }));

            done();
          });
      });

    });

    it('should not allow role to be fetched by a user not with admin userType', function(done) {

      user = new User();
      user.email = 'mail@dee';
      user.username = 'tester';
      user.password = '****';
      user.token = 'token1';
      user.userType = "admin";

      user.save(function(err) {
        
        request(app)
          .post('/role')
          .set('Content-Type', 'application/json')
          .set('authorization', 'Bearer token1')
          .send({
            name: 'role1'
          })
          .expect(200)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              message: 'Role created!'
            }));


            var user2 = new User();
            user2.email = 'mail2@dee';
            user2.username = 'tester2';
            user2.password = '****';
            user2.token = 'token123';

            user2.save(function(err) {

              request(app)
                .get('/roles')
                .set('Content-Type', 'application/json')
                .set('authorization', 'Bearer token123')
                .expect(403)
                .end(function(err, response) {

                  expect(response.body).toEqual(jasmine.objectContaining({
                    message: 'Restricted to admin!'
                  }));

                  done();
                });

            });


          });
      });

    });

    it('should allow role to be fetched by a user with admin userType', function(done) {

      user = new User();
      user.email = 'mail@dee';
      user.username = 'tester';
      user.password = '****';
      user.token = 'token1';
      user.userType = "admin";

      user.save(function(err) {
        
        request(app)
          .post('/role')
          .set('Content-Type', 'application/json')
          .set('authorization', 'Bearer token1')
          .send({
            name: 'role1'
          })
          .expect(200)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              message: 'Role created!'
            }));

            request(app)
              .get('/roles')
              .set('Content-Type', 'application/json')
              .set('authorization', 'Bearer token1')
              .expect(200)
              .end(function(err, response) {
                expect(response.body.length).toEqual(1);
                done();
              });

          });
      });

    });

  });


  describe("Permission creation and fetching", function() {

    var user;
    var permission;

    beforeEach(function(done) {

      Permission.remove({}, function(err) {
        
        if (!err) {
          console.log('Role collection removed!');
        }
      });

      User.remove({}, function(err) {
        
        if (!err) {
          console.log('User collection removed!');
        }
      });

      done();
    });

    it('should not allow permission to be created without sending a token', function(done) {

      request(app)
        .post('/permission')
        .set('Content-Type', 'application/json')
        .send({
          name: 'permission1'
        })
        .expect(401)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            message: 'No token found!'
          }));

          done();
        });
    });

    it('should not allow permission to be created with an invalid token', function(done) {

      request(app)
        .post('/permission')
        .set('Content-Type', 'application/json')
        .set('authorization', 'abcdef')
        .send({
          name: 'permission1'
        })
        .expect(401)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            message: 'Invalid token!'
          }));

          done();
        });
    });

    it('should not allow permission to be created by a user not with admin userType', function(done) {

      user = new User();
      user.email = 'mail@dee';
      user.username = 'tester';
      user.password = '****';
      user.token = 'token1';

      user.save(function() {
        request(app)
          .post('/permission')
          .set('Content-Type', 'application/json')
          .set('authorization', 'Bearer token1')
          .send({
            name: 'permission1'
          })
          .expect(403)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              message: 'Restricted to admin!'
            }));

            done();
          });
      });

    });

    it('should allow permission to be created by a user with admin userType', function(done) {

      user = new User();
      user.email = 'mail@dee';
      user.username = 'tester';
      user.password = '****';
      user.token = 'token1';
      user.userType = "admin";

      user.save(function(err) {
        
        request(app)
          .post('/permission')
          .set('Content-Type', 'application/json')
          .set('authorization', 'Bearer token1')
          .send({
            name: 'permission1'
          })
          .expect(200)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              message: 'Permission object created!'
            }));

            done();
          });
      });

    });

    it('should not allow duplicate permissions to be created by a user', function(done) {

      user = new User();
      user.email = 'mail@dee';
      user.username = 'tester';
      user.password = '****';
      user.token = 'token1';
      user.userType = "admin";

      permission = new Permission();
      permission.name = 'permission1';
      permission.createdBy = 'me';

      permission.save(function() {

        user.save(function() {
          request(app)
            .post('/permission')
            .set('Content-Type', 'application/json')
            .set('authorization', 'Bearer token1')
            .send({
              name: 'permission1'
            })
            .expect(422)
            .end(function(err, response) {

              expect(response.body).toEqual(jasmine.objectContaining({
                message: 'Duplicate found!'
              }));

              done();
            });
        });

      });

    });


    it('should not allow permissions to be fetched by user with no token', function(done) {

      permission = new Permission();
      permission.name = 'permission1';
      permission.createdBy = 'me';

      permission.save(function() {

        request(app)
          .get('/permissions')
          .set('Content-Type', 'application/json')
          .expect(401)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              message: 'No token found!'
            }));

            done();
          });
      });

    });

    it('should not allow permissions to be fetched by user with invalid token', function(done) {

      permission = new Permission();
      permission.name = 'permission1';
      permission.createdBy = 'me';

      permission.save(function() {

        request(app)
          .get('/permissions')
          .set('Content-Type', 'application/json')
          .set('authorization', 'Bearer 121121')
          .expect(401)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              message: 'Invalid token!'
            }));

            done();
          });
      });

    });

    it('should not allow permission to be fetched by a user not with admin userType', function(done) {

      user = new User();
      user.email = 'mail@dee';
      user.username = 'tester';
      user.password = '****';
      user.token = 'token1';
      user.userType = "admin";

      user.save(function(err) {
        
        request(app)
          .post('/permission')
          .set('Content-Type', 'application/json')
          .set('authorization', 'Bearer token1')
          .send({
            name: 'permission1'
          })
          .expect(200)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              message: 'Permission object created!'
            }));


            var user2 = new User();
            user2.email = 'mail2@dee';
            user2.username = 'tester2';
            user2.password = '****';
            user2.token = 'token123';

            user2.save(function(err) {

              request(app)
                .get('/permissions')
                .set('Content-Type', 'application/json')
                .set('authorization', 'Bearer token123')
                .expect(403)
                .end(function(err, response) {

                  expect(response.body).toEqual(jasmine.objectContaining({
                    message: 'Restricted to admin!'
                  }));

                  done();
                });

            });


          });
      });

    });

    it('should allow permission to be fetched by a user with admin userType', function(done) {

      user = new User();
      user.email = 'mail@dee';
      user.username = 'tester';
      user.password = '****';
      user.token = 'token1';
      user.userType = "admin";

      user.save(function(err) {
        
        request(app)
          .post('/permission')
          .set('Content-Type', 'application/json')
          .set('authorization', 'Bearer token1')
          .send({
            name: 'permission1'
          })
          .expect(200)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              message: 'Permission object created!'
            }));

            request(app)
              .get('/permissions')
              .set('Content-Type', 'application/json')
              .set('authorization', 'Bearer token1')
              .expect(200)
              .end(function(err, response) {
                expect(response.body.permissionsData.length).toEqual(1);
                done();
              });

          });
      });

    });

  });

});
