app.component('searchBar', {
	templateUrl: '/root/search-bar.html',
	bindings: {
		//$router: '<',
		testVal: '='
	},
	controller: searchBarCtrl
})

function searchBarCtrl ($location, $http) {
	// console.log('$location');
	// console.log($location);
	this.inputVal = 'enter a value';
	// $http.get("/minidem/product/").then(function (response) {
	// 	console.log(response)
	// 	console.log(response.data)
	// });
}