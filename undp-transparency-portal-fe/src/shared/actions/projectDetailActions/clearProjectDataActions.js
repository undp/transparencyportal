/////////////////////// Clear Project Data //////////////////////////

export const PROJECT_DATA_CLEAR = {
	clear: 'clear/project_data_clear'
};

export const projectDataClear = () => ({
	type: PROJECT_DATA_CLEAR.clear
});

export const clearProjectData = () => (dispatch, getState) => {
	dispatch(projectDataClear());
};
