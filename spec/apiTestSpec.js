//'use strict';

var request = require('supertest');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var User = require('../app/models/User');

mongoose.connect('mongodb://localhost/testdb');



var conn = mongoose.connection;

var app = express();
var router = express.Router();


app.use(bodyParser.urlencoded({ extended: true }));
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
        .end(function (err, response) {
          
          expect(response.body).toEqual(jasmine.objectContaining({
              "success": true,
              "message": "API where you at!"
          }));
          console.log(1);
          done();
        });
    });
  });

  describe("User signup validation", function() {
    it('should not create a new user if there is no email', function (done) {

      request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send({email: undefined, password: '1234'})
        .expect(422)
        .end(function (err, response) {
          
          expect(response.body).toEqual(jasmine.objectContaining({
            message: 'Incorrect parameters!'
          }));
          console.log(2);
          done();
        });
    });

    it('should not create a new user if there is no password', function (done) {

      request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send({email: 'mail@dee', password: undefined})
        .expect(422)
        .end(function (err, response) {
          
          expect(response.body).toEqual(jasmine.objectContaining({
            message: 'Incorrect parameters!'
          }));
          console.log(3);
          done();
        });
    });  
    
  });

  
  describe("User signup", function() {
    


    beforeEach(function(done) {

      console.log(10);

      User.remove({}, function(err){
        console.log('in');
        if(!err){
          console.log('nill');         
        }
      }); 

      done();      
    });

    it('should create a new user', function (done) { 

      console.log(111);
      
      request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send({email: 'mail@dee', username: 'name', password: '1234'})
        .expect(200)
        .end(function (err, response) {
          
          expect(response.body).toEqual(jasmine.objectContaining({type: true}));   
          done();
        });
    });

    it('should not create duplicate user', function (done) {

      var user = new User();
      user.email = 'mail@dee';
      user.password = '****';

      user.save(function() {
        request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send({email: 'mail@dee', password: '7777'})
        .expect(422)
        .end(function (err, response) {
          //console.log(response.body);
          expect(response.body).toEqual(jasmine.objectContaining({
            data: 'User already exists!'
          }));
          done();
        });
      });

    });  
    
  });

});
