export const YEAR_SELECTION = {
	start: 'fetch_start/year_selection',
	end: 'fetch_end/year_selection',
	success: 'fetch_success/year_selection',
	failed: 'fetch_failed/year_selection',
};
// On Project Select
export const yearSelectionFetchStart = () => ({
	type: YEAR_SELECTION.start
});

export const yearSelectionFetchEnd = () => ({
	type: YEAR_SELECTION.end
});

export const yearSelectionFetchSuccess = (year) => (
	{
		type: YEAR_SELECTION.success,
		year
	});

export const yearSelectionFetchFailed = (error) => ({
	type: YEAR_SELECTION.failed,
	error
});