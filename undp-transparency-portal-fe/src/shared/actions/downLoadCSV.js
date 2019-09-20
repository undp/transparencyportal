import Api from '../../lib/api';

export const EXPORT_CSV = {
    success: 'fetch_success/export_csv',
    reset: 'reset/export_csv'
};

export const exportCSVSuccess = (url) => ({
    type: EXPORT_CSV.success,
    url
});

export const exportCSVReset = () => ({
    type: EXPORT_CSV.reset
});


const saveToDisk = (fileURL, fileName) =>{
    // for non-IE
    if (!window.ActiveXObject) {
        var save = document.createElement('a');
        save.href = fileURL;
        save.download = fileName || 'unknown';
        save.style = 'display:none;opacity:0;color:transparent;';
        (document.body || document.documentElement).appendChild(save);

        if (typeof save.click === 'function') {
            save.click();
        } else {
            save.target = '_blank';
            var event = document.createEvent('Event');
            event.initEvent('click', true, true);
            save.dispatchEvent(event);
        }

        (window.URL || window.webkitURL).revokeObjectURL(save.href);
    }

    // for IE
    else if (!!window.ActiveXObject && document.execCommand) {
        var _window = window.open(fileURL, '_blank');
        _window.document.close();
        _window.document.execCommand('SaveAs', true, fileName || fileURL)
        _window.close();
    }
}


export const downLoadProjectListCsv = (year='', keyword='', source='', sectors='', units='', sdgs='', type='', signatureSolution='', target='', markerId='', markerSubType='', l2marker='', key=0) => (dispatch) => {
    dispatch(exportCSVReset());
    return Api.downLoadCSV(Api.API_DOWNLOAD_CSV_PROJECT_LISTS(year,keyword,source,sectors,units,sdgs,type,signatureSolution,target,markerId,markerSubType,l2marker, key)).then(resp => {
        const url = window.URL.createObjectURL(resp);
        saveToDisk(url,'project_list.csv');
        dispatch(exportCSVSuccess(url));
    }).catch((exception) => {

    });
};


export const downLoadProjectDetailsCsv = (projectId,item,search,category,fileName='data.csv') => (dispatch) => {
    dispatch(exportCSVReset());
    return Api.downLoadCSV(Api.API_DOWNLOAD_CSV_PROJECT_DETAILS(projectId,item,search,category)).then(resp => {
        const url = window.URL.createObjectURL(resp)
        saveToDisk(url,fileName)
        dispatch(exportCSVSuccess(url))
    }).catch((exception) => {

    });
};



export const downLoadDonorsDetailsCsv = (year,fundType,fundStream,donorType) => (dispatch) => {
    dispatch(exportCSVReset())
    return Api.downLoadCSV(Api.API_DOWNLOAD_CSV_DONORS(year,fundType,fundStream,donorType)).then(resp => {
        const url = window.URL.createObjectURL(resp)
        saveToDisk(url,'donors.csv')
        dispatch(exportCSVSuccess(url))
    }).catch((exception) => {

    });
};

















