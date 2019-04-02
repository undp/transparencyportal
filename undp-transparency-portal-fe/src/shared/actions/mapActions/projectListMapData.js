/************************* Lib Files ************************/
import Api from '../../../lib/api';

export const PROJECT_LIST_MAP_DATA = {
	start: 'fetch_start/project_list_map_data',
	end: 'fetch_end/project_list_map_data',
	success: 'fetch_success/project_list_map_data',
	failed: 'fetch_failed/project_list_map_data'
};

export const mapDataFetchStart = () => ({
	type: PROJECT_LIST_MAP_DATA.start
});

export const mapDataFetchEnd = () => ({
	type: PROJECT_LIST_MAP_DATA.end
});

export const mapDataFetchSuccess = (data,regionalCenter) => (
	{
		type: PROJECT_LIST_MAP_DATA.success,
		data,
		regionalCenter
	});

export const mapDataFetchFailed = (error) => ({
	type: PROJECT_LIST_MAP_DATA.failed,
	error
});

let mapResponseParser = (dispatch, resp) => {
	if (resp.success && resp.data) {
		let regionalCenter = false;
		if (resp.data.length ===1 ){
				if (resp.data[0].latitude == null && resp.data[0].longitude == null && (resp.data[0].total_budget!==null && resp.data[0].total_expense!==null) ){
					regionalCenter = true ;
				}
		}
		let data = resp.data.filter((item, index) => ((item.latitude !== null && item.longitude !== null) ));
		data = data.map((item, index) => {
			let outputs = item.outputs.filter((output, key) => ((output.output_latitude !== null && output.output_longitude !== null)));
			item.outputs = outputs;
			return item; 
		});
		dispatch(mapDataFetchEnd());
		dispatch(mapDataFetchSuccess(data,regionalCenter));
	}
	else {
		dispatch(mapDataFetchEnd());
	}
};

export const loadProjectListMapData = (year, sector, unit, source, sdg,marker, marker_id, l2Country) => (dispatch,getState) => {
	dispatch(mapDataFetchStart());
	unit = unit ? unit : '';
	source = source ? source : '';
	sector = ( sector!== undefined && sector !== null )?sector:'';
	year = year?year:getState().mapData.yearTimeline.mapCurrentYear;
	sdg =  ( sdg!== undefined && sdg !== null )?sdg:'';
	marker =(marker ? marker : '');
	marker_id = marker_id? marker_id : '';
	l2Country = l2Country ? l2Country : '';
	if (year !== null)
		return Api.get(Api.API_MAP_PROJECT_LIST(year, sector, unit, source, sdg, marker, marker_id, l2Country)).then(resp => mapResponseParser(dispatch, resp))
			.catch((exception) => {
				dispatch(mapDataFetchEnd());
				dispatch(mapDataFetchFailed(exception));
			});
	else {
		dispatch(mapDataFetchEnd());
		dispatch(mapDataFetchFailed());
	}
};