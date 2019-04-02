
import Api from '../../../../src/lib/api'
import { numberToCurrencyFormatter } from '../../../utils/numberFormatter.js'
import { onTabSelection } from '../../TabSection/actions';



export const YEAR_SUMMARY = {
    start: 'fetch_start/year_summary',
    end: 'fetch_end/year_summary',
    success: 'fetch_success/year_summary',
    failed: 'fetch_failed/year_summary'
}

export const yearSummaryFetchStart = () => ({
    type: YEAR_SUMMARY.start
})

export const yearSummaryFetchEnd = () => ({
    type: YEAR_SUMMARY.end
})

export const yearSummaryFetchSuccess = (data) => (
    {
        type: YEAR_SUMMARY.success,
        data
    })

export const yearSummaryFetchFailed = (error) => ({
    type: YEAR_SUMMARY.failed,
    error
})

export const yearSummaryFetchData = (year) => {
    return (dispatch) => {
        dispatch(yearSummaryFetchStart())
        if (year != null)
        return Api.get(Api.API_PROJECT_AGGREGATE + year).then(resp => {
            if (resp.success && resp.data) {
                dispatch(yearSummaryFetchEnd())
                dispatch(yearSummaryFetchSuccess(resp.data))
            } else {
                dispatch(yearSummaryFetchEnd())
            }
        }).catch((exception) => {
            dispatch(yearSummaryFetchEnd())
            dispatch(yearSummaryFetchFailed())
        });
    }
}


////////////// Fetch Theme Summary /////////////////
export const THEME_SUMMARY = {
    start: 'fetch_start/theme_summary',
    end: 'fetch_end/theme_summary',
    success: 'fetch_success/theme_summary',
    failed: 'fetch_failed/theme_summary'
}

export const themeSummaryFetchStart = () => ({
    type: THEME_SUMMARY.start
})

export const themeSummaryFetchEnd = () => ({
    type: THEME_SUMMARY.end
})

export const themeSummaryFetchSuccess = (data) => (
    {
        type: THEME_SUMMARY.success,
        data
    })

export const themeSummaryFetchFailed = (error) => ({
    type: THEME_SUMMARY.failed,
    error
})


export function parseThemeSummaryData(data, selTab) {
    let parsedData = {
        project: { ...data.project },
        sector: []
    };
    
    let newDataArray = selTab === 'signature'?[...data.signature_solutions]:[...data.sector];
    newDataArray.forEach((item, index) => {
        item.label = selTab === 'signature'? item.signature_solution : item.sector_name;
        item.share_percent = item.percentage;
        item.value = item.sector;
        item.theme_name = item.sector_name = selTab === 'signature'? item.signature_solution : item.sector_name;
        item.color = '#' + item.color;
        item.total_projects = selTab === 'signature'? item.projects : item.total_projects;
        item.point = 100 + index;
        item.sector = selTab === 'signature'? item.ss_id : item.sector;
    })
    parsedData.sector = newDataArray;
    return parsedData;
}

export const fetchThemeSummaryData = (year,source,operatingUnit) => {
    return (dispatch, getState) => {
        const themeFilter = getState().tabData.themeFilter,
            budgetSources1 = source || (themeFilter.budgetSources ? themeFilter.budgetSources : ""),
            operatingUnits1 = operatingUnit || ( themeFilter.operatingUnits ? themeFilter.operatingUnits : ""),
            newYear = year || getState().tabData.currentYear;
        dispatch(themeSummaryFetchStart())
        if (newYear != null)
        return Api.get(`${Api.API_THEME_AGGREGATE}${newYear}&budget_source=${budgetSources1}&operating_unit=${operatingUnits1}`).then(resp => {
            if (resp.success && resp.data) {
                if(getState().tabData.tabSelected === 'themes'){
                    let parsedData = parseThemeSummaryData(resp.data,'themes');
                    dispatch(themeSummaryFetchEnd());
                    dispatch(themeSummaryFetchSuccess(parsedData));
                    dispatch(onTabSelection(getState().tabData.tabSelected));
                }
                
            } else {
                dispatch(themeSummaryFetchEnd())
            }
        }).catch((exception) => {
            dispatch(themeSummaryFetchEnd())
            dispatch(themeSummaryFetchFailed())
        });
    }
}

////////////// Fetch Signature Summary /////////////////
export const SIGNATURE_SUMMARY = {
    start: 'fetch_start/theme_summary',
    end: 'fetch_end/theme_summary',
    success: 'fetch_success/theme_summary',
    failed: 'fetch_failed/theme_summary'
}

export const signatureSummaryFetchStart = () => ({
    type: SIGNATURE_SUMMARY.start
})

export const signatureSummaryFetchEnd = () => ({
    type: SIGNATURE_SUMMARY.end
})

export const signatureSummaryFetchSuccess = (data) => (
    {
        type: SIGNATURE_SUMMARY.success,
        data
    })

export const signatureSummaryFetchFailed = (error) => ({
    type: SIGNATURE_SUMMARY.failed,
    error
})

export const fetchSignatureSummaryData = (year,source,operatingUnit) => {
    return (dispatch, getState) => {
        const signatureFilter = getState().tabData.themeFilter,
            budgetSources1 = source || (signatureFilter.budgetSources ? signatureFilter.budgetSources : ""),
            operatingUnits1 = operatingUnit || ( signatureFilter.operatingUnits ? signatureFilter.operatingUnits : ""),
            newYear = year || getState().tabData.currentYear;
        dispatch(signatureSummaryFetchStart());
        if (newYear != null)
        return Api.get(`${Api.API_SIGNATURE_AGGREGATE}${newYear}&budget_source=${budgetSources1}&operating_unit=${operatingUnits1}`).then(resp => {
            if (resp.success && resp.data) {
                if(getState().tabData.tabSelected === 'signature'){
                    let parsedData = parseThemeSummaryData(resp.data, 'signature');
                    dispatch(signatureSummaryFetchEnd());
                    dispatch(signatureSummaryFetchSuccess(parsedData));
                    dispatch(onTabSelection(getState().tabData.tabSelected));
                }
            } else {
                dispatch(signatureSummaryFetchEnd());
            }
        }).catch((exception) => {
            dispatch(signatureSummaryFetchEnd());
            dispatch(signatureSummaryFetchFailed());
        });
    }
}





