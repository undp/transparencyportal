export const SELECT_L2_COUNTRY = 'SELECT_L2_COUNTRY'

const defaultState = {
    country_iso3: '',
    isSelected : 0,
    name
}

export default (state = defaultState, action) => {
    const { type, data } = action;
    if (type.toString() === SELECT_L2_COUNTRY.toString()) {
        return {
            ...defaultState,
            ...data
        }
    }

    return state;
}
