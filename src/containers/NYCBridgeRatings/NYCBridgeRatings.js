import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import papa from 'papaparse';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Loading } from '../../components/Loading';

// S3 object on AWS, Heroku AWS config vars set and will be pushed tomorrow
// also, modify this for redux state and consolidate all CSV loading to a single utility
// and, see what i can do modifying and diplaying CSV data as table or whatever

// BORO,     FEATURE CARRIED, Current Rating*, Verbal Rating, REPLACEMENT COST
// Bourough,     Bridge,      Current Rating,  Verbal Rating, Replacement Cost

const NYCBridgeRatings = () => {

	const [clientResponse, setClientResponse] = useState('');
	const [unparsedResponse, setUnparsedResponse] = useState('');
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const client = new S3Client({
		credentials: {
			accessKeyId: config.aws.aws_access_key_id,
			secretAccessKey: config.aws.aws_secret_access_key,
		},
		region: config.aws.aws_region,
	});

	const getBridgeRatings = new GetObjectCommand({ Bucket: config.aws.aws_bucket, Key: 'Bridge_Ratings.csv' });

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
							setUnparsedResponse(p);
						}
					});
				} catch (error) {
					console.error(error);
					setError(error);
				}
			}
		},
		[clientResponse]
	);

	useEffect(() => {
			setLoading(true)
			client.send(getBridgeRatings)
				.then(res => setClientResponse(res))
				.catch(error => {
					setError(error);
					throw new Error("Error: Error fetching S3Client resource.");
				})
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

				{(loading && !error && unparsedResponse === '') &&
					<div className="bg-progress-blue container-padding-radius-10 text-color-white overflow-wrap-break-word mb-3">
						<Loading text="Loading" />
					</div>
				}

				{error &&
					<div className="bg-warn-red container-padding-radius-10 text-color-white overflow-wrap-break-word mb-3">
						{error}
					</div>
				}

				<div className="bg-color-ivory container-padding-border-radius-1 overflow-wrap-break-word mb-5">
					{unparsedResponse !== '' && (
						<div>{unparsedResponse}</div>
					)}
				</div>
			</div>
		</>
	);
};

export default NYCBridgeRatings;
