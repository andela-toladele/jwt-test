'use strict';
 
/* Controllers */
 
app.controller('AssignRoleCtrl', ['$scope', '$q', 'RoleServ', function($scope, $q, RoleServ) {

  $q.all([RoleServ.getRoles(), RoleServ.getUsers()]).then(function(data){
    console.log(data[0].data, data[1].data);
    $scope.roles = data[0].data;
    $scope.users = data[1].data;
    $scope.apiCallReturned = true;
  });

  $scope.selectedUserRole = function(){

    if(!$scope.apiCallReturned)
      return "...";

    for(var i=0; i<$scope.users.length; i++){
      if($scope.users[i]._id == $scope.userId)
        return $scope.users[i].role;
    }

    return "";

  }

  $scope.assignRole = function(){

    if(!$scope.apiCallReturned)
      return;
    
    if((!$scope.userId || !$scope.role)){
        alert("Select user and role");
        return;
      }

    RoleServ.setRole({userId: $scope.userId, role: $scope.role}).success(function(data){

      alert("Role assigned");
      
    })
    .error(function(err, status){
      if(status == 403 || status == 401){
        alert("Unauthorized");
      }else{
        alert("Error occured");
      }
    });    
  }

}]);