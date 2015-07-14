'use strict';
 
/* Controllers */
 
app.controller('EditPermissionCtrl', ['$scope', 'RoleServ', function($scope, RoleServ) {

  RoleServ.getPermissions().success(function(data){
    console.log(data);
    $scope.roles = data.rolesData;
    $scope.permissions = data.permissionsData;
    $scope.apiCallReturned = true;     
  });

  $scope.editPermission = function(){
    if(!$scope.apiCallReturned)
      return;

    console.log($scope.permissions);

    RoleServ.editPermissions({permissions: $scope.permissions}).success(function(data){
      console.log(data);
      if(data.invalidRoles.length){
        alert("The following roles are invalid: " + data.invalidRoles);
      }else{
        alert("Permissions edited");
      }
    }).error(function(err){
      alert("An error occured: " + err);
    });

  }

}]);
