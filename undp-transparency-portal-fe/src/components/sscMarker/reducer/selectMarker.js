export const SELECT_SSC_MARKER = 'SELECT_SSC_MARKER'

const defaultState = {
    type: ''
}

export default (state = defaultState, action) => {
    const { type, data } = action;
    if (type.toString() === SELECT_SSC_MARKER.toString()) {
        return {
            ...defaultState,
            ...data
        }
    }

    return state;
}
