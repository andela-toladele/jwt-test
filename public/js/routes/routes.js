app.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {

    $routeProvider.
      when('/', {
        templateUrl: 'partials/home.html',
        controller: 'HomeCtrl'
      }).
      when('/signin', {
        templateUrl: 'partials/signin.html',
        controller: 'HomeCtrl'
      }).
      when('/signup', {
        templateUrl: 'partials/signup.html',
        controller: 'HomeCtrl'
      }).
      when('/me', {
        templateUrl: 'partials/me.html',
        controller: 'HomeCtrl'
      }).
      when('/addroles', {
        templateUrl: 'partials/addroles.html',
        controller: 'AddRolePermissionCtrl'
      }).
      when('/editpermission', {
        templateUrl: 'partials/editpermission.html',
        controller: 'EditPermissionCtrl'
      }).
      when('/assignrole', {
        templateUrl: 'partials/assignrole.html',
        controller: 'AssignRoleCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $httpProvider.interceptors.push(['$q', '$location', '$window', function($q, $location, $window) {
        return {
          'request': function (config) {
            config.headers = config.headers || {};
            if ($window.localStorage['jwtToken']) {
                config.headers.Authorization = 'Bearer ' + $window.localStorage['jwtToken'];
            }
            return config;
          },
          'responseError': function(response) {
            if(response.status === 401 || response.status === 403) {
                $location.path('/signin');
            }
            return $q.reject(response);
          }
        };
      }]);

    }
]);