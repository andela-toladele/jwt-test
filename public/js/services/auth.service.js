'use strict';

angular.module('angularRestfulAuth')
  .factory('Auth', ['$http', '$window', function($http, $window) {
    var baseUrl = "/api";

    function changeUser(user) {
      angular.extend(currentUser, user);
    }

    function urlBase64Decode(str) {
      var output = str.replace('-', '+').replace('_', '/');
      switch (output.length % 4) {
        case 0:
          break;
        case 2:
          output += '==';
          break;
        case 3:
          output += '=';
          break;
        default:
          throw 'Illegal base64url string!';
      }
      return window.atob(output);
    }

    function getUserFromToken() {
      var token = $window.localStorage['jwtToken'];

      var user = {};
      if (typeof token !== 'undefined') {
        var encoded = token.split('.')[1];
        user = JSON.parse(urlBase64Decode(encoded));
      }

      return user;
    }

    var currentUser = getUserFromToken();

    return {
      save: function(data, success, error) {
        $http.post(baseUrl + '/signup', data).success(success).error(error)
      },
      signin: function(data, success, error) {
        $http.post(baseUrl + '/authenticate', data).success(success).error(error)
      },
      me: function(success, error) {
        $http.get(baseUrl + '/me').success(success).error(error)
      },
      logout: function(success) {
        changeUser({});

        $window.localStorage.removeItem('jwtToken');

        success();
      },
      isAdmin: function() {
        return (currentUser && currentUser.userType == "admin");
      },
      hasPermission: function(permission) {
        return (currentUser && (currentUser.userType == "admin" || (currentUser.permission && currentUser.permission.indexOf(permission) > -1)))
      }
    };
  }]);
