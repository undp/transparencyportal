import Api from '../../../../lib/api';
import { aggregateCalculator } from '../../../../utils/commonMethods';

export const RECIPIENT_SDG = {
    start: 'fetch_start/recipient_sdg',
    end: 'fetch_end/recipient_sdg',
    success: 'fetch_success/recipient_sdg',
    failed: 'fetch_failed/recipient_sdg'
}

export const RECIPIENT_SDG_AGGREGATE = 'RECIPIENT_SDG_AGGREGATE';


export const RecipientSdgFetchStart = () => ({
    type: RECIPIENT_SDG.start
})

export const RecipientSdgFetchEnd = () => ({
    type: RECIPIENT_SDG.end
})

export const RecipientSdgFetchSuccess = (data) => (
    {
        type: RECIPIENT_SDG.success,
        data
    })

export const RecipientSdgFetchFailed = (error) => ({
    type: RECIPIENT_SDG.failed,
    error
})


 const filterZero = (data) => {
    return  data.filter((item)=>{
        if(item.percentage && item.percentage!=0 && item.sdg_budget && item.sdg_budget!=0){
            return true
        }else{
            return false;
        }
    })

}  


export const updateRecipientSdgAggregate = (sdgAggregate) => ({
    type:RECIPIENT_SDG_AGGREGATE,
    sdgAggregate
})


const parseRecepientSdgData = (data) =>{
    data.forEach((item)=>{
        item.sector = item.sdg_code
        item.sector_color = item.sdg_color
        item.sector_name = item.sdg_name
        item.sdg_budget = item.sdg_budget

    })
}

export const fetchRecipientSdg = (code, year) => {
    return (dispatch) => {
        dispatch(RecipientSdgFetchStart())
        if(year!=null) {
            return Api.get(Api.API_RECIPIENT_COUNTRY_SDG(code,year)).then(resp => {
                if (resp.success && resp.data) {
                    if(resp.data.length){
                        const sdgAggregate = aggregateCalculator(resp.data,"sdg_budget")
                        dispatch(updateRecipientSdgAggregate(sdgAggregate))
                    }
                    parseRecepientSdgData(resp.data) 
                    const filteredArray = filterZero(resp.data)
                    dispatch(RecipientSdgFetchSuccess(filteredArray))
                    dispatch(RecipientSdgFetchEnd())
                    
                } else {
                    dispatch(RecipientSdgFetchEnd())
                }
            }).catch((exception) => {
                dispatch(RecipientSdgFetchEnd())
                dispatch(RecipientSdgFetchFailed(exception))
            });
        }
    }
}



