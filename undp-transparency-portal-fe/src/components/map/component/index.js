import { h, Component, render } from "preact";
import style from "./style";
import renderProjectPopUp from "./renderProjectPopUp";
import renderRegionPopUp from "./renderRegionPopUp";
import YearLegend from "./renderYearTimeline";
import PreLoader from "../../preLoader";
import "leaflet/dist/leaflet.css";
import d3 from "d3";
import { flatten } from "lodash";
var L = require("leaflet")
import { polyline } from "leaflet";
import Api from '../../../lib/api';
import getMarkerIcon from "./markerProvider";
import {filterArrayByStartYear} from './../../../utils/commonActionUtils';
import {
    Map,
    Marker,
    Popup,
    TileLayer,
    CircleMarker,
    Rectangle,
    ZoomControl,
    Polygon 
} from "react-leaflet";
require("leaflet.markercluster")
require("eve")
require("imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js")
require("leaflet.bezier")
import "react-leaflet-markercluster/dist/styles.min.css";
import MarkerClusterGroup from "react-leaflet-markercluster";
import MapNoDataTemplate from "./noDataComponent";
import { getSSCMarkerColor, getUniqueLatLngArray } from '../../../utils/commonMethods';
export default class Maps extends Component {
    constructor(props) {
        super(props);
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.state = {
            geojson: this.props.mapData ? this.props.mapData.data : [],
            cluster: false,
            popUp: undefined,
            center: [20, 20],
            bounds: undefined,
            zoom: 3,
            topoLegend: false
        };
        this.mapBoundaryColor = "#808080";
        this.mapEnable = false;
        this.lastSelectedLocation = {'country_iso3': '', 'isSelected': 0};
        this.NumberOfpaths = 0;
        this.selecteMarkerType = 2;
        this.onPlotPaths = false;
        this.lastSelectedMarkerType = {};
        this.lastSelectedL2Country = {'country_iso3': '', 'isSelected': 0};
        this.noZoom = this.props.noZoom;
        this.HQType = false;
        this.isPathDrawn = true;
    }
    
    showPopup = (coordinates, data, type) => {
        this.setState({ popUp: { coordinates: coordinates, ...data, type: type } });
    };
    zoom = e => {

        this.setState({ zoom: e.target._zoom, center: this.map.getCenter(), popUp: false });
        this.map.closePopup();
        if (!this.props.clusterMode && this.state.cluster) {
            if (
                this.props.clusterData.length &&
                this.props.clusterData[0].country_iso3 == "RUS"
            ) {
                if (e.target._zoom < 2 && !this.props.regionMap && this.state.geojson.length > 1) {

                    if (this.props.preventResetMap === undefined) {
                        this.props.resetOutputsMapData();
                    }

                    this.setState({
                        cluster: undefined,
                        bounds: undefined,
                        center: [20, 20]
                    });
                }
            } else {
                if (e.target._zoom < 3 && !this.props.regionMap && this.state.geojson.length > 1) {

                    if (this.props.preventResetMap === undefined) {
                        this.props.resetOutputsMapData();
                    }

                    this.setState({
                        cluster: undefined,
                        bounds: undefined,
                        center: [20, 20]
                    });
                }
            }
        }
    };
    setCenterZoom(code,mapValues) {
        if (code === "RBA") {
            this.setState({ center: [0, 20], zoom: 3 })
        } else if (code === "RBAP") {
            this.setState({ center: [37, 80], zoom: 2 })
        } else if (code === "RBAS" || code === "PAPP") {
            this.setState({ center: [32, 32], zoom: 3 })
        } else if (code === "RBEC") {
            this.setState({ center: [50, 55], zoom: 3 })
        } else if (code === "RBLAC") {
            this.setState({ center: [-2, -67], zoom: 2 })
        } else if (code === "global") {
            this.setState({ center: [0, 0], zoom: 2 })
        } else if (this.noZoom){
            this.setState({ center: (mapValues.data.length === 1 )?[mapValues.data[0].latitude,mapValues.data[0].longitude]:[20,20], zoom: 3 })
        }
        else {
            this.setState({ center: [20, 20], zoom: 3 })
        }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.unit_type === 'HQ' || nextProps.operatingUnitsUnitType === 'HQ' )
            this.HQType = true;
        else
            this.HQType = false;

