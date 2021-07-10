import papa from 'papaparse';

let responseSLCSP = null;
let responsePLANS = null;
let responseZIPS = null;

function filterRow(row) {
	return row.metal_level === 'Silver';
}

function filterData(data) {
	return data.filter(filterRow);
}

function fetchCSVs() {
	return fetch('https://sleepy-wave-92667.herokuapp.com/plans.csv')
		.then((res) => res.text())
		.then((textPlans) => {
			papa.parse(textPlans, {
				delimiter: ',',
				header: true,
				complete: (res) => {
					const filterPlans = filterData(res.data);
					responsePLANS = filterPlans;
				},
			});
			return fetch('https://sleepy-wave-92667.herokuapp.com/zips.csv');
		})
		.then((res) => res.text())
		.then((textZips) => {
			papa.parse(textZips, {
				delimiter: ',',
				header: true,
				complete: (res) => (responseZIPS = res.data),
			});
			return fetch('https://sleepy-wave-92667.herokuapp.com/slcsp.csv');
		})
		.then((res) => res.text())
		.then((textSlcsp) => {
			papa.parse(textSlcsp, {
				delimiter: ',',
				header: true,
				complete: (res) => (responseSLCSP = res.data),
			});
			return responseSLCSP;
		})
		.catch((error) => {
			return responseSLCSP;
		});
}

export async function calcCSV() {
	const response = await fetchCSVs();

	if (!responseSLCSP) {
		return new Promise((resolve, reject) =>
			reject({ data: responseSLCSP, message: 'Error fetching data' }),
		);
	}

	// remove all empty rows in 'slcsp.csv'
	const responsedSLCSP = response.filter((slcsp) => !isNaN(parseInt(slcsp.zipcode)));

	// for each zip in 'slcsp.csv', apply function calculateSLCSP()
	responsedSLCSP.forEach(calculateSLCSP);

	function calculateSLCSP(value, index, array) {
		// grab all 'zips.csv' objects matching the 'slcsp.csv' zip
		const matchingZipObjectsArray = responseZIPS.filter((zip) => {
			return zip.zipcode === value.zipcode;
		});

		// create array of all rate_area's to evaluate more than one rate area
		const rateAreasArray = matchingZipObjectsArray.map((rate) => rate.rate_area);

		// A ZIP code can also be in more than one rate area
		// data structure Set() will indicate which zip spans multiple rate areas
		const rateAreasDuplicatesArray = [...new Set(rateAreasArray)];

		//  In that case (rateAreasDuplicatesArray.length > 1), the answer is ambiguous and should be left blank
		if (rateAreasDuplicatesArray.length === 1) {
			const filteredStateRatePlansArray = responsePLANS.filter(calculateSilverStateRateAreas);

			function calculateSilverStateRateAreas(value, index) {
				return (
					value.state === matchingZipObjectsArray[0].state &&
					value.rate_area === matchingZipObjectsArray[0].rate_area
				);
			}

			// evaluate slcsp if more than on silver plan available
			if (filteredStateRatePlansArray.length > 2) {
				filteredStateRatePlansArray.sort((a, b) => a.rate - b.rate);
				const jp = JSON.parse(filteredStateRatePlansArray[1].rate);
				const tf = jp.toFixed(2);
				value.rate = tf;
			}
		}
	}
	const calculatedSLCSP = papa.unparse(responsedSLCSP);
	return new Promise((resolve) => resolve({ data: calculatedSLCSP, message: 'Success fetching data' }));
}
