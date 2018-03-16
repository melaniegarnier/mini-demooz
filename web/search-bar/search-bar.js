/*
* This component builds a search bar and two buttons, thanks to the bound variable "data" :
{
	buttonOwn: 'text in left button',
	buttonTest: 'text in right button'
}
* "func" is the function to call when you click on a button (both have the same function).
*/

app.component('searchBar', {
	templateUrl: '/sb/search-bar.html',
	bindings: {
		data: '<',
		func: '='
	},
	controller: searchBarCtrl
})

function searchBarCtrl () {
	this.inputVal = '';
}


