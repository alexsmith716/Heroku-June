import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import papa from 'papaparse';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';

import { Loading } from '../../components/Loading';

// also, modify this for redux state and consolidate all CSV loading to a single utility
// and, see what i can do modifying and displaying CSV data as table or whatever

// BORO,     FEATURE CARRIED, Current Rating*, Verbal Rating, REPLACEMENT COST
// Bourough,     Bridge,      Current Rating,  Verbal Rating, Replacement Cost

const NYCBridgeRatings = () => {

	const [clientResponse, setClientResponse] = useState(null);
	const [unparsedResponse, setUnparsedResponse] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	const region = 'us-east-1';

	// create an AWS S3 service object
	// generate temporary AWS credentials -authenticate user
	// obtain AWS credentials via client `CognitoIdentityClient`
	// method `fromCognitoIdentityPool` contains the defined IAM roles
	const s3Client = new S3Client({
		region,
		credentials: fromCognitoIdentityPool({
			client: new CognitoIdentityClient({ region }),
			identityPoolId: 'us-east-1:6c3faebd-a86c-4f34-8463-ab623897f206',
		}),
	});

	// GET object `Bridge_Ratings.csv` from AWS S3
	// pass required `Bucket`, `Key` parameters to `GetObjectCommand` method
	const getBridgeRatings = new GetObjectCommand({ Bucket: 'bucket-csv-6-29-21', Key: 'Bridge_Ratings.csv' });

	// convert ReadableStream to a string
	function streamToString(stream) {
		return new Promise((resolve, reject) => {
			if (stream instanceof ReadableStream === false) {
				reject('Error: Stream is not instance of ReadableStream.');
			}
			let text = '';
			const decoder = new TextDecoder('utf-8');
			const reader = stream.getReader();

			const processRead = ({ done, value }) => {
				if (done) {
					resolve(text);
					return;
				}
				text += decoder.decode(value);
				reader.read().then(processRead);
			};

			reader.read().then(processRead);
		});
	};

	useEffect(async () => {
			if (clientResponse) {
				try {
					const responseString = await streamToString(clientResponse.Body);
					papa.parse(responseString, {
						header: true,
						complete: (res) => {
							const p = papa.unparse(res.data);
							setLoading(false);
							setUnparsedResponse(p);
						}
					});
				} catch (error) {
					console.error(error);
					setLoading(false);
					setError(error);
				}
			}
		},
		[clientResponse]
	);

	// AWS SDK recommends async/await for async service calls
	useEffect(async () => {
			try {
				const data = await s3Client.send(getBridgeRatings);
				setClientResponse(data)
			} catch (error) {
				console.error(error);
				setLoading(false);
				setError('NetworkError when attempting to fetch resource.');
			}
		},
		[]
	);

	return (
		<>
			<Helmet title="NYC Bridge Ratings" />

			{/* ---------------------------------------------- */}

			<div className="container">
				{/* ---------------------------------------------- */}

				<h1 className="mt-4 mb-3">
					NYC Bridge Ratings
				</h1>

				<h2 className="mb-3">
					Bridge Conditions, NYS Department of Transportation
				</h2>

				<h3 className="mb-3">
					Metadata Updated: November 12, 2020
				</h3>

				<div className="mb-3">
					<p>
						New York State inspectors assess all of the bridges every two years including a bridge's individual parts. Bridges are analyzed for their capacity to carry vehicular loads. Inspectors are required to evaluate, assign a condition score, and document the condition of up to 47 structural elements, including rating 25 components of each span of a bridge, in addition to general components common to all bridges. The NYSDOT condition rating scale ranges from 1 to 7, with 7 being in new condition and a rating of 5 or greater considered as good conditionBridges that cannot safely carry heavy vehicles, such as some tractor trailers, are posted with weight limits. Based upon inspection and load capacity analysis, any bridge deemed unsafe gets closed.
					</p>
				</div>

				{/* ---------------------------------------------- */}

				{loading &&
					<div className="bg-progress-blue container-padding-radius-10 text-color-white overflow-wrap-break-word mb-3">
						<Loading text="Loading" />
					</div>
				}

				{error &&
					<div className="bg-warn-red container-padding-radius-10 text-color-white overflow-wrap-break-word mb-3">
						{error}
					</div>
				}

				{unparsedResponse && (
					<div className="bg-color-ivory container-padding-border-radius-1 overflow-wrap-break-word mb-5">
						<div>{unparsedResponse}</div>
					</div>
				)}
			</div>
		</>
	);
};

export default NYCBridgeRatings;
