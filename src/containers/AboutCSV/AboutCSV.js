import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { useSelector, useDispatch } from 'react-redux';
import { loadAboutCSV } from '../../redux/modules/aboutCSV';
// import { State as AboutCSVState } from '../../redux/modules/aboutCSV';
import { Loading } from '../../components/Loading';

const AboutCSV = () => {
	const dispatch = useDispatch();

	const loading = useSelector((state) => state.aboutCSV.loading);
	const error = useSelector((state) => state.aboutCSV.error);
	const errorResponse = useSelector((state) => state.aboutCSV.errorResponse);
	const data = useSelector((state) => state.aboutCSV.data);

	//	const doLoadAboutCSV = async () => {
	//		try {
	//			await dispatch(loadAboutCSV());
	//		} catch (error) {
	//			setDispatchError(error);
	//			throw new Error("Error fetching data");
	//		}
	//	};

	useEffect(() => {
		if (!data) {
			dispatch(loadAboutCSV()).catch((error) => {
				throw new Error('Error fetching data');
			});
		}
	}, [data, dispatch]);

	return (
		<>
			<Helmet title="About CSV" />

			{/* ---------------------------------------------- */}

			<div className="container">
				{/* ---------------------------------------------- */}

				<h1 className="mt-4 mb-3">AboutCSV</h1>

				<h2 className="mb-3">Calculate the second lowest cost silver plan</h2>

				<h3 className="mb-3">
					Determine the second lowest cost silver plan (SLCSP) for a group of ZIP codes.
				</h3>

				<div className="mb-3">
					<p>
						CSV file &quot;slcsp.csv&quot; contains ZIP codes in the first column. Fill in the
						second column with the rate of the corresponding SLCSP and emit the rate as a CSV.
					</p>
					<p>
						The order of the rows as emitted stay the same as how they appeared in the original
						&quot;slcsp.csv&quot;. The first row is the column headers: &quot;zipcode,rate&quot;
						The remaining lines output unquoted values with two digits after the decimal place of
						the rates, for example: &quot;64148,245.20&quot;.
					</p>
					<p>
						It may not be possible to determine a SLCSP for every ZIP code given; for example, if
						there is only one silver plan available, there is no _second_ lowest cost plan. Where
						a definitive rate cannot be found, those cells are left blank in the output CSV (no
						quotes or zeroes or other text). For example, &quot;40813,&quot;.
					</p>
					<p>
						A ZIP code can be in more than one rate area. In that case, the SLCSP is ambiguous and
						the second column is left blank.
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

export default AboutCSV;
