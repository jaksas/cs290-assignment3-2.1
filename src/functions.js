function valNum () {
	if (document.getElementsByName("number_pgs_chc")[0].value < 1) {
		document.getElementsByName("number_pgs_chc")[0].value = 1;
	}
	if (document.getElementsByName("number_pgs_chc")[0].value > 5) {
		document.getElementsByName("number_pgs_chc")[0].value = 5;
	}
}

function userPrefs() {
	var noLangs = new Array(); 
	
	//Store the number of pages to be shown in session storage
	sessionStorage["number_pgs"] = document.getElementsByName('number_pgs_chc')[0].value;
	
	//Clear the filter and unwanted language array from the previous search 
	sessionStorage.removeItem("noLanguages");
	noLangs = []; 
	
	//Set the language filter
	for(var i = 0; i < 4; i++) {
		if (document.getElementsByName("language_filter")[i].checked) {
			noLangs.push(document.getElementsByName('language_filter')[i].value);
		}
	}
	
	//Store the language filter 
	sessionStorage["noLanguages"] = JSON.stringify(noLangs); 
}
	
function getGists() {
	var req = new XMLHttpRequest();
	var gistsArray;
	var url = "https://api.github.com/gists/public";
	
	if(!req) {
		throw 'Unable to create HttpRequest.';
	}
	
	req.open("GET", url, true);
	
	req.onreadystatechange=function() 
	{
		if(this.readyState==4) {
			gistsArray = JSON.parse(req.responseText); 
			filterGists(gistsArray); 
		}
	}
	
	req.send(null); 	
}
	
function filterGists(gistsArray) {
	var printableGists = new Array(); 
	var noLangs = JSON.parse(sessionStorage.noLanguages); 
	var dummy; 
	
	for (var i = 0; i < gistsArray.length; i++) { 
		
		for(var key in gistsArray[i].files) {
			console.log(key);
			console.log(gistsArray[i].files[key]["language"]);
		}
		
		//console.log(gistsArray[i].files); 
		//console.log(gistsArray[i].files[0]); 
		
		for (var j = 0; j < noLangs.length; j++) {
			
			if (gistsArray[i].files.language == noLangs[i])
			{
				printableGists.push([gistsArray[i].url, gistsArray[i].description]); 
				//console.log(gistsArray[i].url);
				//console.log(gistsArray[i].files.language);
			}	
		}
	}
}