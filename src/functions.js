/*On load:
1. If local storage for favorites is not yet defined, local
     storage is created as an empty array.
2. Favorites are printed in the "showFavorites" div using
     the function printGists */
window.onload = function() {
     if (localStorage.favorites === undefined) {
          localStorage.favorites = [];
     }

     var favs = JSON.parse(localStorage.favorites);
     printGists(favs, 'showFavorites');
};

/*FUNCTION: valNum
Parameters: None
Pre-conditions: 'number_pgs_chc' in 'SEARCH FOR NEW GISTS' form
     is modified.
Post-conditions: 'SEARCH FOR NEW GISTS' form correctly limited to
     1 - 5.
Description: Called when numerical input in the search form in
     GistTrackker.html changes. Prevents the value for
     'number_pgs_chs' from going below 1 or above 5. */
function valNum() {
     //Cannot select value below 1
     if (document.getElementsByName('number_pgs_chc')[0].value < 1) {
          document.getElementsByName('number_pgs_chc')[0].value = 1;
     }
     //Cannot select value above 5
     if (document.getElementsByName('number_pgs_chc')[0].value > 5) {
          document.getElementsByName('number_pgs_chc')[0].value = 5;
     }
}

/*FUNCTION: userPrefs
Parameters: None
Pre-conditions: User clicks the 'Search' button (see form in
     GistTracker.html)
Post-conditions: The amount of pages of gists the user wants to
     see and the languages the user wants filtered out are
     stored in session storage
Description: Lets the user set search options and filters
     prior to the XMLHttpRequest to github.com. */
function userPrefs() {
     var noLangs = new Array();

     //Store the number of pages to be shown in session storage
     sessionStorage['number_pgs'] =
          document.getElementsByName('number_pgs_chc')[0].value;

     //Clear the filter and unwanted language array from the previous search
     sessionStorage.removeItem('noLanguages');
     noLangs = [];

     //Set the language filter
     for (var i = 0; i < 4; i++) {
          if (document.getElementsByName('language_filter')[i].checked) {
               noLangs.push(document.getElementsByName(
                    'language_filter')[i].value);
          }
     }

     //Store the language filter
     sessionStorage['noLanguages'] = JSON.stringify(noLangs);
}

/*FUNCTION: getGists
Parameters: None
Pre-conditions: User clicks the 'Search' button (see form in GistTracker.html)
Post-conditions: Prior search results are cleared and a request is sent to
     github for each page the user wishes to see.
Description: Calls getGistsInternal for each successive get request (one
     per page) */
function getGists() {
     //Clear the current search results
     document.body.removeChild(document.getElementById('showSearch'));
     var searchResults = document.createElement('div');
     searchResults.id = 'showSearch';
     document.body.appendChild(searchResults);

     //Call getGistsInternal for each page desired by the user
     for (var i = 1; i <= sessionStorage.number_pgs; i++) {
          getGistsInternal(i);
     }
}

/*FUNCTION: getGistsInternal
Parameters: num_pg (the number of the page, 1 - 5, requested from
     api.github.com/gists/public)
Pre-conditions: getGists has been called
Post-conditions: Request to github is sent and the results are filtered
     and printed to the screen following successive calls to filterGists
     and printGists
Description: Called by getGists once page in sessionStorage.number_pgs*/
function getGistsInternal(num_pg) {
     var req = new XMLHttpRequest();
     var url = 'https://api.github.com/gists/public';

     if (!req) {
          throw 'Unable to create HttpRequest.';
     }

     url += '?page=' + num_pg;

     req.open('GET', url, true);

     /*When the request is returned, convert to array of objects using
     JSON.parse, filter out undesired gists, and print them*/
     req.onreadystatechange = function() {
          if (this.readyState == 4) {
               printGists(filterGists(
                    JSON.parse(req.responseText)), 'showSearch');
          }
     };

     //Send the request
     req.send(null);
}

