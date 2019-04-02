export const SELECT_SSC_COUNTRY = 'SELECT_SSC_COUNTRY'

const defaultState = {
    country_iso3: '',
    isSelected : 0
}

export default (state = defaultState, action) => {
    const { type, data } = action;
    if (type.toString() === SELECT_SSC_COUNTRY.toString()) {
        return {
            ...defaultState,
            ...data
        }
    }

    return state;
}
