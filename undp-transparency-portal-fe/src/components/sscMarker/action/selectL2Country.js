export const SELECT_L2_COUNTRY = 'SELECT_L2_COUNTRY';

export function selectL2Country(data) {
    if (typeof data === typeof {}) {
        return {
            type: SELECT_L2_COUNTRY,
            data
        }
    }

    return {
        type: SELECT_L2_COUNTRY,
        data: {}
    };
}
