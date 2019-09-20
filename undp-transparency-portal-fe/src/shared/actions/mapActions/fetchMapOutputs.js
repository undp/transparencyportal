/************************* Lib Files ************************/
import Api from '../../../lib/api';

export const OUTPUTS_MAP_DATA = {
	start: 'fetch_start/outputs_map_data',
	end: 'fetch_end/outputs_map_data',
	success: 'fetch_success/outputs_map_data',
	failed: 'fetch_failed/outputs_map_data',
	reset: 'outputs_reset/outputs_map_data'
};

export const DONOR_OUTPUTS_MAP_DATA = {
	start: 'fetch_start/donor_outputs_map_data',
	end: 'fetch_end/donor_outputs_map_data',
	success: 'fetch_success/donor_outputs_map_data',
	failed: 'fetch_failed/donor_outputs_map_data',
	reset: 'outputs_reset/donor_outputs_map_data'
};

export const mapDataFetchStart = () => ({
	type: OUTPUTS_MAP_DATA.start
});

export const mapDataFetchEnd = () => ({
	type: OUTPUTS_MAP_DATA.end
});

export const mapDataFetchSuccess = (data) => (
	{
		type: OUTPUTS_MAP_DATA.success,
		data
	});

export const mapDataFetchFailed = (error) => ({
	type: OUTPUTS_MAP_DATA.failed,
	error
});

export const donorMapOutputDataFetchStart = () => ({
	type: DONOR_OUTPUTS_MAP_DATA.start
});

export const donorMapOutputDataFetchEnd = () => ({
	type: DONOR_OUTPUTS_MAP_DATA.end
});

export const donorMapOutputDataFetchSuccess = (data) => (
	{
		type: DONOR_OUTPUTS_MAP_DATA.success,
		data
	});

export const donorMapOutputDataFetchFailed = (error) => ({
	type: DONOR_OUTPUTS_MAP_DATA.failed,
	error
});

export const MapOutputsReset = () => ({
	type: OUTPUTS_MAP_DATA.reset
});

let mapResponseParser = (dispatch, resp) => {
	if (resp.success && resp.data) {
		let data = resp.data.filter((item, index) => item.latitude !== null && item.longitude !== null);
		data = data.map((item, index) => {
			let outputs = item.outputs.filter((output, key) => output.output_latitude !== null && output.output_longitude !== null);
			item.outputs = outputs;
			return item;
		});
		dispatch(mapDataFetchEnd());
		dispatch(mapDataFetchSuccess(data));
	}
	else {
		dispatch(mapDataFetchEnd());
	}
};

let mapDonorOutputsResponseParser = (dispatch, resp) => {
	if (resp.success && resp.data) {
		let data = resp.data.filter((item, index) => item.latitude !== null && item.longitude !== null);
		data = data.map((item, index) => {
			let outputs = item.outputs.filter((output, key) => output.output_latitude !== null && output.output_longitude !== null);
			item.outputs = outputs;
			return item;
		});
		dispatch(donorMapOutputDataFetchEnd());
		dispatch(donorMapOutputDataFetchSuccess(data));
	}
	else {
		dispatch(donorMapOutputDataFetchEnd());
	}
};

export const loadOutputsMapData = (year, unit, sector, source, projectId, budgetType, sdg,marker,markerSubType,sigSoln,sdgTarget) => (dispatch) => {
	dispatch(mapDataFetchStart());
	year=year?year:'';
	unit=unit?unit:'';
	sdgTarget=sdgTarget?sdgTarget:'';
	sigSoln = sigSoln? sigSoln : '' ;
	sector = ( sector!== undefined && sector !== null )?sector:'';
	source=source?source:'';
	projectId=projectId?projectId:'';
	budgetType=budgetType?budgetType:'';
	marker = marker ? marker : '';
	markerSubType ? null : markerSubType = '';
	sdg =  ( sdg!== undefined && sdg !== null )?sdg:'';
	if (year !== null)
		return Api.get(Api.API_MAP_OUTPUTS(year, unit, sector, source, projectId, budgetType, sdg,marker,markerSubType,sigSoln,sdgTarget)).then(resp => mapResponseParser(dispatch, resp))
			.catch((exception) => {
				dispatch(mapDataFetchEnd());
				dispatch(mapDataFetchFailed(exception));
			});
};

export const loadDonorOutputs = (year, unit, sector, source, projectId, budgetType, sdg,marker,markerSubType,sigSoln) => (dispatch) => {
	dispatch(donorMapOutputDataFetchStart());
	year=year?year:'';
	unit=unit?unit:'';
	sigSoln = sigSoln? sigSoln : '' ;
	sector = ( sector!== undefined && sector !== null )?sector:'';
	source=source?source:'';
	projectId=projectId?projectId:'';
	budgetType=budgetType?budgetType:'';
	marker = marker ? marker : '';
	markerSubType ? null : markerSubType = '';
	sdg =  ( sdg!== undefined && sdg !== null )?sdg:'';
	if (year !== null)
		return Api.get(Api.API_MAP_OUTPUTS(year, unit, sector, source, projectId, budgetType, sdg,marker,markerSubType,sigSoln)).then(resp => mapDonorOutputsResponseParser(dispatch, resp))
			.catch((exception) => {
				dispatch(donorMapOutputDataFetchEnd());
				dispatch(donorMapOutputDataFetchFailed(exception));
			});
};

export const resetOutputsMapData = () => (dispatch) => {
	dispatch(MapOutputsReset());
};