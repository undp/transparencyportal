import Api from '../../../lib/api';
export const MAP_DATA = {
    start: 'fetch_start/map_data',
    end: 'fetch_end/map_data',
    success: 'fetch_success/map_data',
    failed: 'fetch_failed/map_data'
}

export const mapDataFetchStart = () => ({
    type: MAP_DATA.start
})

export const mapDataFetchEnd = () => ({
    type: MAP_DATA.end
})

export const mapDataFetchSuccess = (data) => (
    {
        type: MAP_DATA.success,
        data
    })

export const mapDataFetchFailed = (error) => ({
    type: MAP_DATA.failed,
    error
})

export const loadMapData = () => {
    return (dispatch) => {
        dispatch(mapDataFetchStart())
        return Api.get(Api.API_MAP_GLOBAL).then(resp => {
            if (resp.success && resp.data) {
                let data = resp.data.filter((item, index)=>{
                    return item.latitude!=null && item.longitude!=null
                })
                data = data.map((item, index)=>{
                    let outputs = item.outputs.filter((output, key)=>{
                        return output.output_latitude!=null && output.output_longitude!=null
                    })
                    item.outputs = outputs
                    return item;
                })
                dispatch(mapDataFetchEnd())
                dispatch(mapDataFetchSuccess(data))
            } else {
                dispatch(mapDataFetchEnd())
            }
        }).catch((exception) => {
            dispatch(mapDataFetchEnd())
            dispatch(mapDataFetchFailed(exception))
        });
    }
}



