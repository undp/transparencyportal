export const MAP_YEAR_TIMELINE = {
	start: 'fetch_start/map_year_timeline',
	end: 'fetch_end/map_year_timeline',
	success: 'fetch_success/map_year_timeline',
	failed: 'fetch_failed/map_year_timeline',
	setYear: 'set_map_current_year'
};

export const yearListFetchStart = () => ({
	type: MAP_YEAR_TIMELINE.start
});

export const yearListFetchEnd = () => ({
	type: MAP_YEAR_TIMELINE.end
});

export const yearListFetchSuccess = (data) => (
	{
		type: MAP_YEAR_TIMELINE.success,
		data
	});

export const yearListFetchFailed = (error) => ({
	type: MAP_YEAR_TIMELINE.failed,
	error
});
export const updateCurrentYear = (year) => ({
	type: MAP_YEAR_TIMELINE.setYear,
	year
});

export const updateMapYearTimeline = (year) => (dispatch,getState) => {
	dispatch(yearListFetchStart());
	let yearList = [...getState().projectTimeline.year];
	dispatch(yearListFetchEnd());

	
	let currentYear = year?year:yearList[0];
	dispatch(yearListFetchSuccess(yearList.reverse()));
	dispatch(updateCurrentYear(currentYear));
};

export const setMapCurrentYear = (year) => (dispatch) => {
	dispatch(updateCurrentYear(year));
};