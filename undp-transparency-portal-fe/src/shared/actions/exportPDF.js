/************************* Lib Files ************************/
import Api from '../../lib/api';
import {PreviewUrlGenerator, DownloadUrlGenerator} from '../../utils/commonMethods'
export const EXPORT_PDF = {
    start: 'fetch_start/export_pdf',
    end: 'fetch_end/export_pdf',
    success: 'fetch_success/export_pdf',
    failed: 'fetch_failed/export_pdf',
    reset: 'reset/export_pdf'
};
export const exportPDFFetchStart = () => ({
    type: EXPORT_PDF.start
});

export const exportPDFFetchEnd = () => ({
    type: EXPORT_PDF.end
});

export const exportPDFFetchSuccess = (downloadUrl, previewUrl) => (
    {
        type: EXPORT_PDF.success,
        downloadUrl,
        previewUrl
    });

export const exportPDFFetchFailed = (error) => ({
    type: EXPORT_PDF.failed,
    error
});

export const resetExportUrl = () => ({
    type: EXPORT_PDF.reset
})
export const exportPDFCall = (template_name, context_data) => (dispatch) => {
    let params = {
        template_name: template_name,
        context_data: context_data
    }
    dispatch(exportPDFFetchStart());
    return Api.postPDF(Api.API_EXPORTPDF, params).then(resp => {
        dispatch(exportPDFFetchEnd());
        dispatch(exportPDFFetchSuccess(DownloadUrlGenerator(resp.data.file_name), PreviewUrlGenerator(resp.data.file_path)));
    }).catch((exception) => {
        dispatch(exportPDFFetchEnd());
        dispatch(exportPDFFetchFailed(exception));
    });
};