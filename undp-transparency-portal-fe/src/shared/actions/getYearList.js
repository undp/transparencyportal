export const YEAR_LIST = {
	start: 'fetch_start/year_list',
	end: 'fetch_end/year_list',
	success: 'fetch_success/year_list',
	failed: 'fetch_failed/year_list',
	setYear: 'set_current_year'
};
export const yearListFetchStart = () => ({
	type: YEAR_LIST.start
});

export const yearListFetchEnd = () => ({
	type: YEAR_LIST.end
});

export const yearListFetchSuccess = (data,parsedList) => (
	{
		type: YEAR_LIST.success,
		data,
		parsedList
	});

export const yearListFetchFailed = (error) => ({
	type: YEAR_LIST.failed,
	error
});
export const updateCurrentYear = (year) => ({
	type: YEAR_LIST.setYear,
	year
});

export const parseYearList = (yearList) => yearList.map((item) => ({
	label: item+'',
	value: item+''
}));


export const updateYearList = (year) => (dispatch, getState) => {
	dispatch(yearListFetchStart());
	let yearList = [...getState().projectTimeline.year];
	dispatch(yearListFetchEnd());
	const parsedList = parseYearList(yearList);
	dispatch(yearListFetchSuccess(yearList,parsedList));
	dispatch(updateCurrentYear(year ? year : yearList[0]));
};
export const setCurrentYear = (year) => (dispatch) => {
	dispatch(updateCurrentYear(year));
};