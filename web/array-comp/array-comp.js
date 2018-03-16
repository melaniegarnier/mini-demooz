/*
* This component builds an array (simple column) thanks to the bound variable named "data".
* It's a dictionary like : 
{
	header: "name of the column",
	array: [1,2,3]
}
* This array will contain 4 rows. The first with "header", the 3 others for each value of "array".
*/


app.component('arrayComp', {
	templateUrl: '/ac/array-comp.html',
	bindings: {
		data: '<'
	},
	controller: arrayCompCtrl
})

function arrayCompCtrl () {}



