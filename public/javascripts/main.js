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
		controller: 'loginCtrl'
	});
	
	$urlRouterProvider.otherwise('/login');
}]);