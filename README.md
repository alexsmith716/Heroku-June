# Heroku-June


### About:

App deployed here:

* https://sleepy-wave-92667.herokuapp.com/

### To-Do:

* logic for handling `readQueryGetGoogleBooks`, `getGoogleBooks` and `googleBooksREFETCH` can be refactored

* Currently, `RESTfulExample.js` (and `GraphQLExample.js`) is just a way to test queries and pagination. It was never intended to be a smart way to present a Google Book search to a user. But, I am going to change that. I'm going to modify it so each query is a "New Search", the data displayed is the "Current Search" and all previous queries are listed to the user as "Saved Searches". Any "New Search" that matches a "Saved Searches" will be merged with the existing cached queries. The user will then be prompted if they would like display the previous cached queries in their "New Search". Or maybe hide those queries behind a tab that offers to "Display Previous Search Results". Also, there will be a "Book View" that queries and displays a modal of a specific volume. That query response is then automatically normalized with the existing object.
