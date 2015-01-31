var noLangs = new Array(); 

function valNum () {
	if (document.getElementsByName("number_pgs_chc")[0].value < 1) {
		document.getElementsByName("number_pgs_chc")[0].value = 1;
	}
	if (document.getElementsByName("number_pgs_chc")[0].value > 5) {
		document.getElementsByName("number_pgs_chc")[0].value = 5;
	}
}

function userPrefs() {
	sessionStorage["number_pgs"] = document.getElementsByName('number_pgs_chc')[0].value;
	sessionStorage.removeItem("noLanguages");
	noLangs = []; 
	for(var i = 0; i < 4; i++) {
		if (document.getElementsByName("language_filter")[i].checked) {
			noLangs.push(document.getElementsByName('language_filter')[i].value);
		}
	}
	sessionStorage["noLanguages"] = JSON.stringify(noLangs); 
}
	
function getGists() {
	var req = new XMLHttpRequest();
	if(!req) {
		throw 'Unable to create HttpRequest.';
	}
	var url = "https://api.github.com/gists/public";
	
	req.open("GET", url, true);
	
	req.onreadystatechange=function() 
	{
		if(this.readyState==4) {
			document.getElementById('showGists').innerHTML = req.responseText; 
		}
	}
	
	req.send(null); 	
}
	