import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { useSelector, useDispatch } from 'react-redux';
import { loadNYCBridgeRatings } from '../../redux/modules/nycBridgeRatings';
import { Loading } from '../../components/Loading';

// also, modify this for redux state and consolidate all CSV loading to a single utility
// this will soon be displayed in a responsive grid table

const NYCBridgeRatings = () => {
	const dispatch = useDispatch();

	const loading = useSelector((state) => state.nycBridgeRatings.loading);
	const error = useSelector((state) => state.nycBridgeRatings.error);
	const errorResponse = useSelector((state) => state.nycBridgeRatings.errorResponse);
	const data = useSelector((state) => state.nycBridgeRatings.data);

	useEffect(() => {
		if (!data) {
			dispatch(loadNYCBridgeRatings()).catch((error) => {
				throw new Error('Error fetching data');
			});
		}
	}, [data, dispatch]);

	return (
		<>
			<Helmet title="NYC Bridge Ratings" />

			{/* ---------------------------------------------- */}

			<div className="container">
				{/* ---------------------------------------------- */}

				<h1 className="mt-4 mb-3">NYC Bridge Ratings</h1>

				<h2 className="mb-3">Bridge Conditions, NYS Department of Transportation</h2>

				<h3 className="mb-3">Metadata Updated: November 12, 2020</h3>

				<div className="mb-3">
					<p>
						New York State inspectors assess all of the bridges every two years including a
						bridge&apos;s individual parts. Bridges are analyzed for their capacity to carry
						vehicular loads. Inspectors are required to evaluate, assign a condition score, and
						document the condition of up to 47 structural es, including rating 25 components of
						each span of a bridge, in addition to general components common to all bridges. The
						NYSDOT condition rating scale ranges from 1 to 7, with 7 being in new condition and a
						rating of 5 or greater considered as good conditionBridges that cannot safely carry
						heavy vehicles, such as some tractor trailers, are posted with weight limits. Based
						upon inspection and load capacity analysis, any bridge deemed unsafe gets closed.
					</p>
				</div>

				<div className="overflow-wrap-break-word mb-3">
					{/* (>>>>>>>>>>>>>>>>>>>>>> LOADING >>>>>>>>>>>>>>>>>>>>>>>>) */}
					{loading && (
						<div className="bg-progress-blue container-padding-radius-10 text-color-white">
							<Loading text="Loading" />
						</div>
					)}

					{/* (>>>>>>>>>>>>>>>>>>>>>> ERROR >>>>>>>>>>>>>>>>>>>>>>>>) */}
					{error && (
						<div className="bg-warn-red container-padding-radius-10 text-color-white">
							{`${errorResponse.error.message}`}
						</div>
					)}

					{/* (>>>>>>>>>>>>>>>>>>>>>>>> LOADED >>>>>>>>>>>>>>>>>>>>>>>>) */}
					{data && (
						<div className="bg-color-ivory container-padding-border-radius-1">
							<pre>{data.result.data}</pre>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default NYCBridgeRatings;
