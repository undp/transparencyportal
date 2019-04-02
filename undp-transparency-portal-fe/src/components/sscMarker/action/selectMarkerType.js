export const SELECT_SSC_MARKER = 'SELECT_SSC_MARKER';

export function selectSSCMarkerType(data) {
    if (typeof data === typeof {}) {
        return {
            type: SELECT_SSC_MARKER,
            data
        }
    }

    return {
        type: SELECT_SSC_MARKER,
        data: {}
    };
}
