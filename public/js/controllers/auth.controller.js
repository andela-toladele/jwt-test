'use strict';
 
/* Controllers */
 
app.controller('HomeCtrl', ['$rootScope', '$scope', '$location', '$window', 'Auth', function($rootScope, $scope, $location, $window, Auth) {

      $scope.signin = function() {
        var formData = {
          email: $scope.email,
          password: $scope.password
        }

        Auth.signin(formData, function(res) {
          if (res.type == false) {
            alert(res.data)    
          } else {
            $window.localStorage['jwtToken'] = res.data.token;
            window.location = "/";    
          }
        }, function() {
          $rootScope.error = 'Failed to signin';
        })
      };

      $scope.signup = function() {
        var formData = {
          email: $scope.email,
          password: $scope.password
        }

        Auth.save(formData, function(res) {
          if (res.type == false) {
            alert(res.data);
          } else {
            $window.localStorage['jwtToken'] = res.data.token;
            window.location = "/";  
          }
        }, function() {
            $rootScope.error = 'Failed to signup';
        })
      };

      $scope.me = function() {
        Auth.me(function(res) {
          $scope.myDetails = res;
        }, function() {
          $rootScope.error = 'Failed to fetch details';
        })
      };

      $scope.logout = function() {
        Auth.logout(function() {
          window.location = "/";
        }, function() {
            alert("Failed to logout!");
        });
      };

      $scope.isAdmin = function(){
        return Auth.isAdmin();
      }

      $scope.token = $window.localStorage['jwtToken'];      
  }])
  .controller('MeCtrl', ['$rootScope', '$scope', '$location', 'Auth', function($rootScope, $scope, $location, Auth) {

      Auth.me(function(res) {
        console.log(res);
        $scope.myDetails = res;
      }, function() {
        $rootScope.error = 'Failed to fetch details';
      });
}]);