/************************* Project Details Actions ************************/
import { fetchProjectBasicData } from './basicDataActions';
import { fetchProjectBudgetSource } from './budgetSourceActions';
import { fetchProjectBudgetUtilization } from './budgetUtilization';
import { fetchProjectDocumentList } from './documentListActions';
import { fetchProjectOutputList } from './outputListActions';
import { fetchProjectTimeLine } from './timeLineActions';
import { fetchProjectPurchaseOrders } from './purchaseOrderActions';
import { clearProjectData } from './clearProjectDataActions';
import { projectGallery } from './projectGallery';
export const fetchProjectDetailsOnSelection = (projectId) => (dispatch, getState) => {
	dispatch(fetchProjectBasicData(projectId));
	dispatch(fetchProjectTimeLine(projectId));
	dispatch(fetchProjectBudgetSource(projectId));
	dispatch(fetchProjectBudgetUtilization(projectId));
	dispatch(fetchProjectDocumentList(projectId));
	dispatch(fetchProjectOutputList(projectId));
	dispatch(fetchProjectPurchaseOrders(projectId));
	dispatch(projectGallery(projectId));
};

export const clearProjectDetails = () => (dispatch, getState) => {
	dispatch(clearProjectData());
};