/*FUNCTION: filterGists
Parameters: gistsArray (an array of gists objects, one page's worth,
     after conversion by JSON.parse)
Pre-conditions: successful request to github has received a response
Post-conditions: returns a filtered array containing only the
     desired gists
Description: Called by getGistsInternal in order to filter the
     response from github*/
function filterGists(gistsArray) {
     var filteredGists = new Array();

     /*Unfiltered gists are stored in the filteredGists array with
     three parts: url to the api, description of the gist, and html url*/
     for (var i = 0; i < gistsArray.length; i++) {
          if (testLangs(gistsArray[i].files) && testFavs(gistsArray[i])) {
               filteredGists.push(
                    [gistsArray[i].url,
                    gistsArray[i].description,
                    gistsArray[i].html_url]);
          }
     }

     return filteredGists;
}

/*FUNCTION: testFavs
Parameters: gistEntry - a single gist
Pre-conditions: successful request to github has received a response
Post-conditions: any gist already in favorites will not be stored
     in the filteredGists array in the calling function, filterGists
Description: Called by filterGists in order to remove from search
     results those gists already in favorites */
function testFavs(gistEntry) {
     //Convert existing favorites to an array
     if (localStorage.favorites.length != 0) {
          var favs = JSON.parse(localStorage.favorites);
     }
     else {
          favs = [];
     }

     /*Compare the api url of the parameter gist and all gists
     in favorites */
     for (var i = 0; i < favs.length; i++) {
          if (gistEntry.url === favs[i][0]) {
               return false;
          }
     }

     //If we make it here, the gist is not in favorites
     return true;
}

/*FUNCTION: testLangs
Parameters: gistFiles - the array of file objects for a single gist
Pre-conditions: successful request to github has received a response
Post-conditions: Any gist containing a file with an undesired language
     will not be stored in the filteredGists array in the calling
     function, filterGists
Description: Called by filterGists in order to remove from search
     results those gists with an unwanted language */
function testLangs(gistFiles) {
     /*Convert the sessionStorage string of undesired languages
     to an iterable array*/
     var noLangs = JSON.parse(sessionStorage.noLanguages);
	 if(noLangs.length === 0) {
		return true;
	}

     //each separate file has its own key
     for (var key in gistFiles) {

          for (var j = 0; j < noLangs.length; j++) {

               if (gistFiles[key]['language'] == noLangs[j]) {
                    return true;
               }
          }
     }

     //If we make it here, the gist has no files with unwanted languages
     return false;
}

