import Api from '../../../../lib/api';
export const RECIPIENT_WIND_ROSE = {
    start: 'fetch_start/recipient_wind_rose',
    end: 'fetch_end/recipient_wind_rose',
    success: 'fetch_success/recipient_wind_rose',
    failed: 'fetch_failed/recipient_wind_rose',
    clear: 'clear/recipient_wind_rose'
}

export const recipientWindRoseFetchStart = () => ({
    type: RECIPIENT_WIND_ROSE.start
})

export const recipientWindRoseFetchEnd = () => ({
    type: RECIPIENT_WIND_ROSE.end
})

export const recipientWindRoseFetchSuccess = (data,initialSector,year, sectorColor) => (
    {
        type: RECIPIENT_WIND_ROSE.success,
        data,
        initialSector,
        year,
        sectorColor
    })

export const recipientWindRoseFetchFailed = (error) => ({
    type: RECIPIENT_WIND_ROSE.failed,
    error
})

export const mapSectorName = (themeList,sector) =>{
    return themeList.filter((item)=>{
        return item.code == sector 
    })

}




export const fetchRecipientWindRose = (code, year, sector) => {
    return (dispatch,getState) => {
        dispatch(recipientWindRoseFetchStart())
        sector=!sector?'':sector;
        if(year!=null) {
            return Api.get(Api.API_RECIPIENT_WIND_ROSE(code, year, sector)).then(resp => {
                if (resp.success && resp.data) {
                   const sectorName =  mapSectorName(getState().themeList.themes,resp.data.sector)[0] ? mapSectorName(getState().themeList.themes,resp.data.sector)[0].label: '';
    
                    dispatch(recipientWindRoseFetchEnd())
                    dispatch(recipientWindRoseFetchSuccess(resp.data.consolidate,sectorName,resp.data.year,resp.data.sector_color))
                } else {
                    dispatch(recipientWindRoseFetchEnd())
                }
            }).catch((exception) => {
               
                dispatch(recipientWindRoseFetchEnd())
                dispatch(recipientWindRoseFetchFailed(exception))
            });
        }
    }
}



