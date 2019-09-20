import { connect } from 'preact-redux';
import Map from './component';
import { updateMapYearTimeline, setMapCurrentYear } from '../../shared/actions/mapActions/yearTimeline';
import { loadOutputsMapData, resetOutputsMapData } from '../../shared/actions/mapActions/fetchMapOutputs';
import { updateCountryData, fetchGlobalData } from '../../shared/actions/countryData';
import {updateYearList, setCurrentYear} from '../../shared/actions/getYearList';
import commonConstants from '../../utils/constants';
import { fetchSscMarkerData } from '../../components/sscMarker/action';
import { searchCountryRegionsListData } from '../../shared/actions/countryRegionSearch';

const mapStateToProps = (state) => {
  
    const yearList = state.mapData.yearTimeline.list;
    const { mapCurrentYear } = state.mapData.yearTimeline;
    const { data: clusterData, loading: clusterLoading } = state.mapData.outputData;
    const countryData = state.countryData;
    const sscMarkerPathData = state.sscMarkerPathData;
    const sscCountry = state.sscCountry;
    const sscMarkerType = state.sscMarkerType;
    const sscL2Country = state.sscL2Country;
    const currentMarkerSubType = state.markerSubTypeSelected;
    const currentCountry = state.countrySelected;
    const sigSolId = state.selectedSignatureSolution;

    return {
        countryData,
        yearList,
        clusterData,
        clusterLoading,
        mapCurrentYear,
        sscMarkerPathData,
        sscCountry,
        sscMarkerType,
        currentMarkerSubType,
        sscL2Country,
        sigSolId,
        currentCountry
    }

}

const mapDispatchToProps = (dispatch) => {
    return {
        updateCountryData: (data, year) => dispatch(updateCountryData(data, year)),
        updateMapYearTimeline: (year) => dispatch(updateMapYearTimeline(year)),
        setMapCurrentYear: (year) => dispatch(setMapCurrentYear(year)),
        fetchGlobalData: (year) => dispatch(fetchGlobalData(year)),
        loadOutputsMapData: (year, unit, sector, source, project_id, budget_type, sdg,marker,markerSubType,signatureSol,sdgTarget) => dispatch(loadOutputsMapData(year, unit, sector, source, project_id, budget_type, sdg,marker,markerSubType,signatureSol,sdgTarget)),
        resetOutputsMapData: () => dispatch(resetOutputsMapData()),
        fetchSscMarkerData: year => dispatch(fetchSscMarkerData(year)),
        setCurrentYear: (year) => dispatch(setCurrentYear(year)),
        searchCountryRegionsListData: (searchParam, theme, sdg, donor, year) => dispatch(searchCountryRegionsListData(searchParam, theme, sdg, donor, year))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);
