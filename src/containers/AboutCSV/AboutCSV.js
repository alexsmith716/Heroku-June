import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import papa from 'papaparse';
//	import { S3Client, GetObjectCommand, } from '@aws-sdk/client-s3'; // ListBucketsCommand, ListObjectsCommand
//	import { ReadableStream } from 'readable-stream';
//	import config from '../../../config.json';
import * as Styles from './styles';

	//	https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html
	//	https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/s3.html#getobject
	//	https://nodejs.org/api/stream.html
	//	https://nodejs.org/api/all.html#util_textdecoder_decode_input_options
	//	https://github.com/nodejs/readable-stream
	//	stream.Readable: node
	//	ReadableStream: browser

const AboutCSV = () => {

	const [responsePLANS, setResponsePLANS] = useState(null);
	const [responseZIPS, setResponseZIPS] = useState(null);
	const [responseSLCSP, setResponseSLCSP] = useState('');
	const [calculatedSLCSP, setCalculatedSLCSP] = useState('');

	//	const client = new S3Client({
	//		credentials: {
	//			accessKeyId: config.aws.aws_access_key_id,
	//			secretAccessKey: config.aws.aws_secret_access_key,
	//		},
	//		region: config.aws.aws_region,
	//	});

	//	const commandPlans = new GetObjectCommand({ Bucket: config.aws.aws_bucket, Key: 'plans.csv' });
	//	const commandZips = new GetObjectCommand({ Bucket: config.aws.aws_bucket, Key: 'zips.csv' });
	//	const commandSlcsp = new GetObjectCommand({ Bucket: config.aws.aws_bucket, Key: 'slcsp.csv' });

	//  function streamToString(stream) {
	//  	return new Promise((resolve, reject) => {
	//  		if (stream instanceof ReadableStream === false) {
	//  			reject('>>>>>>>>>> streamToString Promise rejected');
	//  		}

	//  		let text = '';
	//  		const decoder = new TextDecoder('utf-8');
	//  		const reader = stream.getReader();

	//  		const processRead = ({ done, value }) => {
	//  			if (done) {
	//  				console.log('>>>>>>>>>> streamToString > done');
	//  				resolve(text);
	//  				return;
	//  			}

	//  			// decodes the input (encoded data) and returns a string
	//  			text += decoder.decode(value);
	//  			reader.read().then(processRead);
	//  		};

	//  		reader.read().then(processRead);
	//  	});
	//  };

	function filterRow(row) {
		return row.metal_level === 'Silver';
	}

	function filterData(data) {
		return data.filter(filterRow);
	}

	// =======================================================

	useEffect(() => {
			// below works requesting CSVs from AWS S3
			//	async function promiseAllReturnString(dataPlansBody, dataZipsBody, dataSlcspBody) {
			//	
			//		const [dataPlansString, dataZipsString, dataSlcspString] = await Promise.all([
			//			streamToString(dataPlansBody),
			//			streamToString(dataZipsBody),
			//			streamToString(dataSlcspBody),
			//		]);
			//	
			//		await papa.parse(dataPlansString, {
			//			delimiter: ',',
			//			header: true,
			//			complete: (res) => {
			//				const filterPlans = filterData(res.data);
			//				setResponsePLANS(filterPlans);
			//			}
			//		});
			//	
			//		await papa.parse(dataZipsString, { 
			//			delimiter: ',',
			//			header: true,
			//			complete: (res) => {
			//				setResponseZIPS(res.data);
			//			}
			//		});
			//	
			//		await papa.parse(dataSlcspString, { 
			//			delimiter: ',',
			//			header: true,
			//			complete: (res) => {
			//				setResponseSLCSP(res.data);
			//			}
			//		});
			//	}
			
			//	async function promiseAllClientSend() {
			//		const [dataPlans, dataZips, dataSlcsp] = await Promise.all([
			//			client.send(commandPlans),
			//			client.send(commandZips),
			//			client.send(commandSlcsp),
			//		]);
			//		promiseAllReturnString(dataPlans.Body, dataZips.Body, dataSlcsp.Body);
			//	}

			//	if (responseSLCSP === '') {
			//		promiseAllClientSend();
			//	}

			// =======================================================

			if (responseSLCSP === '') {
				fetch('/plans.csv')
					.then(res => {
						return res.text()
					})
					.then(textPlans  => {
						papa.parse(textPlans, {
							delimiter: ',',
							header: true,
							complete: (res) => {
								const filterPlans = filterData(res.data);
								setResponsePLANS(filterPlans);
							}
						});
						return fetch('/zips.csv')
					})
					.then(res => res.text())
					.then(textZips  => {
						papa.parse(textZips, { delimiter: ',', header: true, complete: (res) => setResponseZIPS(res.data) });
						return fetch('/slcsp.csv')
					})
					.then(res => res.text())
					.then(textSlcsp  => {
						papa.parse(textSlcsp, { delimiter: ',', header: true, complete: (res) => setResponseSLCSP(res.data) });
					})
					.catch(error => {
						console.error(error)
					})
			}
			//	=======================================================================
			if (responseSLCSP !== '') {
				// remove all empty rows in 'slcsp.csv'
				const responsedSLCSP = responseSLCSP.filter(slcsp => !isNaN(parseInt(slcsp.zipcode)));
			
				// for each zip in 'slcsp.csv', apply function calculateSLCSP()
				responsedSLCSP.forEach(calculateSLCSP);
			
				function calculateSLCSP(value, index, array) {
			
					// grab all 'zips.csv' objects matching the 'slcsp.csv' zip
					const matchingZipObjectsArray = responseZIPS.filter(zip => {
						return zip.zipcode === value.zipcode;
					});
			
					// create array of all rate_area's to evaluate more than one rate area
					const rateAreasArray = matchingZipObjectsArray.map(rate => rate.rate_area);
			
					// A ZIP code can also be in more than one rate area
					// data structure Set() will indicate which zip spans multiple rate areas
					const rateAreasDuplicatesArray = [...new Set(rateAreasArray)];
			
					//  In that case (rateAreasDuplicatesArray.length > 1), the answer is ambiguous and should be left blank
					if (rateAreasDuplicatesArray.length === 1) {
						const filteredStateRatePlansArray = responsePLANS.filter(calculateSilverStateRateAreas);
			
						function calculateSilverStateRateAreas(value, index) {
							return (value.state === matchingZipObjectsArray[0].state) && (value.rate_area === matchingZipObjectsArray[0].rate_area);
						}
			
						// evaluate slcsp if more than on silver plan available
						if (filteredStateRatePlansArray.length > 2) {
							filteredStateRatePlansArray.sort((a, b) => a.rate - b.rate);
							const jp = JSON.parse(filteredStateRatePlansArray[1].rate)
							const tf = jp.toFixed(2);
							value.rate = tf;
						}
					}
				}
				const calcSLCSP = papa.unparse(responsedSLCSP);
				console.log('-------------------')
				console.log(calcSLCSP);
				setCalculatedSLCSP(calcSLCSP);
			}

			//	if (responseSLCSP === '') {
			//		fetch('/calculatedSLCSP.csv')
			//			.then(res => res.text())
			//			.then(data  => {
			//				setResponseSLCSP(data)
			//			})
			//			.catch(error => {
			//				console.error(error)
			//			})
			//	}
		},
		[responseSLCSP,]
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

				<div className="bg-color-ivory container-padding-border-radius-1 text-break mb-5">

					{calculatedSLCSP !== '' && (
						<div>
							<div>
								<pre>{calculatedSLCSP}</pre>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default AboutCSV;
