var app = angular.module('miniDem', ['ui.router']);

app.config(["$locationProvider", function($locationProvider) {
	$locationProvider.html5Mode(true);
}]);


/* routing for the single page */
app.config(($stateProvider, $urlRouterProvider) => {
	$urlRouterProvider.otherwise('/');

	$stateProvider
	.state('home', {
		url: '/',
		templateUrl: '/root/main.html'
	})
	.state('search-bar', {
		url: '/search-bar',
		template: '<search-bar></search-bar>',
		controller: searchBarCtrl,
		controllerAs: 'ctrl'
	})
	.state('array-comp', {
		url: '/minidem/:key/:name',
		template: '<array-comp></array-comp>',
		controller: arrayCompCtrl,
		controllerAs: 'ctrl'
	});
})
