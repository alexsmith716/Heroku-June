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
import { GET_GOOGLE_BOOKS, GET_GOOGLE_BOOK, } from '../../graphql/queries/queries.js';
import { reactiveVariableMutations } from '../../graphql/operations/mutations';
import { googleBooksCurrentSearchStringVar } from '../../apollo/apolloClient';

const RESTfulExample = () => {

	const client = useApolloClient();
	const [clientExtract, setClientExtract] = useState(null);
	const [toggleCacheView, setToggleCacheView] = useState(false);

	const { setGoogleBooksCurrentSearchStringVar } = reactiveVariableMutations;
	const [googleBooksSearchInput, setGoogleBooksSearchInput] = useState('');
	const [googleBookSearchInput, setGoogleBookSearchInput] = useState('');
	const [componentDidMount, setComponentDidMount] = useState(false);
	const [queryError, setQueryError] = useState(null);

	const currentSearchStringReactiveVar = useReactiveVar(googleBooksCurrentSearchStringVar);

	const onCompleted = () => {
		console.log('>>>>>>>>>>>>>>>>>>>>>>>> RESTfulExample > QUERY > Completed ++++++++++++++++++++');
	};

	// i've completely re-coded all the apollo query & refetch logic (next push) -no more reactiveVars!

	const [getGoogleBooks, {
			loading: googleBooksLOADING,
			error: googleBooksERROR,
			data: googleBooksDATA,
			previousData: googleBooksPREVIOUSDATA,
			refetch: googleBooksREFETCH,
			fetchMore: googleBooksFETCHMORE,
			networkStatus,
			called,
		}] = useLazyQuery(
			GET_GOOGLE_BOOKS,
			{
				variables: {
					orderBy: 'newest',
				},
				notifyOnNetworkStatusChange: true,
				onCompleted,
			}
	);

	// will be using data-normalization for the "getGoogleBook" modal view
	// https://github.com/apollographql/apollo-client/blob/main/docs/source/caching/cache-configuration.mdx#data-normalization
	const [getGoogleBook, {
			loading: googleBookLOADING, 
			error: googleBookERROR,
			data: googleBookDATA,
		}] = useLazyQuery(
			GET_GOOGLE_BOOK,
	);

	useEffect(() => {
			if (!componentDidMount) {
				setComponentDidMount(true);
			}

			if (componentDidMount) {
				console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ComponentDidMount >>>>>>>>>>>>>>>>>>>>');
			}
		},
		[componentDidMount,]
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
			setQueryError(googleBooksERROR)
		},
		[googleBooksERROR]
	);

	useEffect(() => {
			setQueryError(googleBookERROR);
		},
		[googleBookERROR]
	);

	return (
		<>
			<Helmet title="REST Example" />

			{/* ---------------------------------------------- */}

			<div className="container">
				{/* ---------------------------------------------- */}

				<h1 className="mt-4 mb-3">REST Example</h1>

				{/* ---------------------------------------------- */}

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

						{googleBookLOADING &&
							<div className="bg-progress-blue container-padding-radius-10 text-color-white overflow-wrap-break-word mb-3">
								<Loading text="Loading" />
							</div>
						}

						{queryError &&
							<div className="bg-warn-red container-padding-radius-10 text-color-white overflow-wrap-break-word mb-3">
								{queryError.message}
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

						{googleBookDATA && googleBookDATA.googleBook && (
							<div>
								<div className="mb-3">
									<h5>getGoogleBook Data:</h5>
								</div>
									<div key={googleBookDATA.googleBook.id} className="mb-3 container-padding-border-radius-2">
										<GoogleBookBook book={ googleBookDATA.googleBook } />
									</div>
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
							onClick={() => setGoogleBooksCurrentSearchStringVar({currentSearchString: 'nonfiction'})}
							buttonText="Search nonfiction books"
						/>
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => setGoogleBooksCurrentSearchStringVar({currentSearchString: 'cooking'})}
							buttonText="Search cooking books"
						/>
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => setGoogleBooksCurrentSearchStringVar({currentSearchString: 'programming'})}
							buttonText="Search programming books"
						/>
					</div>

					<div className="mb-3">
						<div className="row-flex">
							<div className="col-four">
								<input
									type="text"
									className="form-control"
									name="googleBookSearchInput"
									value={googleBookSearchInput}
									onChange={e => setGoogleBookSearchInput(e.target.value)}
									placeholder="Enter volume ID"
								/>
							</div>
						</div>
					</div>

					<div className="mb-3">
						<Button
							type="button"
							className="btn-success btn-md"
							onClick={() => getGoogleBook()}
							onClick={ () => getGoogleBook({ variables: { id: googleBookSearchInput }}) }
							buttonText="Get Google Book by volume ID"
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

					{googleBooksDATA && (
						<div className="mb-3">
							<Button
								type="button"
								className="btn-primary btn-md"
								onClick={ async () => {
									await googleBooksFETCHMORE({
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
