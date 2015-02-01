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
	var url = "https://api.github.com/gists/public";
		
	if(!req) {
		throw 'Unable to create HttpRequest.';
	}
	
	//Clear the current search results
	document.body.removeChild(document.getElementById("showSearch"));
	var searchResults = document.createElement('div'); 
	searchResults.id = "showSearch"; 
	document.body.appendChild(searchResults);
	
	
	for(var i = 1; i <= sessionStorage.number_pgs; i++) {

		alert(i); 
		url += '?page=' + i;
		//url += '?page=1&per_page=' + sessionStorage.number_pgs * 30;
	
		req.open("GET", url, true);

		req.onreadystatechange=function() {
			if(this.readyState==4) {
				printGists( filterGists( JSON.parse( req.responseText)), "showSearch"); 
			}
		}
	
		req.send(null); 
		alert(i); 		
	}
}
	
function filterGists(gistsArray) {
	var filteredGists = new Array(); 
	
	for (var i = 0; i < gistsArray.length; i++) { 
		
		if(testLangs(gistsArray[i].files)) { 
			filteredGists.push([gistsArray[i].url, gistsArray[i].description, gistsArray[i].html_url]); 			
		}	
	}
	
	return filteredGists; 
}

function testLangs(gistFiles) {
	var noLangs = JSON.parse(sessionStorage.noLanguages); 
	
	for(var key in gistFiles) {
				
		for(var j = 0; j < noLangs.length; j++) {
			
			if (gistFiles[key]["language"] == noLangs[j]) {
				return false;
			}
		}
	}
	
	return true; 
}

function printGists(filteredGists, gistType) {

	var gistDiv;		//This will contain all info for each search result	
	var gistAPIurl; 	//The api url is listed for each search result
	var gistDescribe;	//Description of the gist (also links to html gist)
	var button; 		//"Add to Favorites" or "Remove from Favorites" 
	
	for(var i = 0; i < filteredGists.length; i++) {
		/*Create a div for each search result. Each div has a unique ID correlated
		to its own 'Add to Favorites' button. Clicking this button removes
		the corresponding div from the search results and places it in favorites,
		thereby visually changing the location of the search result */
		gistDiv = document.createElement("div");
		gistDiv.id = gistType + i;
					
		/*Create 'Add to Favorites' or 'Remove from Favorites' button. This button
		will have the appropriate text and will use its ID to remove the appropriate
		search result from the list of search results*/
		button = document.createElement("button");
		button.id = i + gistType; 
		if(gistType === "showSearch") { 
			button.appendChild(document.createTextNode("Add to Favorites"));
		}
		else {
			button.appendChild(document.createTextNode("Remove from Favorites"));
		}
		
		/*For the search results, number the results (for ease of seeing that
		results are filtered out)*/
		if(gistType === "showSearch") {
			gistDiv.appendChild(document.createTextNode(i + 1 + ". "));
		}
		
		//Add the URL to the div 
		gistAPIurl = document.createElement('a'); 
		gistAPIurl.innerHTML = filteredGists[i][0];
		gistAPIurl.setAttribute('href', filteredGists[i][0]);
		gistDiv.appendChild(gistAPIurl); 
		gistDiv.appendChild(document.createElement("br")); 
				
		//Add the description to the div 
		gistDescribe = document.createElement('a');  
		if (filteredGists[i][1] === "" || filteredGists[i][1] === null) {
			gistDescribe.innerHTML = "No description"; 
		}
		else {
			gistDescribe.innerHTML = filteredGists[i][1]; 
		}
		//Set the description to work as a link to the html version of the gist
		gistDescribe.setAttribute('href', filteredGists[i][2]);
		gistDiv.appendChild(gistDescribe); 
		gistDiv.appendChild(document.createElement("br")); 
		
		//Add the button to the div
		gistDiv.appendChild(button);
		gistDiv.appendChild(document.createElement("br")); 
		gistDiv.appendChild(document.createElement("br")); 
				
		//Insert the search result div into the document 
		document.getElementById(gistType).appendChild(gistDiv); 
				
		/*Assign to the button a function which removes the div containing that
		button and adds it to the favorites list -  
		using the button's ID and the div's ID to find the correct div*/
		button.onclick = function() {
			document.getElementById(gistType).removeChild(document.getElementById(gistType + this.id[0]))
		}; 
	}	
}

