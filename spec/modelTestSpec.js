'use strict';

var mongoose = require('mongoose');
var User = require('../app/models/User');
var Role = require('../app/models/Role');
var Permission = require('../app/models/Permission');

//mongoose.connect('mongodb://localhost/testdb');
var conn = mongoose.connection;

conn.on('error', function() {
  throw new Error('unable connect to database');
});



describe("Model Test", function() {
  var user;
  var role;
  var permission;

  describe("Users", function() {

    beforeEach(function(done) {

      User.remove({}, function(err) {
        if (!err)
          console.log("User collection removed");
      });
      done();

    });

    it('expects new user to be created', function(done) {
      user = new User();
      user.email = 'mail@dee';
      user.password = '****';

      user.save(function() {
        User.find(function(err, users) {
          expect(err).toBe(null);
          expect(users.length).toBe(1);
          done();
        });
      });
    });

    it('expects duplicate entry to trigger error', function(done) {
      user = new User();
      user.email = 'mail@dee';
      user.password = '****';

      user.save(function() {
        var user2 = new User();
        user2.email = 'mail@dee';
        user2.password = '****';
        user2.save(function(err, users) {
          expect(err).toBeDefined();
          expect(err.code).toBe(11000);
          done();
        });
      });
    });

    it('expects email field to be required', function(done) {
      user = new User();
      user.email = undefined;
      user.password = '****';

      user.save(function(err, user) {
        expect(err).toBeDefined();
        done();
      });
    });
  });

  describe("Roles", function() {

    beforeEach(function(done) {

      Role.remove({}, function(err) {
        if (!err)
          console.log("Role collection removed");
      });
      done();


    });

    it('expects new role to be created', function(done) {
      role = new Role();
      role.name = 'role1';
      role.createdBy = 'me';

      role.save(function() {
        Role.find(function(err, roles) {
          expect(roles.length).toBe(1);
          done();
        });
      });
    });

    it('expects duplicate entry to trigger error', function(done) {
      role = new Role();
      role.name = 'role1';
      role.createdBy = 'me';

      role.save(function() {
        var _role = new Role();
        _role.name = 'role1';
        _role.createdBy = 'me';
        _role.save(function(err, roles) {
          expect(err).toBeDefined();
          expect(err.code).toBe(11000);
          done();
        });
      });
    });

    it('expects role name field to be required', function(done) {
      role = new Role();
      role.name = undefined;
      role.createdBy = 'me';

      role.save(function(err, role) {
        expect(err).toBeDefined();
        done();
      });
    });
  });

  describe("Permissions", function() {

    beforeEach(function(done) {

      Permission.remove({}, function(err) {
        if (!err)
          console.log("Permission collection removed");
      });
      done();


    });

    it('expects new permission to be created', function(done) {
      permission = new Permission();
      permission.name = 'permission1';
      permission.createdBy = 'me';

      permission.save(function() {
        Permission.find(function(err, permissions) {
          expect(permissions.length).toBe(1);
          done();
        });
      });
    });

    it('expects duplicate entry to trigger error', function(done) {
      permission = new Permission();
      permission.name = 'permission1';
      permission.createdBy = 'me';

      permission.save(function() {

        var _permission = new Permission();
        _permission.name = 'permission1';
        _permission.createdBy = 'me';
        _permission.save(function(err, permissions) {
          expect(err).toBeDefined();
          expect(err.code).toBe(11000);
          done();
        });
      });
    });

    it('expects permission name field to be required', function(done) {
      permission = new Permission();
      permission.name = undefined;
      permission.createdBy = 'me';

      permission.save(function(err, permission) {
        expect(err).toBeDefined();
        mongoose.disconnect();
        done();
      });
    });
  });

});