/*FUNCTION: testLangs
Parameters:
     filteredGists - depending on the source of the function call,
          this may be:
          1. An array of filtered gists if function is called by
               getGistsInternal
          2. An array of favorited gists if functions is called on window
               load
          3. A single new entry to be added to the favorites list if
               called by a button click (as defined within this
               function)
     gistType - if "showSearch", then results will be added to the
          "showSearch" div in GistTracker.html. If "showFavorites",
          results will be added to that div.
Pre-conditions: gists have been filtered and ready to print, favorites
     exist on page load, or a gist entry has been removed from the
     search results and is to be added to the favorites list
Post-conditions: Desired gists appear in the proper spot upon the page
Description: Primary function for displaying information to the user */
function printGists(filteredGists, gistType) {

     var gistDiv;        //This will contain all info for each search result
     var gistAPIurl;     //The api url is listed for each search result
     var gistDescribe;   //Description of the gist (also links to html gist)
     var button;         //"Add to Favorites" or "Remove from Favorites"
     var start;          /*Used for numbering results and linking add and
                         remove buttons to the appropriate gistDiv by number*/

     /*Start numbering the gists from 0 if the main gist div in
     GistTracker.html is childless; otherwise number from the last
     entry*/
     if (document.getElementById(gistType).lastChild === null) {
          start = 0;
     }
     else {
          start = parseInt(document.getElementById(gistType).
               lastChild.id.slice(gistType.length)) + 1;
     }

     for (var i = start; i < start + filteredGists.length; i++) {
          /*Create a div for each search result. Each div has a unique ID
          correlated to its own 'Add to Favorites' button. Clicking this
          button removes the corresponding div from the search results and
          places it in favorites, thereby visually changing the location
          of the search result */
          gistDiv = document.createElement('div');
          gistDiv.id = gistType + i;

          /*For the search results, number the results (for ease of seeing that
          results are filtered out)*/
          if (gistType === 'showSearch') {
               gistDiv.appendChild(document.createTextNode(i + 1 + '. '));
          }

          //Add the URL to the div
          gistAPIurl = document.createElement('a');
          gistAPIurl.innerHTML = filteredGists[i - start][0];
          gistAPIurl.setAttribute('href', filteredGists[i - start][0]);
          gistDiv.appendChild(gistAPIurl);
          gistDiv.appendChild(document.createElement('br'));

          //Add the description to the div
          gistDescribe = document.createElement('a');
          if (filteredGists[i - start][1] === '' ||
               filteredGists[i - start][1] === null) {
               gistDescribe.innerHTML = 'No description';
          }
          else {
               gistDescribe.innerHTML = filteredGists[i - start][1];
          }

          /*Set the description to work as a link to the html version of the
          gist*/
          gistDescribe.setAttribute('href', filteredGists[i - start][2]);
          gistDiv.appendChild(gistDescribe);
          gistDiv.appendChild(document.createElement('br'));

          /*Create 'Add to Favorites' or 'Remove from Favorites' button.
          This button will have the appropriate text and will use its ID
          to remove the appropriate search result from the list of search
          results*/
          button = document.createElement('button');
          button.id = gistType + 'b' + i;
          if (gistType === 'showSearch') {
               button.appendChild(document.createTextNode('Add to Favorites'));
          }
          else {
               button.appendChild(
                    document.createTextNode('Remove from Favorites'));
          }

          //Add the button to the div
          gistDiv.appendChild(button);
          gistDiv.appendChild(document.createElement('br'));
          gistDiv.appendChild(document.createElement('br'));

          /*Insert the completed entry into the document as a child of one
          of the two main divs for gists (favorites or search results)*/
          document.getElementById(gistType).appendChild(gistDiv);

          /*Assign to the button a function which removes the div containing
          that button and adds it to the favorites list -
          using the button's ID and the div's ID to find the correct div*/
          button.onclick = function() {
               /*Remove the div containing the button*/
               var referencedGist = document.getElementById(
                    gistType + this.id.slice(gistType.length + 1));
               document.getElementById(gistType).removeChild(referencedGist);

               //Transform local storage of favorites into an array
               if (localStorage.favorites.length != 0) {
                    var favs = JSON.parse(localStorage.favorites);
               }
               else {
                    favs = [];
               }

               /*If user added a search result to favorites, then local
               storage will now contain that search result, and the
               search result will appear under favorites*/
               if (this.innerHTML === 'Add to Favorites') {
                    var url = referencedGist.childNodes[1].innerHTML;
                    var desc = referencedGist.childNodes[3].innerHTML;
                    var html_url =
                         referencedGist.childNodes[3].getAttribute('href');
                    favs.push([url, desc, html_url]);
                    localStorage.favorites = JSON.stringify(favs);
                    printGists([[url, desc, html_url]], 'showFavorites');
               }

               /*If user removed a result from favorites, then local
               storage will no longer contain that search result*/
               else {
                    var url = referencedGist.childNodes[0].innerHTML;
                    var desc = referencedGist.childNodes[2].innerHTML;
                    var html_url =
                         referencedGist.childNodes[2].getAttribute('href');

                    for (var j = 0; j < favs.length; j++) {
                         if (favs[j][0] === url) {
                              favs.splice(j, 1);
                         }
                    }
                    localStorage.favorites = JSON.stringify(favs);
               }
          };
     }
}
