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

import { Loading } from '../../components/Loading';
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

	const [readQueryGetGoogleBooks, setReadQueryGetGoogleBooks] = useState(null);

	const [lastOnCompleted, setLastOnCompleted] = useState(null);

	const onCompleted = (data) => {

		console.log('>>>>>>>>>>>>>>>>>>>>>>>> RESTfulExample > QUERY > Completed ++++++++++++++++++++');

		setLastOnCompleted(currentSearchStringReactiveVar.currentSearchString)
		setQueryError(null)

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
			loading: googleBookLOADING, 
			error: googleBookERROR,
			data: googleBookDATA,
		}] = useLazyQuery(
			GET_GOOGLE_BOOK,
	);

	useEffect(() => {
			if (readQueryGetGoogleBooks) {
				getGoogleBooks({ variables: { searchString: currentSearchStringReactiveVar.currentSearchStringCopy },});
			}
		},
		[readQueryGetGoogleBooks]
	);

	useEffect(() => {
			setReadQueryGetGoogleBooks(client.readQuery({ query: GET_GOOGLE_BOOKS, }))
		},
		[]
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
			if (googleBooksLOADING) {
				setQueryError(null)
			}
		},
		[googleBooksLOADING]
	);

	useEffect(() => {
			if (googleBooksERROR) {
				const c = currentSearchStringReactiveVar.currentSearchStringCopy;
				setGoogleBooksCurrentSearchStringVar({currentSearchString: '', currentSearchStringCopy: c})
				// setQueryError(googleBooksERROR.message)
				setQueryError('NetworkError when attempting to fetch resource.')
			}
		},
		[googleBooksERROR]
	);

	useEffect(() => {
			if (googleBooksFetchMoreError) {
				setQueryError('NetworkError when attempting to fetch more resources.');
			}
		},
		[googleBooksFetchMoreError]
	);

	function setQueryVars(searchVar) {
		setGoogleBooksCurrentSearchStringVar({currentSearchString: searchVar, currentSearchStringCopy: searchVar})
	}

	return (
		<>
			<Helmet title="REST Example" />

			<div className="container">

				<h1 className="mt-4 mb-3">REST Example</h1>

				<div className="bg-color-ivory container-padding-border-radius-1 overflow-wrap-break-word mb-5">
					<div className="mb-3">

						<div className="mb-3">
							<h5>getGoogleBooks Data:</h5>
						</div>

						{googleBooksLOADING &&
							<div className="bg-progress-blue container-padding-radius-10 text-color-white overflow-wrap-break-word mb-3">
								<Loading text="Loading" />
							</div>
						}

						{queryError &&
							<div className="bg-warn-red container-padding-radius-10 text-color-white overflow-wrap-break-word mb-3">
								{queryError}
							</div>
						}

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
							onClick={
								() => {
									setQueryError(null);
									setQueryVars(googleBooksSearchInput);
								}
							}
							buttonText="Get Google Books"
						/>
					</div>

					{(googleBooksDATA && googleBooksDATA.googleBooks.cursor && lastOnCompleted) && (
						<div className="mb-3">
							<Button
								type="button"
								className="btn-primary btn-md"
								onClick={ async () => {
									await fetchMore({
										variables: {
											searchString: lastOnCompleted,
											after: currentGoogleBooksCursor,
										},
									});
								}}
								buttonText={`Fetch more ${lastOnCompleted} books`}
							/>
						</div>
					)}

				</div>
			</div>
		</>
	);
};

export default RESTfulExample;
