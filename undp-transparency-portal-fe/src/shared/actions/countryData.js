import Api from '../../lib/api';
export const COUNTRY_DATA = {
	start: 'fetch_start/global_data',
	end: 'fetch_end/global_data',
	success: 'fetch_success/global_data',
	failed: 'fetch_failed/global_data',
	update: 'update/country_data'
};

//////////////////////////////////GLOBAL DATA ///////////////////////////////
export const globalDataFetchStart = () => ({
	type: COUNTRY_DATA.start
});

export const globalDataFetchEnd = () => ({
	type: COUNTRY_DATA.end
});

export const globalDataFetchSuccess = (data) => (
	{
		type: COUNTRY_DATA.success,
		data
	});

export const globalDataFetchFailed = (error) => ({
	type: COUNTRY_DATA.failed,
	error
});

export const countryDataUpdate = (data) => (
	{
		type: COUNTRY_DATA.update,
		data
	});

export const fetchGlobalData = (year) => (dispatch) => {
	dispatch(globalDataFetchStart());
	if (year !== null)
		return Api.get(Api.API_PROJECT_AGGREGATE + year).then(resp => {
			if (resp.success && resp.data) {
				dispatch(globalDataFetchEnd());
				let data = {
					country_name: 'Global',
					total_budget: resp.data.budget,
					total_expense: resp.data.expense,
					project_count: resp.data.projects,
					donor_count: resp.data.donors
				};
				dispatch(globalDataFetchSuccess(data));
			}
			else {
				dispatch(globalDataFetchEnd());
			}
		}).catch((exception) => {
			dispatch(globalDataFetchEnd());
			dispatch(globalDataFetchFailed());
		});
};

export const updateCountryData = (data, year) => (dispatch) => {
	dispatch(countryDataUpdate(data));
};

//////////////////////////////////////// COUNTRY DATA /////////////////////////////////////////
export const RECIPIENT_COUNTRY_DATA = {
	start: 'fetch_start/recipient_country_data',
	end: 'fetch_end/recipient_country_data',
	success: 'fetch_success/recipient_country_data',
	failed: 'fetch_failed/recipient_country_data'
};

export const recipientCountryDataFetchStart = () => ({
	type: RECIPIENT_COUNTRY_DATA.start
});

export const recipientCountryDataFetchEnd = () => ({
	type: RECIPIENT_COUNTRY_DATA.end
});

export const recipientCountryDataFetchSuccess = (data) => (
	{
		type: RECIPIENT_COUNTRY_DATA.success,
		data
	});

export const recipientCountryDataFetchFailed = (error) => ({
	type: RECIPIENT_COUNTRY_DATA.failed,
	error
});

export const fetchRecipientCountry = (countryName, code, year, iso2code, type) => (dispatch) => {
	dispatch(recipientCountryDataFetchStart());
	if (year !== null)
		return Api.get(Api.API_RECIPIENT_COUNTRY_BASIC(code, year) ).then(resp => {
			if (resp.success && resp.data) {
				iso2code = iso2code===''||iso2code===null?code:iso2code;
				dispatch(recipientCountryDataFetchEnd());
				let data = {
					country_name: countryName,
					total_budget: resp.data.budget,
					total_expense: resp.data.expense,
					project_count: resp.data.projects_count,
					country_iso3: code,
					country_iso2: iso2code,
					type,
					donor_count: resp.data.budget_sources
				};
				dispatch(recipientCountryDataFetchSuccess(data));
			}
			else {
				dispatch(recipientCountryDataFetchEnd());
			}
		}).catch((exception) => {
			dispatch(recipientCountryDataFetchEnd());
			dispatch(recipientCountryDataFetchFailed());
		});
};
