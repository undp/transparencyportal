/////////////////////// Fetch Project Output Details //////////////////////////
import Api from '../../../lib/api';


export const MARKER_DETAIL = {
	start: 'fetch_start/marker_detail',
	end: 'fetch_end/marker_detail',
	success: 'fetch_success/marker_detail',
	failed: 'fetch_failed/marker_detail'
};
export const markerDetailFetchStart = () => ({
	type: MARKER_DETAIL.start
});

export const markerDetailFetchEnd = () => ({
	type: MARKER_DETAIL.end
});

export const markerDetailFetchSuccess = (data, index) => (
	{
		type: MARKER_DETAIL.success,
		data,
		index
	});

export const markerDetailFetchFailed = (error) => ({
	type: MARKER_DETAIL.failed,
	error
});

export const fetchmarkerDetail = (id, index) => (dispatch, getState) => {
	dispatch(markerDetailFetchStart());
	return Api.get(Api.API_MARKER_DETAIL(id)).then(resp => {
		if (resp.data && resp.success) {
			dispatch(markerDetailFetchEnd());
			dispatch(markerDetailFetchSuccess(resp.data, index));
		}
		else {
			dispatch(markerDetailFetchEnd());
		}
	}).catch((exception) => {
		dispatch(markerDetailFetchEnd());
		dispatch(markerDetailFetchFailed());
	});
}; 