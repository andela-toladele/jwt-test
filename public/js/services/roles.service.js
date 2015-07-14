'use strict';
 
angular.module('angularRestfulAuth').factory('RoleServ', function($http){
  var apiFactory = {};

  apiFactory.getUsers = function(){

    return $http.get("/api/users");

  }

  apiFactory.getRoles = function(){

    return $http.get("/api/roles");

  }

  apiFactory.addRole = function(data){

    return $http.post("/api/role", data);

  }

  apiFactory.setRole = function(data){

    return $http.put("/api/set-role", data);

  }

  apiFactory.getPermissions = function(){

    return $http.get("/api/permissions");

  }

  apiFactory.addPermission = function(data){

    return $http.post("/api/permission", data);

  }

  apiFactory.editPermissions = function(data){

    return $http.put("/api/permissions", data);

  }

  return apiFactory;
});
