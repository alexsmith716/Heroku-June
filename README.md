# Heroku-June

## Deprecation Notice

Soon this app will be depreciated. Maintaining a boilerplate that evolves with ever-changing platforms, libraries, dev utilities... is unproductive. A [web application bundler](https://github.com/parcel-bundler/parcel) or [server-rendering framework](https://github.com/vercel/next.js) will speed-up my client-focused projects and therefore enable a better user and developer experience.

----

This app (and many of the earlier apps in this [repo](https://github.com/alexsmith716)) serves two purposes. First, it's been a way for me to learn and test JS configuration and tooling. Second, it allows me to quickly build out and test new client-side features and technologies. Samples of the [Technologies Used](#technologies-used) and [Features](#features) of this app are described below.

The app is deployed here:

* https://sleepy-wave-92667.herokuapp.com/

## Technologies Used
- Node v16.3.0
- webpack 5
- Express
- react-redux
- react-router
- @loadable/component
- styled-components
- @apollo/client & @apollo/server
- GraphQL
- redux-persist
- Typescript
- React

## Features
- Backend
  - SSR
  - code-splitting

- Frontend
  - REST API example
  - GraphQL API example
  - State management (Redux & Apollo)
  - Responsive layout
  - Mobile first design
  - Theming

- App runs local and deployed to Heroku

## Planned Updates:

* Currently, `RESTfulExample.js` (and `GraphQLExample.js`) is just a way to test queries and pagination. It was never intended to be a smart way to present a Google Book search to a user. But, I am going to change that. I'm going to modify it so each query is a "New Search", the data displayed is the "Current Search" and all previous queries are listed to the user as "Saved Searches". Any "New Search" that matches a "Saved Searches" will be merged with the existing cached queries. The user will then be prompted if they would like display the previous cached queries in their "New Search". Or maybe hide those queries behind a tab that offers to "Display Previous Search Results". Also, there will be a "Book View" that queries and displays a modal of a specific volume. That query response is then automatically normalized with the existing object.

* Re-integrate [Progressive Web App -PWA](https://github.com/GoogleChrome/workbox) ability

## Refactors:

* logic for handling `readQueryGetGoogleBooks`, `getGoogleBooks` and `googleBooksREFETCH` can be refactored

## Fixes:
