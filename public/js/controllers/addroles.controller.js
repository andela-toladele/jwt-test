'use strict';
 
/* Controllers */
 
app.controller('AddRolePermissionCtrl', ['$scope', 'RoleServ', function($scope, RoleServ) {

    $scope.addRole = function(){

      if(!$scope.role || $scope.role==""){
        alert("Enter role");
        return;
      }

      RoleServ.addRole({name: angular.uppercase($scope.role)}).success(function(data){

        console.log(data);
        $scope.role = "";
        alert("Role added");
        
      })
      .error(function(err, status){
        if(status == 422){
          alert("Duplicate found");
        }else if(status == 403 || status == 401){
          alert("Unauthorized");
        }else{
          alert("Error occured");
        }
      });
    }

    $scope.addPermission = function(){

      if(!$scope.permission || $scope.permission == ""){
        alert("Enter permission");
        return;
      }

      RoleServ.addPermission({name: angular.uppercase($scope.permission)}).success(function(data){

        console.log(data);
        $scope.permission = "";
        alert("Permission instance added");
        
      })
      .error(function(err, status){
        if(status == 422){
          alert("Duplicate found");
        }else if(status == 403 || status == 401){
          alert("Unauthorized");
        }else{
          alert("Error occured");
        }
      });
    }
}]);