/************************* Lib Files *************************/
import Api from '../../../src/lib/api';
export const SDG_LIST = {
	start: 'fetch_start/sdg_list',
	end: 'fetch_end/sdg_list',
	success: 'fetch_success/sdg_list',
	failed: 'fetch_failed/sdg_list',
	updateList: 'update_list/sdg_list'
};
export const sdgListFetchStart = () => ({
	type: SDG_LIST.start
});

export const sdgListFetchEnd = () => ({
	type: SDG_LIST.end
});

export const sdgListFetchSuccess = (data) => (
	{
		type: SDG_LIST.success,
		data
	});

export const sdgListFetchFailed = (data) => ({
	type: SDG_LIST.failed,
	data
});

export const updateSdgList = (data) => (
	{
		type: SDG_LIST.updateList,
		data
	});

const parseSdgData = (dataArray) => {
	dataArray.forEach((item) => {
		item.value = item.code;
		item.label = item.name;
	});
};

export const fetchMasterSdgList = (year) => (dispatch) => {
	return Api.get(Api.API_SDGS+`?year=${year}`).then(resp => {
		if (resp) {
			dispatch(sdgListFetchEnd());
			parseSdgData(resp);
			dispatch(updateSdgList(resp));
		}
	});
};


export const fetchSdgData = (unit, donor, year) => (dispatch, getState) => {
	dispatch(sdgListFetchStart());
	unit=unit?unit:'';
	donor=donor?donor:'';
	const currentYear=year?year:'';
	return Api.get(Api.API_SDGS+`?operating_unit=${unit}&donor=${donor}&year=${currentYear}`).then(resp => {
		if (resp) {
			dispatch(sdgListFetchEnd());
			parseSdgData(resp);
			dispatch(sdgListFetchSuccess(resp));
		}
		else {
			dispatch(sdgListFetchEnd());
		}
	}).catch((exception) => {
		dispatch(sdgListFetchEnd());
		dispatch(sdgListFetchFailed());
	});
};
