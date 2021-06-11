import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { useSelector, useDispatch } from 'react-redux';
import { loadAboutCSV } from '../../redux/modules/aboutCSV';
import { State as AboutCSVState } from '../../redux/modules/aboutCSV';
import { Loading } from '../../components/Loading';

import * as Styles from './styles';

const AboutCSV = () => {

	const dispatch = useDispatch();

	const loading = useSelector((state) => state.aboutCSV.loading);
	const error = useSelector((state) => state.aboutCSV.error);
	const errorResponse = useSelector((state) => state.aboutCSV.errorResponse);
	const data = useSelector((state) => state.aboutCSV.data);
	const [dispatchError, setDispatchError] = useState(null);

	//	const doLoadAboutCSV = async () => {
	//		try {
	//			await dispatch(loadAboutCSV());
	//		} catch (err) {
	//			setDispatchError(err);
	//			throw new Error("Error fetching data");
	//		}
	//	};

	const doLoadAboutCSV = () => {
		dispatch(loadAboutCSV())
			.catch(error => {
				setDispatchError(err);
				throw new Error("Error fetching data");
			})
	};

	useEffect(() => {
			if (!data) {
				doLoadAboutCSV()
			}
		},
		[data]
	);

	return (
		<>
			<Helmet title="About CSV" />

			{/* ---------------------------------------------- */}

			<div className="container">
				{/* ---------------------------------------------- */}

				<h1 className="mt-4 mb-3">
					AboutCSV
				</h1>

				<h2 className="mb-3">
					Calculate the second lowest cost silver plan
				</h2>

				<h3 className="mb-3">
					Determine the second lowest cost silver plan (SLCSP) for a group of ZIP codes.
				</h3>

				<div className="mb-3">
					<p>
						CSV file "slcsp.csv" contains ZIP codes in the first column. Fill in the second column with the rate of the corresponding SLCSP and emit the rate as a CSV.
					</p>
					<p>
						The order of the rows as emitted stay the same as how they appeared in the original "slcsp.csv". The first row is the column headers: "zipcode,rate" The remaining lines output unquoted values with two digits after the decimal place of the rates, for example: "64148,245.20".
					</p>
					<p>
						It may not be possible to determine a SLCSP for every ZIP code given; for example, if there is only one silver plan available, there is no _second_ lowest cost plan. Where a definitive rate cannot be found, those cells are left blank in the output CSV (no quotes or zeroes or other text). For example, "40813,".
					</p>
					<p>
						A ZIP code can be in more than one rate area. In that case, the SLCSP is ambiguous and the second column is left blank.
					</p>
				</div>

				{/* ---------------------------------------------- */}

				<div className="bg-color-ivory container-padding-border-radius-1 word-break-all mb-5">

					{loading && <Loading text="Loading" />}

					{/* (>>>>>>>>>>>>>>>>>>>>>> ERROR >>>>>>>>>>>>>>>>>>>>>>>>) */}
					{error && (
						<div>
							<div>{`${errorResponse.error.message}`}</div>
						</div>
					)}

					{/* (>>>>>>>>>>>>>>>>>>>>>>>> LOADED >>>>>>>>>>>>>>>>>>>>>>>>) */}
					{(!loading && !error) && (
						<div>
							<div>
								<pre>{data && data.result.data}</pre>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default AboutCSV;
