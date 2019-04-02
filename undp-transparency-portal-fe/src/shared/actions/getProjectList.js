/************************* Lib Files ************************/
import Api from '../../lib/api';
export const PROJECT_LIST = {
	start: 'fetch_start/project_list',
	end: 'fetch_end/project_list',
	success: 'fetch_success/project_list',
	failed: 'fetch_failed/project_list'
};
export const projectListFetchStart = () => ({
	type: PROJECT_LIST.start
});

export const projectListFetchEnd = () => ({
	type: PROJECT_LIST.end
});

export const projectListFetchSuccess = (data) => (
	{
		type: PROJECT_LIST.success,
		data
	});

export const projectListFetchFailed = (error) => ({
	type: PROJECT_LIST.failed,
	error
});
export const updateProjectList = (year,operatingUnit, budgetSource, themes, keyword, limit, offset, budgetType,sdg,target, signatureSolution) => (dispatch) => {
	dispatch(projectListFetchStart());
	operatingUnit?null:operatingUnit='';
	budgetType?null:budgetType='';
	year?null:year='';
	budgetSource?null:budgetSource='';
	themes?null:themes='';
	keyword?null:keyword='';
	sdg = sdg ? sdg : sdg === 0 ? 0 : '';
	signatureSolution = signatureSolution? signatureSolution : '';
	
	if (year !== null)
		return Api.get(Api.API_PROJECT_LIST(year,operatingUnit, budgetSource, themes, keyword, limit, offset, budgetType,sdg,target,signatureSolution)).then(resp => {
			dispatch(projectListFetchEnd());
			dispatch(projectListFetchSuccess(resp.data));
		}).catch((exception) => {
			dispatch(projectListFetchEnd());
			dispatch(projectListFetchFailed(exception));
		});
};
export const fetchMarkerProjectList = (year, markerId,keyword,limit,offset,country,markerType, levelTwoMarker) => {
	keyword ? null:keyword='';
	markerType ? null : markerType = '';
	(country && country!=='') ? (country.country_iso3 ? country = country.country_iso3 :null) : country = '';
	limit ? null: limit='10';
	offset?null : offset='0';
	levelTwoMarker = levelTwoMarker ? levelTwoMarker : '';
    return (dispatch,getState) => {
        dispatch(projectListFetchStart());
        if (year !== '' && markerId !== '') {
            return Api.get(Api.API_MARKER_PROJECTLIST_DATA(year, markerId,keyword,limit,offset,country,markerType, levelTwoMarker)).then(resp => {
                if (resp.success && resp.data) {
                    resp.data.aggregate = resp.data.aggregate && resp.data.aggregate.length ? resp.data.aggregate[0]:{};
                    dispatch(projectListFetchEnd());
                    dispatch(projectListFetchSuccess(resp.data));
                } else {
                    dispatch(projectListFetchEnd());
                }
            }).catch((exception) => {
                dispatch(projectListFetchEnd());
                dispatch(projectListFetchFailed(exception));
            });
        }
        else {
            dispatch(markerProjectListClear());
            dispatch(markerProjectListFetchEnd());
        }
    }
}
