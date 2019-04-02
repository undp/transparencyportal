import Api from '../../../../src/lib/api'
import { numberToCurrencyFormatter } from '../../../utils/numberFormatter.js'
import { onTabSelection } from '../../TabSection/actions';
import d3 from 'd3';
const TAB_OTHER = 'Other Resources',
    TAB_REGULAR = 'Regular Resources',
    TAB_TOTAL = '';

export const DONOR_DATA = {
    start: 'fetch_start/donors',
    end: 'fetch_end/donors',
    success: 'fetch_success/donors',
    failed: 'fetch_failed/donors'
}

// ----------------- tab switch data ------ >>>>>>>>>>>

export const UPDATE_DONOR_TOTAL_DATA = 'UPDATE_DONOR_TOTAL_DATA';
export const UPDATE_DONOR_OTHER_DATA = 'UPDATE_DONOR_OTHER_DATA';
export const UPDATE_DONOR_REGULAR_DATA = 'UPDATE_DONOR_REGULAR_DATA';


export const DONOR_TOTAL_DATA_FETCH_START = 'DONOR_TOTAL_DATA_FETCH_START';
export const DONOR_OTHER_DATA_FETCH_START = 'DONOR_OTHER_DATA_FETCH_START';
export const DONOR_REGULAR_DATA_FETCH_START = 'DONOR_REGULAR_DATA_FETCH_START';

export const DONOR_TOTAL_DATA_FETCH_END = 'DONOR_TOTAL_DATA_FETCH_END';
export const DONOR_OTHER_DATA_FETCH_END = 'DONOR_OTHER_DATA_FETCH_END';
export const DONOR_REGULAR_DATA_FETCH_END = 'DONOR_REGULAR_DATA_FETCH_END';


// ------------------ > Individual Loading --- for Embed Section ---------------------->>>>>>

//Fectch Start
export const donorTotalDataFetchStart = () => ({
    type: DONOR_TOTAL_DATA_FETCH_START
})
export const donorOtherDataFetchStart = () => ({
    type: DONOR_OTHER_DATA_FETCH_START
})
export const donorRegularDataFetchStart = () => ({
    type: DONOR_REGULAR_DATA_FETCH_START
})

//Fetch End

export const donorTotalDataFetchEnd = () => ({
    type: DONOR_TOTAL_DATA_FETCH_END
})
export const donorOtherDataFetchEnd = () => ({
    type: DONOR_OTHER_DATA_FETCH_END
})
export const donorRegularDataFetchEnd = () => ({
    type: DONOR_REGULAR_DATA_FETCH_END
})


// for loading prop only
export const dataFetchStart = (type) => {
    return (dispatch) => {
        switch (type) {
            case TAB_TOTAL:
                dispatch(donorTotalDataFetchStart())
                break;
            case TAB_REGULAR:
                dispatch(donorRegularDataFetchStart())
                break;
            case TAB_OTHER:
                dispatch(donorOtherDataFetchStart())

                break;
            default:

        }
    }
}


export const dataFetchEnd = (type) => {
    return (dispatch) => {
        switch (type) {
            case TAB_TOTAL:
                dispatch(donorTotalDataFetchEnd())
                break;
            case TAB_REGULAR:
                dispatch(donorRegularDataFetchEnd())

                break;
            case TAB_OTHER:
                dispatch(donorOtherDataFetchEnd())

                break;
            default:

        }

    }
}


//--------------------- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>




export const donorDataFetchStart = () => ({
    type: DONOR_DATA.start
})

export const donorDataFetchEnd = () => ({
    type: DONOR_DATA.end
})

export const donorDataFetchSuccess = (data) => {
    return (
        {
            type: DONOR_DATA.success,
            data
        })
}

export const donorDataFetchFailed = (error) => ({
    type: DONOR_DATA.failed,
    error
})



// tab switch data


export const updateTotalData = (data) => ({
    type: UPDATE_DONOR_TOTAL_DATA,
    data
})

export const updateRegularData = (data) => ({
    type: UPDATE_DONOR_REGULAR_DATA,
    data
})

export const updateOtherData = (data) => ({
    type: UPDATE_DONOR_OTHER_DATA,
    data
})


