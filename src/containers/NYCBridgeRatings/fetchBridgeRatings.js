import papa from 'papaparse';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';

let responseDATA = { data: null, message: null };

const region = 'us-east-1';

const s3Client = new S3Client({
	region,
	credentials: fromCognitoIdentityPool({
		client: new CognitoIdentityClient({ region }),
		identityPoolId: 'us-east-1:6c3faebd-a86c-4f34-8463-ab623897f206',
	}),
});

const getBridgeRatings = new GetObjectCommand({
	Bucket: 'bucket-csv-6-29-21',
	Key: 'Bridge_Ratings.csv',
});

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
}

async function doStreamToString(body) {
	try {
		const responseString = await streamToString(body);
		let data;
		papa.parse(responseString, {
			header: true,
			complete: (res) => {
				data = res.data.map((e) => {
					if (e['BORO'] === 'B') {
						e['BORO'] = 'Bronx';
					}
					if (e['BORO'] === 'BM') {
						e['BORO'] = 'Bronx-Manhattan';
					}
					if (e['BORO'] === 'K') {
						e['BORO'] = 'Brooklyn';
					}
					if (e['BORO'] === 'KM') {
						e['BORO'] = 'Brooklyn-Manhattan';
					}
					if (e['BORO'] === 'KQ') {
						e['BORO'] = 'Brooklyn-Queens';
					}
					if (e['BORO'] === 'M') {
						e['BORO'] = 'Manhattan';
					}
					if (e['BORO'] === 'MQ') {
						e['BORO'] = 'Manhattan-Queens';
					}
					if (e['BORO'] === 'Q') {
						e['BORO'] = 'Queens';
					}
					if (e['BORO'] === 'R') {
						e['BORO'] = 'Staten Island';
					}
					return {
						Borough: e['BORO'],
						Bridge: e['FEATURE CARRIED'],
						CurrentRating: e['Current Rating*'],
						VerbalRating: e['Verbal Rating'],
						ReplacementCost: e['REPLACEMENT COST'],
					};
				});
			},
		});
		responseDATA.data = papa.unparse(data);
		return responseDATA;
	} catch (error) {
		console.error(error);
		responseDATA.message = error;
		return responseDATA;
	}
}

export async function fetchBridgeRatings() {
	try {
		const response = await s3Client.send(getBridgeRatings);

		await doStreamToString(response.Body);

		if (!responseDATA.data) {
			return new Promise((resolve, reject) => reject({ ...responseDATA }));
		}

		return new Promise((resolve) =>
			resolve({ data: responseDATA.data, message: 'Success fetching data' }),
		);
	} catch (error) {
		console.error(error);
		return new Promise((resolve, reject) =>
			reject({ data: null, message: 'NetworkError when attempting to fetch resource.' }),
		);
	}
}
