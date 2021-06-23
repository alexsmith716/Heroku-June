import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
	useQuery,
	useLazyQuery,
	useApolloClient,
	NetworkStatus,
	useReactiveVar,
	gql,
} from '@apollo/client';

import Button from '../../components/Button';
import { GoogleBookBook, } from '../../components/GoogleBookBook';
import { GET_GOOGLE_BOOKS, GET_GOOGLE_BOOK, GET_GOOGLE_BOOKS_CURRENT_SEARCH_STRING } from '../../graphql/queries/queries.js';
import { reactiveVariableMutations } from '../../graphql/operations/mutations';
import { googleBooksCurrentSearchStringVar } from '../../apollo/apolloClient';

const RESTfulExample = () => {

	const client = useApolloClient();
	const [clientExtract, setClientExtract] = useState(null);
	const [toggleCacheView, setToggleCacheView] = useState(false);

	const [currentGoogleBooksCursor, setCurrentGoogleBooksCursor] = useState('');
	const [googleBooksFetchMoreError, setGoogleBooksFetchMoreError] = useState(false);
	const [queryError, setQueryError] = useState(null);

	const { setGoogleBooksCurrentSearchStringVar } = reactiveVariableMutations;
	const [googleBooksSearchInput, setGoogleBooksSearchInput] = useState('');
	const [componentDidMount, setComponentDidMount] = useState(false);
	const currentSearchStringReactiveVar = useReactiveVar(googleBooksCurrentSearchStringVar);

	const onCompleted = (data) => {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>> RESTfulExample > QUERY > Completed ++++++++++++++++++++');
		if (data.googleBooks.cursor === currentGoogleBooksCursor) {
			setGoogleBooksFetchMoreError(true);
		}
		if (data.googleBooks.cursor !== currentGoogleBooksCursor) {
			setGoogleBooksFetchMoreError(false);
		}
		setCurrentGoogleBooksCursor(data.googleBooks.cursor)
	};

	const onError = (error) => {
		console.log('>>>>>>>>>>>>>>>>>>>>>>>> RESTfulExample > QUERY > Error ++++++++++++++++++++');
	}

	// The updateQuery callback for fetchMore is deprecated
	// convert updateQuery functions to field policies with appropriate read and merge functions, 
	//  or use/adapt a helper function (such as concatPagination, offsetLimitPagination, 
	//  or relayStylePagination) from @apollo/client/utilities.

	// errorPolicy: default: none

	//	# none:   If the response includes GraphQL errors, they are returned on "error.graphQLErrors" and the response data is set to undefined 
	//		even if the server returns data in its response. This means network errors and GraphQL errors result in a similar response shape.
	//		This is the default error policy.
	
	//	# ignore: graphQLErrors are ignored ("error.graphQLErrors is not populated"), and any returned data is cached and rendered as if no errors occurred.
	
	//	# all: 	 Both data and error.graphQLErrors are populated, enabling you to render both partial results and error information.

	// cache-first  cache-only cache-and-network
	// network-only no-cache   standby

	const [getGoogleBooks, {
			loading: googleBooksLOADING,
			error: googleBooksERROR,
			data: googleBooksDATA,
			previousData: googleBooksPreviousData,
			refetch: googleBooksREFETCH,
			fetchMore,
			networkStatus,
			called,
		}] = useLazyQuery(
			GET_GOOGLE_BOOKS,
			{
				fetchPolicy: 'cache-first',
				// nextFetchPolicy: 'cache-only',
				errorPolicy: 'none',
				variables: {
					orderBy: 'newest',
				},
				notifyOnNetworkStatusChange: true,
				onCompleted,
				onError,
			}
	);

	const [getGoogleBook, {
			loading: googleBookLoading, 
			error: googleBookError,
			data: googleBookDATA,
		}] = useLazyQuery(
			GET_GOOGLE_BOOK,
	);

	useEffect(() => {
			if (currentSearchStringReactiveVar) {
				const currentSearchStringVar = currentSearchStringReactiveVar.currentSearchString;

				if (currentSearchStringVar !== '') {
					if (!googleBooksDATA) {
						getGoogleBooks({ variables: { searchString: currentSearchStringVar },});
					}

					if (googleBooksDATA) {
						googleBooksREFETCH({ searchString: currentSearchStringVar });
					}
				}
			}
		},
		[currentSearchStringReactiveVar,]
	);

	useEffect(() => {
			if (toggleCacheView) {
				setClientExtract(client.extract());
			}
		},
		[toggleCacheView, googleBooksDATA]
	);

	useEffect(() => {
			if (googleBooksERROR) {
				// setQueryError(googleBooksERROR.message)
				setQueryError('googleBooksERROR Occurred!')
			}
		},
		[googleBooksERROR]
	);

	useEffect(() => {
			if (googleBooksFetchMoreError) {
				setQueryError('googleBooksFetchMoreError Occurred!');
			}
		},
		[googleBooksFetchMoreError]
	);

	return (
		<>
			<Helmet title="REST Example" />

			<div className="container">

				<h1 className="mt-4 mb-3">REST Example</h1>

				<div className="bg-color-ivory container-padding-border-radius-1 text-break mb-5">
					<div className="mb-3">

						<div className="mb-3">
							<h5>getGoogleBooks Data:</h5>
						</div>

						{networkStatus === NetworkStatus.refetch && (
							<p>
								Refetching...
							</p>
						)}

						{googleBooksLOADING && (
							<p>
								Loading...
							</p>
						)}

						{queryError && (
							<b>
								{queryError}
							</b>
						)}

						{googleBooksDATA && (
							<div>
								{googleBooksDATA.googleBooks.books.map((book, index) => (
									<div key={index} className="mb-3 container-padding-border-radius-2">
										<GoogleBookBook book={ book } />
									</div>
								))}
							</div>
						)}

						{clientExtract && (
							<div className={!toggleCacheView ? 'text-overflow-ellipsis-one' : ''}>
								<h5>ApolloClient Cache:</h5>
								<div>{JSON.stringify(clientExtract)}</div>
							</div>
						)}
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => setToggleCacheView(!toggleCacheView)}
							buttonText={!clientExtract ? "View Apollo Cache" : "Toggle Cache View"}
						/>
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => googleBooksREFETCH()}
							buttonText="googleBooks REFETCH"
						/>
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => {console.log(googleBooksCurrentSearchStringVar())} }
							buttonText="Reade RV"
						/>
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => {console.log('>>>>> RESTfulExample > RENDER > client.extract(): ', client.extract())} }
							buttonText="Cache client.extract"
						/>
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => {console.log('>>>>> RESTfulExample > RENDER > client.readQuery(): ', client.readQuery({ query: GET_GOOGLE_BOOKS, })) }}
							buttonText="Cache client.readQuery"
						/>
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => {console.log('>>>>> RESTfulExample > RENDER > googleBooksERROR: ', error)} }
							buttonText="Read googleBooksERROR"
						/>
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => {console.log('>>>>> RESTfulExample > RENDER > googleBooksDATA: ', googleBooksDATA)} }
							buttonText="Read googleBooksDATA"
						/>
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => setGoogleBooksCurrentSearchStringVar({currentSearchString: 'nonfiction'})}
							buttonText="nonfiction"
						/>
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => setGoogleBooksCurrentSearchStringVar({currentSearchString: 'cooking'})}
							buttonText="cooking"
						/>
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => setGoogleBooksCurrentSearchStringVar({currentSearchString: 'programming'})}
							buttonText="programming"
						/>
					</div>

					<div className="mb-3">
						<div className="row-flex">
							<div className="col-four">
								<input
									type="text"
									className="form-control"
									name="googleBooksSearchInput"
									value={googleBooksSearchInput}
									onChange={e => setGoogleBooksSearchInput(e.target.value)}
									placeholder="Search Google Books"
								/>
							</div>
						</div>
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => setGoogleBooksCurrentSearchStringVar({currentSearchString: googleBooksSearchInput})}
							buttonText="Get Google Books"
						/>
					</div>

					{(googleBooksDATA && googleBooksDATA.googleBooks.cursor) && (
						<div className="mb-3">
							<Button
								type="button"
								className="btn-primary btn-md"
								onClick={ async () => {
									await fetchMore({
										variables: {
											after: googleBooksDATA.googleBooks.cursor,
										},
									});
								}}
								buttonText="fetchMore Google Books"
							/>
						</div>
					)}

				</div>
			</div>
		</>
	);
};

export default RESTfulExample;