export const updateTabData = (data, tabSelected) => {
    return (dispatch) => {
        switch (tabSelected) {
            case TAB_TOTAL:
                dispatch(updateTotalData(data))
                break;
            case TAB_REGULAR:
                dispatch(updateRegularData(data))
                break;

            case TAB_OTHER:
                dispatch(updateOtherData(data))
                break;
            default:
                dispatch(updateTotalData(data))
        }
    }
}


// --------------------------- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


export const donorFetchData = (filterObj, tabSelected) => {
    return (dispatch, getState) => {

        const map = {
            'Other Resources': 'otherData',
            'Regular Resources': 'regularData',
            '': 'totalData',
        },
            tabData = getState().donorData[map[tabSelected]],
            year = tabData.filterObj && tabData.filterObj.year ? tabData.filterObj.year : '',
            donorType = tabData.filterObj && tabData.filterObj.donorType && tabData.filterObj.donorType.value ? tabData.filterObj.donorType.value : '',
            fundStream = tabData.filterObj && tabData.filterObj.fundStream && tabData.filterObj.fundStream.value ? tabData.filterObj.fundStream.value : '';


        if (
            (tabData.filterObj === undefined) ||
            (filterObj.year !== year) ||
            (filterObj.donorType.value !== donorType) ||
            (filterObj.fundStream.value !== fundStream)
        ) {

            const fundType = filterObj.fundType === null ? tabSelected : filterObj.fundType;


            if (filterObj.year != null) {
                dispatch(donorDataFetchStart())
                dispatch(dataFetchStart(tabSelected))

                return Api.get(`${Api.API_DONOR_DATA}?year=${filterObj.year}&fund_type=${fundType}&donor_type=${filterObj.donorType.value}&fund_stream=${filterObj.fundStream.value}`).then(resp => {


                    if (resp.success && resp.data) {
                        dispatch(donorDataFetchEnd(tabSelected))

                        let newData = parseDonorData(resp.data, filterObj, tabSelected);
                        dispatch(updateTabData(newData, tabSelected))
                        dispatch(donorDataFetchSuccess(newData))
                        dispatch(dataFetchEnd(tabSelected))


                    } else {
                        dispatch(donorDataFetchEnd())
                        dispatch(dataFetchEnd(tabSelected))

                    }
                }).catch((exception) => {
                    dispatch(donorDataFetchEnd())
                    dispatch(dataFetchEnd(tabSelected))
                    dispatch(donorDataFetchFailed())
                });
            }

        }
        else {
            dispatch(donorDataFetchSuccess(tabData))
        }
    }
}


export const parseDonorData = (dataArray, filterObj, tabSelected) => {

    let newObj = {
        ...dataArray,
        data: {
            country: []
        },
        key: [],
        filterObj: filterObj
    }

    if (filterObj.fundType === TAB_TOTAL || tabSelected === TAB_TOTAL) {
        let HighestValue = d3.max([...dataArray.contributions], function (d) { return d.total_contribution; })
        if (dataArray.contributions.length) {
            newObj.data.country = dataArray.contributions.map((item) => {
                let { regular_contribution, country, other_contribution, total_contribution } = item;
                return (
                    {
                        name: item.country ? item.country : '',
                        donor_code: item.country_iso3? item.country_iso3: '',
                        contribution: item.total_contribution ? item.total_contribution : 0,
                        regular: regular_contribution && regular_contribution.amount ? regular_contribution.amount : 0,
                        other: other_contribution && other_contribution.amount ? other_contribution.amount : 0,
                        perc: HighestValue === 0 ? 0 : (item.total_contribution / HighestValue) * 100

                    }
                )
            })
        }

        newObj.data.key = ['regular', 'other'];

    } else if (filterObj.fundType === TAB_REGULAR || tabSelected === TAB_REGULAR) {
        let HighestValue = d3.max([...dataArray.contributions], function (d) { return d.regular_contribution.amount; })

        if (dataArray.contributions.length) {
            newObj.data.country = dataArray.contributions.map((item) => {
                let { regular_contribution, country, other_contribution } = item;
                return (
                    {
                        name: item.country ? item.country : '',
                        donor_code: item.country_iso3? item.country_iso3: '',
                        contribution: regular_contribution && regular_contribution.amount ? regular_contribution.amount : 0,
                        regular: regular_contribution && regular_contribution.amount ? regular_contribution.amount : 0,
                        other: 0,
                        perc: HighestValue == 0 ? 0 : (regular_contribution.amount / HighestValue) * 100
                    }
                )
            })
        }

        newObj.data.key = ['regular', 'other'];

    } else if (filterObj.fundType === TAB_OTHER || tabSelected === TAB_OTHER) {
        let HighestValue = d3.max([...dataArray.contributions], function (d) { return d.other_contribution.amount; })

        if (dataArray.contributions.length) {
            newObj.data.country = dataArray.contributions.map((item) => {
                let { regular_contribution, country, other_contribution } = item;
                return (
                    {
                        name: item.country ? item.country : '',
                        donor_code: item.country_iso3? item.country_iso3: '',
                        contribution: other_contribution && other_contribution.amount ? other_contribution.amount : 0,
                        regular: 0,
                        other: other_contribution && other_contribution.amount ? other_contribution.amount : 0,
                        perc: HighestValue == 0 ? 0 : (other_contribution.amount / HighestValue) * 100

                    }
                )
            })
        }


        newObj.data.key = ['other', 'regular'];
    }
    return newObj;
}


