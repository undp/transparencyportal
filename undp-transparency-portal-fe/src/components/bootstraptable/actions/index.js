
export const PROJECT_LIST_DATA = {
    start: 'fetch_start/project_list_data',
    end: 'fetch_end/project_list_data',
    success: 'fetch_success/project_list_data',
    failed: 'fetch_failed/project_list_data',
    updateYear: 'update_project_year'
}

export const projectDataFetchStart = () => ({
    type: PROJECT_LIST_DATA.start
})

export const projectDataFetchEnd = () => ({
    type: PROJECT_LIST_DATA.end
})

export const projectDataFetchSuccess = (data) => (
    {
        type: PROJECT_LIST_DATA.success,
        data
    })

export const projectDataFetchFailed = (error) => ({
    type: PROJECT_LIST_DATA.failed,
    error
})

export const updateProjectYear = (year) => ({
    type: PROJECT_LIST_DATA.updateYear,
    year
})

export function getProjectList() {

    return (dispatch, getState) => {
        dispatch(projectDataFetchStart());
      
        fetch('https://open.undp.org/api/v1/project/details/?year=2017', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'dataType': 'json',
            },
            mode: 'no-cors',
            method: 'get'
        }).then((response) => {

            return response.json();
        })
            .then((data) => {

            })
            .catch(function (err) {

            });


    }
}

export function parseProjectList() {

}

