/*
* This component makes an http request to /minidem/get/:something/:name-of-something
* The response of the request must contain :
* - an array (to be displayed)
* - and a key 'type' (of which the value is the key for the array)
* In case of error, the response will contain a key 'error', of which the value will be alerted
*/

app.component('arrayComp', {
	templateUrl: '/root/array-comp.html',
	bindings: {},
	controller: arrayCompCtrl
})

function arrayCompCtrl ($http, $stateParams) {
	var self = this;
	self.keyReq = $stateParams.key;
	self.nameReq = $stateParams.name;
	self.arrayRes;
	self.error;

	$http.get('/minidem/get/' + self.keyReq + '/' + self.nameReq).then(function (response) {
		if (response.data.hasOwnProperty('error'))
			alert(response.data.error); // if error, alert

		else if (response.data.hasOwnProperty('type')) {
			let type = response.data.type; // use type to take response

			if (!response.data[type].length)
				self.arrayRes = ['Aucun']; // before something better
			else
				self.arrayRes = response.data[type];
		}
	});
}