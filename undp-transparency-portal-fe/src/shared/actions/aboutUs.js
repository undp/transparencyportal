/************************* Lib Files ************************/
import Api from '../../lib/api';
export const ABOUT_US = {
	start: 'fetch_start/about_us',
	end: 'fetch_end/about_us',
	success: 'fetch_success/about_us',
	failed: 'fetch_failed/about_us'
};

export const aboutUsFetchStart = () => ({
	type: ABOUT_US.start
});

export const aboutUsFetchEnd = () => ({
	type: ABOUT_US.end
});

export const aboutUsFetchSuccess = (content) => (
	{
		type: ABOUT_US.success,
		content
	});

export const aboutUsFetchFailed = (error) => ({
	type: ABOUT_US.failed,
	error
});
export const fetchaboutUsContent = () => (dispatch) => {
	dispatch(aboutUsFetchStart());
	return Api.get(Api.API_ABOUT).then(resp => {
		if (resp.success) {
			dispatch(aboutUsFetchEnd());
			dispatch(aboutUsFetchSuccess(resp.data.data));
		}
		else {
			dispatch(aboutUsFetchEnd());
		}
	}).catch((exception) => {
		dispatch(aboutUsFetchEnd());
		dispatch(aboutUsFetchFailed(exception));
	});
};