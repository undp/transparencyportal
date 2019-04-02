import Api from '../../../../lib/api';

export const RECIPIENT_DOCUMENTS = {
    start: 'fetch_start/recipient_documents',
    end: 'fetch_end/recipient_documents',
    success: 'fetch_success/recipient_documents',
    failed: 'fetch_failed/recipient_documents'
}

export const recipientDocumentsFetchStart = () => ({
    type: RECIPIENT_DOCUMENTS.start
})

export const recipientDocumentsFetchEnd = () => ({
    type: RECIPIENT_DOCUMENTS.end
})

export const recipientDocumentsFetchSuccess = (data,categoryList) => (
    {
        type: RECIPIENT_DOCUMENTS.success,
        data,
        categoryList
    })

export const recipientDocumentsFetchFailed = (error) => ({
    type: RECIPIENT_DOCUMENTS.failed,
    error
})


export const createDocumentCategoryList = (dataArray) => {
    let array = [];
    dataArray.forEach((item) => {
        if (array.length !== 0) {
            let flag = true;
            array.forEach((data) => {
                if (data.label == item.category_name) {
                    flag = false
                }
            })
            if (flag) {
                array.push({
                    label: item.category_name,
                    value: item.category
                })
            }
        }
        else {
            array.push({
                label: item.category_name,
                value: item.category
            })
        }

    })
    return array
}



export const fetchRecipientDocuments = (code, year, category) => {
    return (dispatch,getState) => {
        let  categoryList = [];   
        dispatch(recipientDocumentsFetchStart())
        category = !category?'':category;
        if(year!==null) {
            return Api.get(Api.API_RECIPIENT_COUNTRTY_DOCUMENTS(code, year, category)).then(resp => {
                if (resp.success && resp.data) {
                    if(category==''){
                         categoryList = createDocumentCategoryList(resp.data.data)
                    }
                    else{
                        categoryList =  getState().recipientProfile.documentList.categoryList
                    }
                    dispatch(recipientDocumentsFetchEnd())
                    dispatch(recipientDocumentsFetchSuccess(resp.data,categoryList))
                } else {
                    dispatch(recipientDocumentsFetchEnd())
                }
            }).catch((exception) => {
                dispatch(recipientDocumentsFetchEnd())
                dispatch(recipientDocumentsFetchFailed(exception))
            });
        }
    }
}



