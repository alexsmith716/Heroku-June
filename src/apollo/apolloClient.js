import { ApolloClient, InMemoryCache, makeVar, createHttpLink, ApolloLink } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { onError } from '@apollo/client/link/error';
import fetch from 'node-fetch';

const googleBooksCurrentSearchStringInit = {
	currentSearchString: '',
	currentSearchStringCopy: '',
};

const charactersCurrentSearchStringInit = {
	currentSearchString: '',
};

export const googleBooksCurrentSearchStringVar = makeVar(googleBooksCurrentSearchStringInit);
export const charactersCurrentSearchStringVar = makeVar(charactersCurrentSearchStringInit);

export function apolloClient({ uri, ssrMode = false }) {
	const httpLink = createHttpLink({
		uri: uri,
		// fetch: ssrMode ? fetch : null,
		fetch: fetch,
	});

	const testDataErrors = new ApolloLink((operation, forward) => {
		operation.setContext({ start: new Date() });

		return forward(operation).map((data) => {
			const time = new Date() - operation.getContext().start;
			if (data.errors) {
				console.log('>>>> apolloClient > data.errors');
			}
			console.log(`>>>> apolloClient > ${operation.operationName} took ${time} to complete`);
			return data;
		});
	});

	const errorLink = onError(({ graphQLErrors, networkError }) => {
		if (graphQLErrors) {
			console.error('>>> errorLink > graphQLErrors:', graphQLErrors[0].message);
		}

		if (networkError) {
			console.error('>>>> apolloClient > [Network error]', networkError);
		}
	});

	const link = ApolloLink.from([testDataErrors, errorLink, httpLink]);

	let cache = new InMemoryCache({
		typePolicies: {
			Query: {
				fields: {
					googleBooksCurrentSearchString: {
						read() {
							return googleBooksCurrentSearchStringVar();
						},
					},
					charactersCurrentSearchString: {
						read() {
							return charactersCurrentSearchStringVar();
						},
					},
					// --------------------------------------
					googleBooks: {
						keyArgs: false,
						read(existing, { args, readField }) {
							if (!existing) return;
							if (args && args.id) {
								return existing.books.find((books) => args.id === readField('id', books));
							}
							return existing;
						},
						merge(existing, incoming) {
							let books = [];
							if (existing && existing.books) {
								books = books.concat(existing.books);
							}
							if (incoming && incoming.books) {
								books = books.concat(incoming.books);
								return {
									...incoming,
									books,
								};
							}
							if (!incoming) {
								return {
									books,
								};
							}
						},
					},
					// --------------------------------------
					characters: {
						keyArgs: false,
						merge(existing = {}, incoming, { args }) {
							const page = args && args['page'];

							let results = [];

							if (existing && existing.results) {
								results = results.concat(existing.results);
							}

							if (incoming && incoming.results) {
								results = results.concat(incoming.results);
							}
							return {
								...incoming,
								results,
							};
						},
					},
				},
			},
		},
	});

	if (!ssrMode) {
		cache = cache.restore(window.__APOLLO_STATE__);
	}

	return new ApolloClient({
		link,
		cache,
		ssrMode,
		//	queryDeduplication: true, // default
		//	defaultOptions: {
		//		watchQuery: {
		//			// fetchPolicy: 'cache-and-network',
		//			errorPolicy: 'all',
		//		},
		//		query: {
		//			// fetchPolicy: 'cache-and-network',
		//			errorPolicy: 'all',
		//		},
		//		mutate: {
		//			errorPolicy: 'all',
		//		},
		//	},
	});
}
