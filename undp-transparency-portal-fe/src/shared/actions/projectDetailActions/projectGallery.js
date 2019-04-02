/************************* Lib Files ************************/
import Api from '../../../lib/api';

/************************* Style Files ************************/
import style from '../../../components/PictureGallery/style';
export const PROJECT_GALLERY = {
	start: 'fetch_start/project_gallery',
	end: 'fetch_end/project_gallery',
	success: 'fetch_success/project_gallery',
	failed: 'fetch_failed/project_gallery'
};

export const projectGalleryFetchStart = () => ({
	type: PROJECT_GALLERY.start
});

export const projectGalleryFetchEnd = () => ({
	type: PROJECT_GALLERY.end
});

export const projectGalleryFetchSuccess = (pictureList) => (
	{
		type: PROJECT_GALLERY.success,
		pictureList
	});

export const projectGalleryFetchFailed = (error) => ({
	type: PROJECT_GALLERY.failed,
	error
});

let parseList = (dataList) => {
	let itemList = dataList.map((item, index) => {
		item.original = item.document_url;
		item.thumbnail = item.document_url;
		item.originalClass = style.image_sizewrapper;
		return item;
	});
	return itemList;
};

export const projectGallery = (project_id) => (dispatch) => {
	dispatch(projectGalleryFetchStart());
	return Api.get(Api.API_PROJECT_DETAIL_GALLERY(project_id)).then(resp => {
		if (resp.success) {
			dispatch(projectGalleryFetchEnd());
			let parsedDataList = parseList(resp.data.data);
			dispatch(projectGalleryFetchSuccess(parsedDataList));
		}
		else {
			dispatch(projectGalleryFetchEnd());
		}
	}).catch((exception) => {
		dispatch(projectGalleryFetchEnd());
		dispatch(projectGalleryFetchFailed(exception));
	});
};