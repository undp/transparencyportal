export const SET_PAGE_HEADER = 'SET_PAGE_HEADER'

const defaultState = {
    title: '',
    subTitle: '',
    breadcrumb: [],
    action: null
}

export default (state = defaultState, action) => {
    const { type, data } = action;
    if (type.toString() === SET_PAGE_HEADER.toString()) {
        return {
            ...defaultState,
            ...data
        }
    }

    return state;
}
