export const SET_PAGE_HEADER = 'SET_PAGE_HEADER';

export function setPageHeader(data) {
    if (typeof data === typeof {}) {
        return {
            type: SET_PAGE_HEADER,
            data
        }
    }

    return {
        type: SET_PAGE_HEADER,
        data: {}
    };
}
