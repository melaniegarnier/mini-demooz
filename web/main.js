/*
* Main : call angular and set routes
*/

var app = angular.module('miniDem', ['ui.router']);

app.config(["$locationProvider", function($locationProvider) {
	$locationProvider.html5Mode(true);
}]);


/* routing for the single page */
app.config(($stateProvider, $urlRouterProvider) => {
	$urlRouterProvider.otherwise('/minidem');

	$stateProvider
	.state('home', {
		url: '/minidem',
		template: '<sweet-home></sweet-home>',
		controller: sweetHomeCtrl,
		controllerAs: 'ctrl'
	})
	.state('search', {
		url: '/minidem/:objType/:name',
		template: '<el-padre></el-padre>',
		controller: elPadreCtrl
	});
});

