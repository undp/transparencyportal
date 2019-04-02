
import { themeData } from '../../../assets/json/themeData';
import { donorData } from '../../../assets/json/donorData';
import { sdgData } from '../../../assets/json/sdgData'
export const TAB_DATA = {
    start: 'fetch_start/tab_data',
    end: 'fetch_end/tab_data',
    success: 'fetch_success/tab_data',
    failed: 'fetch_failed/tab_data'
}
export const ON_TAB_SWITCH = "ON_TAB_SWITCH";
export const ON_UPDATE_DONOR_FILTER = "ON_UPDATE_DONOR_FILTER";
export const ON_UPDATE_THEME_FILTER = "ON_UPDATE_THEME_FILTER";
export const ON_UPDATE_COUNTRYREGION_FILTER = "ON_UPDATE_COUNTRYREGION_FILTER";
export const ON_UPDATE_SDG_FILTER = "ON_UPDATE_SDG_FILTER";
export const ON_UPDATE_YEAR = "ON_UPDATE_YEAR";
export const ON_UPDATE_SIGNATURE_FILTER = "ON_UPDATE_SIGNATURE_FILTER";

export const onTabSwitch = (tabType) => ({
    type: ON_TAB_SWITCH,
    tabType
})

export const onTabSelection = (tab) => {

    return (dispatch, getState) => {
        switch (tab) {
            case 'country':
                dispatch(onTabSwitch('country'));
                // dispatch(countryItemFetchData())
                break;
            case 'themes':
                dispatch(onTabSwitch('themes'));
                dispatch(themeItemFetchData())
                break;
            case 'sdg':
                dispatch(onTabSwitch('sdg'));
                dispatch(sdgItemFetchData())
                break;
            case 'donors':
                dispatch(onTabSwitch('donors'));
                dispatch(donorItemFetchData())
                break;
            case 'signature':
                dispatch(onTabSwitch('signature'));
                dispatch(signatureItemFetchData());
                break;
        }
    }
}


export const tabDataFetchStart = () => ({
    type: TAB_DATA.start
})

export const tabDataFetchEnd = () => ({
    type: TAB_DATA.end
})

export const tabDataFetchSuccess = (data) => {

    return (
        {
            type: TAB_DATA.success,
            data
        })
}

export const tabDataFetchFailed = (error) => ({
    type: TAB_DATA.failed,
    error
})

export const onUpdateYear = (year) => {

    return ({
        type: ON_UPDATE_YEAR,
        year
    })
}



export const themeItemFetchData = () => {
    return (dispatch, getState) => {
        const themeData = getState().themeSummary.themes;

        dispatch(tabDataFetchStart())
        dispatch(tabDataFetchEnd())
        dispatch(tabDataFetchSuccess({ data: themeData }));
    }
}
export const donorItemFetchData = () => {
    return (dispatch, getState) => {
        const donorFundAggr = getState().donorFundList.data;
        dispatch(tabDataFetchStart())
        dispatch(tabDataFetchEnd())
        dispatch(tabDataFetchSuccess({ data: donorFundAggr }))

    }
}
export const sdgItemFetchData = () => {
    return (dispatch, getState) => {
        const sdgAggr = getState().sdgAggregate.data;
        dispatch(tabDataFetchStart())
        dispatch(tabDataFetchEnd())
        dispatch(tabDataFetchSuccess({ data: sdgAggr }))

    }
}
export const signatureItemFetchData = () => {
    return (dispatch, getState) => {
        const signatureData = getState().themeSummary.themes;
        dispatch(tabDataFetchStart());
        dispatch(tabDataFetchEnd());
        dispatch(tabDataFetchSuccess({ data: signatureData }));
    }
}

// update donor filter selection 
export const updateDonorFilter = (key, data) => {
    return ({
        type: ON_UPDATE_DONOR_FILTER,
        key,
        data
    })

}

// update theme filter selection

export const updateThemeFilter = (key, data) => {
    return ({
        type: ON_UPDATE_THEME_FILTER,
        key,
        data
    })
}


// update country-region filter selection

export const updateCountryRegionFilter = (key, data) => {
    return ({
        type: ON_UPDATE_COUNTRYREGION_FILTER,
        key,
        data
    })
}

export const updateSdgFilter = (key, data) => {
    return ({
        type: ON_UPDATE_SDG_FILTER,
        key,
        data
    })
}

export const updateSignatureFilter = (key, data) => {
    return ({
        type: ON_UPDATE_SIGNATURE_FILTER,
        key,
        data
    })
}
// export const countryItemFetchData = () => {
//     return (dispatch) => {
//         dispatch(tabDataFetchStart())
//         dispatch(tabDataFetchEnd())
//         dispatch(tabDataFetchSuccess({}))

//     }
// }




