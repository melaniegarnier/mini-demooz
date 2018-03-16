/*
* This component is the main component, to manage all the others and make them communicate.
*/


app.component('elPadre', {
	templateUrl: '/ep/el-padre.html',
	bindings: {},
	controller: elPadreCtrl,
	controllerAs: 'ctrl'
});

function elPadreCtrl ($http, $stateParams) {
	var self = this;

	// initializations
	self.error = null;
	self.header = 'Mini Demooz en action !';
	self.dataSearchBar = {
		'user': { buttonOwn: 'J\’ai ce produit', buttonTest: 'Je veux le tester' },
		'product': { buttonOwn: 'Il le possède', buttonTest: 'Il veut le tester' }
	};
	self.dataArrays = {
		'user': { // data for a user
			own: { relation: 'own', header: 'Possède les produits', array: [] },
			test: { relation: 'test', header : 'Veut tester les produits', array: [] }
		},
		'product': { // data for a product
			own: { relation: 'own', header: 'Ils le possèdent', array: [] },
			test: { relation: 'test', header : 'Ils veulent le tester', array: [] }
		}
	};

	// from url
	self.objType = $stateParams.objType;
	self.nameReq = $stateParams.name;


	/*
	* This function makes an http request to /get/obj/:something/id/:name-of-something/relation/:relation
	* The response of the request must contain :
	* - an array (to be displayed)
	* - and a key 'type' (of which the value is the key for the array)
	* In case of error, the response will contain a key 'error', of which the content will be displayed.
	*/
	self.getObjData = function (relation) {
		$http.get('/get/obj/' + self.objType + '/id/' + self.nameReq + '/relation/' + relation)
		.then((response) => {
			if (response.data.hasOwnProperty('error')) {
				self.error = response.data.error;
			}
			else if (response.data.hasOwnProperty('type')) {
				let type = response.data.type; // use type to take response

				if (!response.data[type].length) {
					self.error = null;
					self.dataArrays[self.objType][relation].friends = ['Aucun']; // before something better
				} else {
					self.error = null;
					self.dataArrays[self.objType][relation].friends = response.data[type];
				}
			}
		});
	};

	// fill the arrays
	self.getObjData('own');
	self.getObjData('test');

	/*
	* This function makes an http post request to the server with /add/relation/:relation
	* The data sent to the server are a JSON (see @data). The response is a JSON containing either an error (alert)
	* or a key "added" with the name of the object added (-> to update arrays, thanks to data-binding).
	*/
	self.addRelation = function (relation, inputVal) {
		if (inputVal == '') return; // if empty value
		let data = {
			"objType": self.objType,
			"name": self.nameReq,
			"nameFriend": inputVal
		}
		$http.post(`/add/relation/${relation}`, data)
		.then(response => {
			if (response.data.hasOwnProperty('error')) // if error, alert
				alert(response.data.error);
			else { // else : add the data into the corresponding array, removing "Aucun" if there is
				if (self.dataArrays[self.objType][relation].friends.indexOf('Aucun') === 0)
					self.dataArrays[self.objType][relation].friends = [response.data.added];
				else
					self.dataArrays[self.objType][relation].friends.push(response.data.added);
			}
		})
	}
}


