export const SELECT_SSC_COUNTRY = 'SELECT_SSC_COUNTRY';

export function selectSSCCountry(data) {
    if (typeof data === typeof {}) {
        return {
            type: SELECT_SSC_COUNTRY,
            data
        }
    }

    return {
        type: SELECT_SSC_COUNTRY,
        data: {}
    };
}