        if(nextProps.noZoom !== this.props.noZoom){
            this.noZoom = nextProps.noZoom; 
        }    
            
        this.map && this.map.closePopup();
        if (
            !this.props.clusterMode &&
            nextProps.mapData &&
            nextProps.mapData != this.props.mapData
        ) {
            if (nextProps.mapData.data.length == 1 && !nextProps.mapData.loading && !this.noZoom   ) {    
                this.props.loadOutputsMapData(nextProps.mapCurrentYear, nextProps.mapData.data[0].country_iso3? nextProps.mapData.data[0].country_iso3 : '', nextProps.sector, nextProps.source, nextProps.projectId, nextProps.budgetType, nextProps.sdg,this.props.marker,nextProps.currentMarkerSubType.markerSubType,this.props.signatureSolution ==='true'?this.props.sigSolId.selectedSignature:'');
                ( nextProps.noZoom ) ?  (!this.noZoom) ? this.noZoom= true :null :null;
                this.setState({ geojson: nextProps.mapData.data, cluster: true, popup: false })
            }
            
            else {
               
                this.props.resetOutputsMapData();
                this.setState({
                    geojson: nextProps.mapData.data,
                    cluster: false,
                    bounds: undefined,
                    popUp: false,

                });
                
                this.setCenterZoom(nextProps.code,nextProps.mapData)
            }
        }
        if (
            this.props.clusterMode &&
            !this.state.cluster &&
            nextProps.clusterData.length
        )
            this.setState({ cluster: true, geojson: [] });
        if (this.props.regionMap && this.props.resetMap != nextProps.resetMap) {

            this.setState({
                cluster: undefined,
                bounds: undefined,
                popUp: false,
                center: [20, 20],
                zoom: 3
            });
        }
        if (
            nextProps.clusterData.length &&
            this.props.clusterData != nextProps.clusterData &&
            nextProps.clusterData[0].boundaries != null
        ) {
            if (nextProps.clusterData[0].boundaries.geometry.type == "Polygon") {
                let coord = nextProps.clusterData[0].boundaries.geometry.coordinates[0];
                let bounds = polyline(coord).getBounds();
                this.map.fitBounds(bounds)
                this.setState({
                    bounds: [
                        [bounds._northEast.lat, bounds._northEast.lng],
                        [bounds._southWest.lat, bounds._southWest.lng]
                    ],
                    popUp: false
                });
            } else {
                let coord = flatten(
                    flatten(nextProps.clusterData[0].boundaries.geometry.coordinates)
                );
                let bounds = polyline(coord).getBounds();
                this.map.fitBounds(bounds)
                this.setState({
                    bounds: [
                        [bounds._northEast.lat, bounds._northEast.lng],
                        [bounds._southWest.lat, bounds._southWest.lng]
                    ],
                    popUp: false
                });
            }
        }
        /* if(nextProps.isSSCMarker === 'true' && !nextProps.clusterLoading && nextProps.clusterData.length){
            this.updateFlightPath(nextProps.clusterData[0]); 
            return;
        } */
    }
    mapInitialize() {
        this.map = L.map(this.props.mapId ? this.props.mapId : "map", { zoomControl: false, worldCopyJump: true, minZoom: 1 }).setView([20, 20], 3)

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + Api.MAP_API_KEY, {
            id: 'mapbox.light',
            }).addTo(this.map);
        // L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=' + Api.MAP_API_KEY).addTo(this.map);
        this.map.on('zoom', (event) => {
            this.zoom(event)
        })
        !this.props.export &&
            L.control.zoom({
                position: 'topright'
            }).addTo(this.map);
        this.map.scrollWheelZoom.disable();
        this.layers = L.layerGroup();

        if(this.props.isSSCMarker === 'true'){
            this.props.fetchSscMarkerData(this.props.mapCurrentYear);
        }
        
    }
    componentWillMount() {
        this.props.mapId ? d3.select('#' + this.props.mapId).remove() : d3.select('#map').remove();
        this.props.updateMapYearTimeline(this.props.yearSelected);
        if (this.props.clusterMode) {
            this.setState({ cluster: true });
        } else {
            this.props.resetOutputsMapData();
        }
    }
    componentDidMount() {
        this.mapInitialize();
        if (this.props.export && !this.props.clusterLoading) {
            if (this.props.clusterData[0].boundaries.geometry.type == "Polygon") {
                let coord = this.props.clusterData[0].boundaries.geometry.coordinates[0];
                let bounds = polyline(coord).getBounds();
                this.map.fitBounds(bounds)
                this.setState({
                    bounds: [
                        [bounds._northEast.lat, bounds._northEast.lng],
                        [bounds._southWest.lat, bounds._southWest.lng]
                    ],
                    popUp: false
                });
            } else {
                let coord = flatten(
                    flatten(this.props.clusterData[0].boundaries.geometry.coordinates)
                );
                let bounds = polyline(coord).getBounds();
                this.map.fitBounds(bounds)
                this.setState({
                    bounds: [
                        [bounds._northEast.lat, bounds._northEast.lng],
                        [bounds._southWest.lat, bounds._southWest.lng]
                    ],
                    popUp: false
                });
            }
        }
        document.addEventListener('mousedown', this.handleClickOutside);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
        this.map.remove();
    }
    selectCountryCircle(location) {
        if (!this.props.embedCountryRegion || (this.props.embedCountryRegion && this.props.code !== '')) {
            this.props.resetOutputsMapData();
            this.props.loadOutputsMapData(
                this.props.mapCurrentYear,
                location.country_iso3,
                this.props.sector,
                this.props.source,
                this.props.projectId,
                this.props.budgetType,
                this.props.sdg,
                this.props.marker,
                this.props.currentMarkerSubType.markerSubType,
                this.props.signatureSolution ==='true' ? this.props.sigSolId.selectedSignature : '' 
            );
            ( this.props.noZoom ) ?  (this.noZoom)? this.noZoom = !this.noZoom: null :null;
            this.setState({
                zoom: 4,
                popUp: false,
                cluster: location,
                center: [parseFloat(location.latitude), parseFloat(location.longitude)]
            });
            this.props.regionMap &&
                this.props.updateCountryData(location, this.props.currentYear);
            this.props.onCountrySelect && this.props.onCountrySelect(location);
        }
    }
    enableMap() {
        this.map.scrollWheelZoom.enable();
    }
    disableMap(event) {
        this.map.scrollWheelZoom.disable();
    }
    renderCircles(mapData) {
        let _this = this;
        mapData.forEach((location, index) => {
            if(location.unit_type === 'CO'){
                var circleMarker = L.circleMarker([
                    parseFloat(location.latitude),
                    parseFloat(location.longitude)
                ], {
                        radius: this.getRadius(location),
                        weight: 2
                    })
                circleMarker.on('click', (event) => {
                    if(_this.props.isSSCMarker === 'true'){
                        _this.setState({ popUp: false });
                        _this.map.closePopup();
                        if(_this.props.embed){
                            _this.resetFlightMap();
                            _this.drawSelectedCountryPath(location, { country_iso3: '' });
                        }
                        _this.props.onCountrySelect && _this.props.onCountrySelect(location);
                    }  
                    else{
                        this.selectCountryCircle(location);
                    }  
                })
                circleMarker.on('mouseover', (event) => {
                    this.showPopup(
                        [
                            parseFloat(location.latitude),
                            parseFloat(location.longitude)
                        ],
                        location, "circles"
                    );
                })
                this.layers.addLayer(circleMarker);
            }
        })
        this.map && this.layers.addTo(this.map);
    }
    renderMarkers() {
        
        this.markers = L.markerClusterGroup({
            showCoverageOnHover: false,
            iconCreateFunction: function (cluster) {
                return L.divIcon({ html: '<div>' + cluster.getChildCount() + '</div>', className: 'mapCluster', iconSize: L.point(40, 40) });
            }
        });
        this.props.clusterData[0].outputs.map((feature, index) => {
            let marker = L.marker([
                parseFloat(feature.output_latitude),
                parseFloat(feature.output_longitude)
            ], {
                    icon: getMarkerIcon(feature.output_location_class)
                })
                .bindPopup(render(renderProjectPopUp(feature, this.props.embed, this.props.mapCurrentYear, Api.API_BASE)))
            marker.on('click', (event) => {
                marker.openPopup()
            })
            this.markers.addLayer(marker)
        })
        this.map && this.map.addLayer(this.markers)
    }
    renderPopUp() {
        let { type } = this.state.popUp
        if (this.map) {
            this.popup = L.popup()
                .setLatLng(this.state.popUp.coordinates)
                .openOn(this.map)
            this.popup.setContent(render(renderRegionPopUp(this.state.popUp, this.props.embed, Api.API_BASE)))
        }
    }
    drawPolygon() {
        if (
            this.props.clusterData[0].boundaries != null &&
            this.props.clusterData[0].boundaries.geometry.type == "Polygon"
        ) {
            let coord = this.props.clusterData[0].boundaries.geometry.coordinates[0];
            this.layers.addLayer(L.polygon(coord, { stroke: false, fillColor: this.mapBoundaryColor }))
            this.layers.addTo(this.map)
        } else if (
            this.props.clusterData[0].boundaries != null &&
            this.props.clusterData[0].boundaries.geometry.type == "MultiPolygon"
        ) {
            let polygons = [];
            this.props.clusterData[0].boundaries.geometry.coordinates.forEach(
                item => {
                    this.layers.addLayer(L.polygon(item[0], { stroke: false, fillColor: this.mapBoundaryColor }))
                    polygons.push(
                        <Polygon
                            stroke={false}
                            fillColor={this.mapBoundaryColor}
                            positions={item[0]}
                        />
                    );
                }
            );
            this.layers.addTo(this.map)
        }
    }
    getRadius(location) {
        return this.scale(location.total_budget)
    }
    circleMouseOut(e) {
        if (
            !this.popup._wrapper.contains(
                e.originalEvent.relatedTarget
            )
        ) {
            this.setState({ popUp: false });
            this.map.closePopup();
        }
    }
    updateFlightMapPath(){
        if(this.isDrawRecCountryPath() || this.isDrawMarkerTypePath() || this.isDrawL2CountryPath()){
            this.resetFlightMap();
            if(this.props.sscCountry.country_iso3 || this.props.sscL2Country.country_iso3){
                this.drawSelectedCountryPath(this.props.sscCountry, this.props.sscL2Country);
            }else{
                this.NumberOfpaths = 0;
                this.drawFlightMapPath(this.props.sscMarkerType.type);
            }   
        }
    }
    resetFlightMap() {
        let _this = this;
        _.map(this.props.sscMarkerPathData.data, function(item) {
            _.map(item.pathArray, function(path) {
                _this.map.removeLayer(path);
            });
            item.pathArray = [];
        });
    }
    isDrawRecCountryPath(){
        let isReady = false;
        if(this.lastSelectedLocation.country_iso3 !== this.props.sscCountry.country_iso3){
            this.lastSelectedLocation = this.props.sscCountry;
            isReady = true;
        }
        return isReady;
    }
    isDrawMarkerTypePath(){
        let isReady = false;
        if(this.lastSelectedMarkerType.type !== this.props.sscMarkerType.type){
            this.lastSelectedMarkerType = this.props.sscMarkerType;
            isReady = true;
        }
        return isReady;
    }
    isDrawL2CountryPath(){
        let isReady = false;
        if(this.lastSelectedL2Country.country_iso3 !== this.props.sscL2Country.country_iso3){
            this.lastSelectedL2Country = this.props.sscL2Country;
            isReady = true;
        }
        return isReady;
    }
    drawSelectedCountryPath(location, l2Country) {
        if(window.outerWidth <= 767){
            return;
        }
        let _this = this,
            item = _.find(this.props.sscMarkerPathData.data, { 'country_iso3': location.country_iso3}),
            reverseItem = _.find(this.props.sscMarkerPathData.data, { 'country_iso3': l2Country.country_iso3}),
            deep = 8;
        this.isPathDrawn = false;
        
        if(item && !reverseItem){
            item.pathArray = [];
            item.type1Array = [];
            item.type2Array = [];
            item.type3Array = [];
            let slide = 'RIGHT_ROUND';
            if(this.props.sscMarkerType.type === 1 || !this.props.sscMarkerType.type){
                _.map(getUniqueLatLngArray(item.projects.type1), function(o, index) {
                    if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng)){
                        item.type1Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:deep, slide: slide },  {lat: o.lat, lng: o.lng}]);
                        slide = _this.getSlide(slide);
                    }
                });
                _this.drawPath(_this,  item.type1Array, 1, item, '2', 1); 
                deep -= 1;
            }
            if(this.props.sscMarkerType.type === 2 || !this.props.sscMarkerType.type){
                _.map(getUniqueLatLngArray(item.projects.type2), function(o, index) {
                    if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng)){
                        item.type2Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:deep, slide: slide },  {lat: o.lat, lng: o.lng}]);
                        slide = _this.getSlide(slide);
                    }
                });
                _this.drawPath(_this,  item.type2Array, 2, item, '2', 1);
                deep -= 1;
            }
            if(this.props.sscMarkerType.type === 3 || !this.props.sscMarkerType.type){
                _.map(getUniqueLatLngArray(item.projects.type3), function(o, index) {
                    if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng)){
                        item.type3Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:deep, slide: slide },  {lat: o.lat, lng: o.lng}]);
                        slide = _this.getSlide(slide);
                    }
                });
                _this.drawPath(_this,  item.type3Array, 3, item, '2', 1);
            }
            this.lastSelectedLocation = location; 
            this.lastSelectedMarkerType = this.props.sscMarkerType;

            if(item.type1Array.length || item.type2Array.length || item.type3Array.length)
                this.isPathDrawn = true;
        }
        
        if(reverseItem){
            _this.drawReversePath(reverseItem, this, item);
        } 
        this.onPlotPaths = false;
        let centerPos = reverseItem ? reverseItem : item;
        if(centerPos && centerPos.lat && centerPos.lng){
            this.setState({
                popUp: false,
                center: [parseFloat(centerPos.lat), parseFloat(centerPos.lng)]
            }); 
        }
        
        setTimeout(function(){ 
            _this.map.invalidateSize()
        }, 100);
    }
    
    drawFlightMapPath(type){
        if(this.NumberOfpaths){
            return;
        }
        this.NumberOfpaths = 3;
       // this.onPlotPaths = false;
        return;
        let _this = this,
            slide = 'RIGHT_ROUND';
        _.map(this.props.sscMarkerPathData.data, function(item) {
            _.map(item.pathArray, function(path) {
                _this.map.removeLayer(path);
            });        
            item.pathArray = [];
            switch (type) {
                case 1:
                    // Draw path for type 1
                    item.type1Array = [];
                    _.map(getUniqueLatLngArray(item.projects.type1), function(o) {
                        if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng)){
                            item.type1Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:"12", slide: slide },  {lat: o.lat, lng: o.lng}]);
                            slide = _this.getSlide(slide);
                        }
                    });
                    // Draw reverse projects for type 1
                    /* if(item.reverse_projects){
                        _.map(getUniqueLatLngArray(item.reverse_projects.type1), function(o) {
                            if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng)){
                                item.type1Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:"10", slide: slide },  {lat: o.lat, lng: o.lng}]);
                                slide = _this.getSlide(slide);
                            }
                        });
                    } */
                    _this.NumberOfpaths+= item.type1Array.length;
                    _this.drawPath(_this,  item.type1Array, 1, item, '1', 0.8);
                break;
                case 2:
                    // Draw path for type 2
                    item.type2Array = [];
                    _.map(getUniqueLatLngArray(item.projects.type2), function(o) {
                        if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng)){
                            item.type2Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:"8", slide: slide },  {lat: o.lat, lng: o.lng}]);
                            slide = _this.getSlide(slide);
                        }
                    });
                    // Draw reverse projects for type 2
                    /* if(item.reverse_projects){
                        _.map(getUniqueLatLngArray(item.reverse_projects.type2), function(o) {
                            if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng)){
                                item.type2Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:"8", slide: slide },  {lat: o.lat, lng: o.lng}]);
                                slide = _this.getSlide(slide);
                            }
                        });
                    } */
                    _this.NumberOfpaths+= item.type2Array.length;
                    _this.drawPath(_this,  item.type2Array, 2, item, '1', 0.8);
                     
                break;
                case 3:
                    // Draw path for type 3
                    item.type3Array = [];
                    _.map(getUniqueLatLngArray(item.projects.type3), function(o) {
                        if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng)){
                            item.type3Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:"8", slide: slide },  {lat: o.lat, lng: o.lng}]);
                            slide = _this.getSlide(slide);
                        }
                    });
                    // Draw reverse projects for type 3
                    /* if(item.reverse_projects){
                        _.map(getUniqueLatLngArray(item.reverse_projects.type3), function(o) {
                            if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng)){
                                item.type3Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:"8", slide: slide },  {lat: o.lat, lng: o.lng}]);
                                slide = _this.getSlide(slide);
                            }
                        });
                    } */
                    _this.NumberOfpaths+= item.type3Array.length;
                    _this.drawPath(_this,  item.type3Array, 3, item, '1', 0.8);
                break;
            }
            
        });
        this.onPlotPaths = false;
        if(this.NumberOfpaths)
            this.isPathDrawn = true;
    }
    /////////////
    drawReversePath(item, _this, parentItem) { 
        if(item.reverse_projects){
            item.typeR1Array = [];
            item.typeR2Array = [];
            item.typeR3Array = [];
            let slide = 'RIGHT_ROUND',
                deep = 8;
            if(this.props.sscMarkerType.type === 1 || !this.props.sscMarkerType.type){
                if(!parentItem){
                    _.map(getUniqueLatLngArray(item.reverse_projects.type1), function(o) {
                        if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng)){
                            item.typeR1Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:deep, slide: slide },  {lat: o.lat, lng: o.lng}]);
                            slide = _this.getSlide(slide);
                        } 
                    });
                    deep -= 1;
                }else{
                    _.map(getUniqueLatLngArray(item.reverse_projects.type1), function(o) {
                        if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng) && Number(parentItem.lat) === Number(o.lat) && Number(parentItem.lng) === Number(o.lng)){
                            item.typeR1Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:deep, slide: slide },  {lat: o.lat, lng: o.lng}]);
                            slide = _this.getSlide(slide);
                        } 
                    });
                    deep -= 1;
                }
                _this.drawPath(_this,  item.typeR1Array, 1, item, '2', 1);
            }

            if(this.props.sscMarkerType.type === 2 || !this.props.sscMarkerType.type){
                if(!parentItem){
                    _.map(getUniqueLatLngArray(item.reverse_projects.type2), function(o) {
                        if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng)){
                            item.typeR2Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:deep, slide: slide },  {lat: o.lat, lng: o.lng}]);
                            slide = _this.getSlide(slide);
                        } 
                    });
                    deep -= 1;
                }else{
                    _.map(getUniqueLatLngArray(item.reverse_projects.type2), function(o) {
                        if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng) && Number(parentItem.lat) === Number(o.lat) && Number(parentItem.lng) === Number(o.lng)){
                            item.typeR2Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:deep, slide: slide },  {lat: o.lat, lng: o.lng}]);
                            slide = _this.getSlide(slide);
                        } 
                    });
                    deep -= 1;
                }
                _this.drawPath(_this,  item.typeR2Array, 2, item, '2', 1);
            }
           
            if(this.props.sscMarkerType.type === 3 || !this.props.sscMarkerType.type){
                if(!parentItem){
                    _.map(getUniqueLatLngArray(item.reverse_projects.type3), function(o) {
                        if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng)){
                            item.typeR3Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:deep, slide: slide },  {lat: o.lat, lng: o.lng}]);
                            slide = _this.getSlide(slide);
                        }
                    });
                    deep -= 1;
                }else{
                    _.map(getUniqueLatLngArray(item.reverse_projects.type3), function(o) {
                        if(Number(item.lat) !== Number(o.lat) && Number(item.lng) !== Number(o.lng) && Number(parentItem.lat) === Number(o.lat) && Number(parentItem.lng) === Number(o.lng)){
                            item.typeR3Array.push([{lat: Number(item.lat), lng:Number(item.lng), deep:deep, slide: slide },  {lat: o.lat, lng: o.lng}]);
                            slide = _this.getSlide(slide);
                        }
                    });
                }
                _this.drawPath(_this,  item.typeR3Array, 3, item, '2', 1);
            }   
            if(item.typeR1Array.length || item.typeR2Array.length || item.typeR3Array.length)
                this.isPathDrawn = true;
        }
    }
    drawPath(_this, array, type, item, weight, opacity){
        if(array.length){
            let dash_straight = {
                color: getSSCMarkerColor(type),
                opacity: opacity,
                weight: weight,
            };
            let newFlightPath = L.bezier({
                path:  array,
                icon: {
                    path: ""
                }
            }, dash_straight).addTo(_this.map);   
            if(item.pathArray){
                item.pathArray.push(newFlightPath);
            }else{
                item.pathArray = [];
                item.pathArray.push(newFlightPath);
            }
        }
    }

    handleClickOutside(event) {
        if ( (this.props.marker || this.props.isSSCMarker) && 
            this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            this.setState({ popUp: false });
            this.map.closePopup();
        }
    }
    
    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    getSlide(slide){
        return slide === 'RIGHT_ROUND' ? 'LEFT_ROUND' : 'RIGHT_ROUND';
    }
    clearFlightPath() {
        let _this = this;
        _.map(this.props.sscMarkerPathData.data, function(item) {
            _.map(item.pathArray, function(path) {
                _this.map.removeLayer(path);
            });
        });
    }
    toggleTopLegend() {
        this.setState(prevState => ({
            topoLegend: !prevState.topoLegend
          }))
    }

    updateProjectYear(year){
        this.props.setCurrentYear(year);
        this.props.setMapCurrentYear(year);
        this.props.searchCountryRegionsListData('', this.props.sector, this.props.sdg, this.props.source, year);
    }

    render() {

        let mapData = this.state.geojson;
        if (this.state.cluster) {
            mapData = []
        }
        if (mapData.length > 0) {
            let min = d3.min(mapData, function (d) { return parseInt(d.total_budget) })
            let max = d3.max(mapData, function (d) { return parseInt(d.total_budget) })
            let scale = d3.scale.linear()
                .domain([min, max])
                .range([10, 50])
            this.scale = scale
        }
        if (this.map) {
            !this.state.popUp && !this.state.bounds && this.map.setView(this.state.center, this.state.zoom)
            this.markers && !this.state.popUp && this.markers.clearLayers()
            this.layers && !this.state.popUp && this.layers.clearLayers()
            mapData != undefined && !this.state.popUp && this.renderCircles(mapData);
            this.state.cluster && this.props.clusterData[0] && !this.state.popUp ? this.renderMarkers() : null;
            this.state.cluster && this.props.clusterData[0] && this.drawPolygon()
            this.state.popUp && this.renderPopUp();
    
            if(!this.props.sscMarkerPathData.loading && this.props.isSSCMarker){
                if(this.props.sscCountry.country_iso3 || this.props.sscL2Country.country_iso3){
                    this.updateFlightMapPath(this.props.sscMarkerType.type);
                }else{
                    if(this.props.sscMarkerPathData.data.length){
                        if(this.props.sscMarkerType.type !== this.lastSelectedMarkerType.type){
                            this.NumberOfpaths = 0;
                            this.lastSelectedMarkerType = this.props.sscMarkerType;
                        }
                        if(this.lastSelectedL2Country.country_iso3 !== this.props.sscL2Country.country_iso3 
                            || this.props.sscCountry.country_iso3 !== this.lastSelectedLocation.country_iso3){
                                this.NumberOfpaths = 0;
                                this.lastSelectedL2Country = this.props.sscL2Country;
                                this.lastSelectedLocation = this.props.sscCountry;
                            }
                        this.drawFlightMapPath(this.props.sscMarkerType.type ? this.props.sscMarkerType.type : 2);
                    }
                }  
            }
            if(this.props.sscMarkerPathData.loading && 
                this.props.isSSCMarker && 
                !this.onPlotPaths && 
                (this.props.sscCountry.country_iso3 || this.props.sscL2Country.country_iso3) ){
               this.onPlotPaths = true;
            }
        }
        return (
            <div
                class={this.props.mapModal? style.mapModal : style.mapContainer}
                onMouseEnter={event => this.disableMap(event)}
                onTouchStart={event => this.disableMap(event)}
                onClick={() => this.enableMap()}>

                {this.props.export && <div class={style.mapOverlay}></div>}
                <div ref={this.setWrapperRef} id={this.props.mapId ? this.props.mapId : "map"} style={{ height: '100%', cursor: 'pointer' }}>
                    {this.props.mapData.loading || this.props.clusterLoading || this.onPlotPaths ? (
                        <PreLoader />
                    ) : (!this.props.clusterMode && mapData.length>0) ||
                        this.state.cluster || this.HQType ||(this.props.marker && (this.props.mapData.regionalCenter) )? null : ( 
                                <div class={style.noDataTemplateWrapper}>
                                    <MapNoDataTemplate />
                                </div>
                            )}
                        {this.props.isSSCMarker && !this.isPathDrawn ? 
                            <div class={style.noDataTemplateWrapper}>
                                <MapNoDataTemplate />
                            </div>
                            :
                            null
                        }
                </div>
                {
                    this.state.cluster ?
                        <div>
                            <label for="legend" class={ this.props.mapId === 'map-zoom' ? style.zoomInfo : style.info}  onClick={()=>this.toggleTopLegend()}>
                            </label>
                            <div class={style.legendToggle}/>
                            <div class={this.state.topoLegend? ( this.props.mapId === 'map-zoom' ? style.info_popup_open_zoom : style.info_popup_open) : style.info_popup_closed}>
                                <ul class={`${this.props.projectTopoIconsLegend} ${style.topoIconsLegend} `} ref={(node) => this.topoLegend = node}>
                                    <li>
                                        <img src="../../../assets/icons/Administrative_Region.svg" alt="info icon" />
                                        <span>Administrative Region</span>
                                    </li>
                                    <li>
                                        <img src="../../../assets/icons/Populated_Place.svg" alt="info icon" />
                                        <span>Populated Place</span>
                                    </li>
                                    <li>
                                        <img src="../../../assets/icons/Structure.svg" alt="info icon" />
                                        <span>Structure</span>
                                    </li>
                                    <li>
                                        <img src="../../../assets/icons/Other_Topographical.svg" alt="info icon" />
                                        <span>Other Topographical Feature</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        :
                        null
                }
 
                {this.props.enableTimeline && this.props.isSSCMarker !== 'true'? (
                    <YearLegend
                        data={this.props.startYear ? filterArrayByStartYear(this.props.yearList,this.props.startYear)
                                                    :this.props.yearList}
                        mapCurrentYear={this.props.mapCurrentYear}
                        setYear={this.props.projects!=='true'? year => this.props.setMapCurrentYear(year) :year => this.updateProjectYear(year)}
                        tabSel={this.props.tabSel}
                    />
                ) : null}
            </div>
        );
    }
    
}