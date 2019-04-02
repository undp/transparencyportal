import Api from '../../../../lib/api';
import { aggregateCalculator } from '../../../../utils/commonMethods';

export const RECIPIENT_THEME = {
    start: 'fetch_start/recipient_theme',
    end: 'fetch_end/recipient_theme',
    success: 'fetch_success/recipient_theme',
    failed: 'fetch_failed/recipient_theme'
}


export const RECIPIENT_THEME_AGGREGATE = 'RECIPIENT_THEME_AGGREGATE';

export const RecipientThemeFetchStart = () => ({
    type: RECIPIENT_THEME.start
})

export const RecipientThemeFetchEnd = () => ({
    type: RECIPIENT_THEME.end
})

export const RecipientThemeFetchSuccess = (data) => (
    {
        type: RECIPIENT_THEME.success,
        data
    })

export const RecipientThemeFetchFailed = (error) => ({
    type: RECIPIENT_THEME.failed,
    error
})

export const filterZero = (data) => {
    return  data.filter((item)=>{
        if(item.percentage && item.percentage!=0 && item.theme_budget && item.theme_budget!=0){
            return true
        }else{
            return false;
        }
    })

}  

export const updateRecipientThemeAggregate = (themeAggregate) => ({
    type:RECIPIENT_THEME_AGGREGATE,
    themeAggregate
})



export const loadRecipientTheme = (code, year) => {
    return (dispatch) => {
        dispatch(RecipientThemeFetchStart())
        if(year!=null) {
            return Api.get(Api.API_RECIPIENT_COUNTRY_THEME(code,year)).then(resp => {
                if (resp.success && resp.data) {
                    dispatch(RecipientThemeFetchEnd())
                    if(resp.data.length){
                        const themeAggregate = aggregateCalculator(resp.data,"theme_budget")
                        dispatch(updateRecipientThemeAggregate(themeAggregate))
                    }


                    const filteredArray =  filterZero(resp.data);
                    dispatch(RecipientThemeFetchSuccess(filteredArray));
                } else {
                    dispatch(RecipientThemeFetchEnd())
                }
            }).catch((exception) => {
                dispatch(RecipientThemeFetchEnd())
                dispatch(RecipientThemeFetchFailed(exception))
            });
        }
    }
}