//Donor types


export const DONOR_TYPES = {
    start: 'fetch_start/donor_types',
    end: 'fetch_end/donor_types',
    success: 'fetch_success/donor_types',
    failed: 'fetch_failed/donor_types'
}

export const donorTypesFetchStart = () => ({
    type: DONOR_TYPES.start
})

export const donorTypesFetchEnd = () => ({
    type: DONOR_TYPES.end
})

export const donorTypesFetchSuccess = (data) => (
    {
        type: DONOR_TYPES.success,
        data
    })

export const donorTypesFetchFailed = (error) => ({
    type: DONOR_TYPES.failed,
    error
})


const parseDonorTypesFetchData = (data) => {
    if (data.length !== 0) {
        data.forEach((item) => {
            item.label = item.value;
            item.value = item.code;
        })
    }
}

export const donorTypesFetchData = () => {
    return (dispatch) => {
        dispatch(donorTypesFetchStart())
        dispatch(donorTypesFetchEnd())
        return Api.get(`${Api.API_DONOR_TYPES}`).then(resp => {
            if (resp.success && resp.data) {
                dispatch(donorTypesFetchEnd())
                parseDonorTypesFetchData(resp.data)
                dispatch(donorTypesFetchSuccess(resp.data))
            } else {
                dispatch(donorTypesFetchEnd())
            }
        }).catch((exception) => {
            dispatch(donorTypesFetchEnd())
            dispatch(donorTypesFetchFailed())
        });
    }
}



//API_FUND_STREAMS


export const FUND_STREAMS = {
    start: 'fetch_start/fund_streams',
    end: 'fetch_end/fund_streams',
    success: 'fetch_success/fund_streams',
    failed: 'fetch_failed/fund_streams'
}

export const fundStreamsFetchStart = () => ({
    type: FUND_STREAMS.start
})

export const fundStreamsFetchEnd = () => ({
    type: FUND_STREAMS.end
})

export const fundStreamsFetchSuccess = (data) => (
    {
        type: FUND_STREAMS.success,
        data
    })

export const fundStreamsFetchFailed = (error) => ({
    type: FUND_STREAMS.failed,
    error
})


const parsefundStreamsFetchData = (data) => {
    if (data.length !== 0) {
        data.forEach((item) => {
            item.label = item.value;
        })
    }
}



export const fundStreamsFetchData = () => {
    return (dispatch) => {
        dispatch(fundStreamsFetchStart())
        dispatch(fundStreamsFetchEnd())
        return Api.get(`${Api.API_FUND_STREAMS}`).then(resp => {
            if (resp.success && resp.data) {
                dispatch(fundStreamsFetchEnd())
                parsefundStreamsFetchData(resp.data)
                dispatch(fundStreamsFetchSuccess(resp.data))
            } else {
                dispatch(fundStreamsFetchEnd())
            }
        }).catch((exception) => {
            dispatch(fundStreamsFetchEnd())
            dispatch(fundStreamsFetchFailed())
        });
    }
}







