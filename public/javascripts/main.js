var geoApp = angular.module('geoApp',[
'ui.router',
'ngCookies',
'appCtrl'
]);

geoApp.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider){
	$stateProvider
	.state('map',{
		url: '/map',
		controller: 'mapCtrl',
		templateUrl: 'templates/map.html',
		resolve: {
			loginIn: ['you', function(you){
				return you.loginCheck();
			}],
			usersPreload: ['users', function(users){
				return users.getAll();
			}]
		}
	})
	
	.state('login',{
		url: '/login',
		templateUrl: '/login.html',
		controller: 'loginCtrl',
		resolve:{
			reset: ['you', function(you){
				return you.reset();
			}]
		}
	});
	
	$urlRouterProvider.otherwise('/map');
}]);

geoApp.run([
'$rootScope',
'$state',
function($rootScope, $state){
	/**
	Error management when bad resolution of map state promises (id of user in cookie, or just find the user)
	Need to improve this with further error management
	*/
	$rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
		event.preventDefault();
		if(error.status == 500){
			return $state.go('login');
		}
	});
}]);