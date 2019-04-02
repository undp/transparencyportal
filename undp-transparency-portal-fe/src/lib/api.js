

class Api {
	static headers() {
		return {
      'Accept': 'application/json',
			'Content-Type': 'application/json'
		};
	}

	static headerForceDownLoad(){
		return{
			'Content-Type': 'text/csv'
		};
	}


	// static headerPDF() {
	//   return {
	// 		'Accept': 'application/octet-stream',
	//     'Content-Type': 'application/octet-stream',
	// 	};
	// }
	static get(route) {
		return this.xhr(route, undefined, 'GET');
	}
	static put(route, params) {
		return this.xhr(route, params, 'PUT');
	}

	static post(route, params) {
		return this.xhr(route, params, 'POST');
	}
	static postPDF(route, params) {
		return this.xhrPDF(route, params, 'POST');
	}

	static downLoadCSV(route, params) {
		return this.xhrCSV(route, params, 'GET');
	}

	static delete(route, params) {
		return this.xhr(route, params, 'DELETE');
	}

	static xhr(route, params, verb) {
		const options = Object.assign({ method: verb });
		options.headers = Api.headers();
    options.body = JSON.stringify(params);
    options.mode = 'cors';
		return fetch(Api.API_BASE + route, options).then(resp => {
			let json = resp.json();
			if (resp.ok) {
				return json;
			}
			return json.then(err => { throw err; });
		}).then(json => json);
	}

	static xhrCSV(route, params, verb) {
		const options = Object.assign({ method: verb });
    options.headers = Api.headerForceDownLoad();
    options.mode = 'cors';
		// options.body = JSON.stringify(params);
		return fetch(Api.API_BASE + route, options).then(resp => {
			let blob = resp.blob();
			return blob;
		}).then(blob => blob);
	}

	static xhrPDF(route, params, verb) {
		const options = Object.assign({ method: verb });
		options.headers = Api.headers();
    options.body = JSON.stringify(params);
    options.mode = 'cors';
		return fetch(Api.API_BASE + route, options).then(resp => {
			let json = resp.json();
			if (resp.ok) {
				return json;
			}
			return json.then(err => { throw err; });
		}).then(json => json);
	}

  /// API LISTS
  static API_BASE = 'https://api.open.undp.org';
  static API_LOCAL = 'https://open.undp.org/' // QA    Original

  static DOWNLOAD_PDF = (path) => Api.API_BASE + '/api/v1/undp/export_download_pdf?file=' + path
  static DOWNLOAD_CSV = (path) => Api.API_BASE + '/api/v1/undp/export_csv?file=' + path
  static GA_TRACKING_ID = ' UA-24131528-32' // Client
 
  // static GA_TRACKING_ID = 'UA-114441614-1' // QA
  static MAP_API_KEY = 'pk.eyJ1IjoidW5kcG9yZyIsImEiOiJjaWc5cmJmcWwwMDRxdjJrcjgxbnczaThvIn0.J-5uk4LED0EgvK1raqCJmg'

  static API_PROJECT_LIST = (year, operatingUnit, budgetSource, themes, keyword, limit, offset, budget_type, sdg,target,signatureSolution) => `/api/v1/project/list/?budget_sources=${budgetSource}&keyword=${keyword}&limit=${limit}&offset=${offset}&operating_units=${operatingUnit}&sectors=${themes}&year=${year}&budget_type=${budget_type}${target ? ('&sdg_targets='+ target) :  ('&sdgs=' + sdg )}&signature_solution=${signatureSolution}`;
  static API_PROJECT_AGGREGATE = '/api/v1/project/project_aggregate/?year='
  static API_YEAR_LIST = '/api/v1/master/project_time_line'
  static API_COUNTRY_LIST = '/api/v1/master/country?&donor='
  static API_THEME_LIST = '/api/v1/master/sector'
  static API_SIGNATURE_LIST = '/api/v1/master/sector'
  static API_PROJECT_TIMELINE_RANGE = '/api/v1/master/project_time_line'
  static API_THEME_AGGREGATE = '/api/v1/project/sector_aggregate/?year='
  static API_SIGNATURE_AGGREGATE = '/api/v1/project/signature_solutions_aggregate/?year='
  static API_SDG_AGGREGATE = (year, operatingUnit, budgetSources) => '/api/v1/project/sdg_aggregate/?year=' + year + '&operating_unit=' + operatingUnit + '&budget_source=' + budgetSources
  static API_DONOR_SLIDER_DATA = (year, sector, operatingUnits, budgetSources) => '/api/v1/sector/details?year=' + year + '&sector=' + sector + '&operating_unit=' + operatingUnits + '&budget_source=' + budgetSources
  static API_DONOR_SDG_DATA = (year, sdg, operatingUnits, budgetSources) => '/api/v1/project/signature_solutions/'+sdg+'/details?year=' + year + '&ss_id=' + sdg + '&operating_unit=' + operatingUnits + '&budget_source=' + budgetSources
  static API_SIGNATURE_SLIDER_DATA = (year, sector, operatingUnits, budgetSources) => '/api/v1/project/signature_solutions/'+sector+'/details?year=' + year + '&ss_id=' + sector + '&operating_unit=' + operatingUnits + '&budget_source=' + budgetSources
  static API_SDG_SLIDER_DATA = (year, sdg, operatingUnits, budgetSources) => '/api/v1/project/sdg/details?year=' + year + '&sdg=' + sdg + '&operating_unit=' + operatingUnits + '&budget_source=' + budgetSources
  static API_SDG_SUNBURST_DATA = (year) => '/api/v1/project/sdg?year=' + year
  static API_SDG_TARGET_PERCENTAGE_DATA = (year, sdg) => '/api/v1/project/sdg_target?year=' + year + '&sdg=' + sdg;
  static API_SDG_TARGET_DATA = (year,targetId) => '/api/v1/project/sdg_target/details?year=' +year+'&sdg_target=' + targetId
  static API_ABOUT = '/api/v1/about_us/list'
  ////////////////////  RECIPIENT PROFILE  ////////////////////
  static API_RECIPIENT_COUNTRY_BASIC = (code, year) => '/api/v1/project/recipient_profile/' + code + '/?year=' + year;
  /**abcdefg*/
  static API_RECIPIENT_COUNTRY_THEME = (code, year) => '/api/v1/global/themes?year=' + year + '&operating_unit=' + code;
  
  
  static API_RECIPIENT_COUNTRY_SDG = (code, year) => '/api/v1/project/recipient_profile/' + code + '/sdg?year=' + year;


  static API_RECIPIENT_COUNTRTY_DOCUMENTS = (code, year, category) => '/api/v1/project/recipient_profile/' + code + '/documents?year=' + year + '&category=' + category;
  static API_RECIPIENT_COUNTRTY_TOP_BUDGET_SOURCES = (code, year) => '/api/v1/donor/recipient_budget_sources/?year=' + year + '&operating_unit=' + code
  static API_RECIPIENT_WIND_ROSE = (code, year, sector) => '/api/v1/project/country_result/?year=' + year + '&operating_unit=' + code + '&sector=' + sector
//   static API_RECIPIENT_BUDGET_VS_EXPENSE = (code, year) => '/api/v1/project/recipient_profile/' + code + '/theme/budget_vs_expense?year=' + year;
  // static API_RECIPIENT_BUDGET_VS_EXPENSE_SDG = (code, year) => '/api/v1/project/recipient_profile/' + code + '/sdg/budget_vs_expense?year=' + year;
  static API_RECIPIENT_BUDGET_VS_EXPENSE_SDG = (code,year) => '/api/v1/project/recipient_profile/' + code +'/sdg?year=' + year;  
  static API_RECIPIENT_BUDGET_VS_EXPENSE = (code, year) => '/api/v1/global/themes?year=' + year + '&operating_unit=' + code;
  /////////////////////////////////////////////////////////////////////
  ////////////////////  DONOR PROFILE  ////////////////////
  static API_DONOR_COUNTRY_BASIC = (code, year) => '/api/v1/donor/aggregate?year=' + year + '&country=' + code;
  static API_DONOR_REGULAR_AND_OTHERS = (code, year) => '/api/v1/donor/fund_modality?year=' + year + '&country=' + code;
  static API_RECIPIENT_RESOURCES_MODALITY_CONTRIBUTION = (code, year) => '/api/v1/donor/fund_modality?year=' + year + '&country=' + code + '&group_by=1';
  static API_SDG_BAR_CHART = (code, year) => '/api/v1/donor/fund_modality?year=' + year + '&country=' + code + '&group_by=1';
  static API_SIGNATURE_OUTCOME = (code, year) => '/api/v1/project/signature_solutions/1/outcomes?year='+year+'&ss_id='+code;
  static API_FETCH_SIGNATURE_SOLUTION_CHART_DATA = (code,year) => '/api/v1/project/sector/1/signature_solution?year='+year+'&code='+code;
  static RECIPIENT_TOP_OFFICES = (code, year) => '/api/v1/donor/top_recipient_offices?year=' + year + '&donor=' + code
  static API_DONOR_TYPES = '/api/v1/master/donor_types';
  static API_FUND_STREAMS = '/api/v1/master/fund_streams';
  static API_SDGS = '/api/v1/master/sdg';

  static API_DONOR_BUDGET_SOURCES = (code, year) => '/api/v1/donor/budget_sources?year=' + year + '&donor_level_3_code=' + code
  // static API_RECIPIENT_WIND_ROSE = (code, year, sector) => "/api/v1/project/country_result/?year=" + year + "&operating_unit=" + code + "&sector=" + sector
  /////////////////////////////////////////////////////////////////////
  ////////////////////      FINANCIAL_FLOW         ////////////////////
  static API_BUDGET_FINANCIAL_FLOW = (year) => '/api/v1/donor/sankey_budget?year=' + year;
  static API_EXPENSE_FINANCIAL_FLOW = (year) => '/api/v1/donor/sankey_expense?year=' + year;
  /////////////////////////////////////////////////////////////////////
  ////////////////////  PROJECT DETAILS API LISTS  ////////////////////
  static API_PROJECT_DETAILS = '/api/v1/project/details/'
  static API_PROJECT_BUDGET_SOURCE = (project_id) => '/api/v1/project/' + project_id + '/budget_sources'
  static API_PROJECT_BUDGET_UTILIZATION = (project_id) => '/api/v1/project/' + project_id + '/budget_utilization'
  static API_PROJECT_DOCUMENT_LIST = (project_id, category) => '/api/v1/project/' + project_id + '/documents'
  static API_PROJECT_DOCUMENT_LIST_FILTERED = (project_id, category) => '/api/v1/project/' + project_id + '/documents?search=&category=' + category
  static API_PROJECT_OUTPUT_LIST = (project_id) => '/api/v1/output/list?project=' + project_id
  static API_PROJECT_OUTPUT_DETAIL = (project_id) => '/api/v1/output/details/' + project_id
  static API_MARKER_DETAIL = (project_id) => '/api/v1/output/markers/' + project_id
  static API_PROJECT_OUTPUT_RESULTS = (project_id) => '/api/v1/output/' + project_id + '/results'
  static API_PROJECT_TIME_LINE = (project_id) => '/api/v1/project/' + project_id + '/timeline'
  static API_PROJECT_PURCHASE_ORDERS = (project_id) => '/api/v1/purchase_order/list?year=&project_id=' + project_id
  /////////////////////////////////////////////////////////////////////
  static API_OPERATING_UNITS = '/api/v1/master/budget_sources';
  static API_DONOR_FUND_LIST = '/api/v1/donor/fund_aggregate/';
  static API_PROJECT_DETAIL_GALLERY = (project_id) => '/api/v1/project/' + project_id + '/pictures';
  /////////////////////////// MAP APIs ///////////////////////////////////
  static API_MAP_GLOBAL = (year, unit) => '/api/v1/project/map?year=' + year + '&operating_unit=' + unit ;
  static API_MAP_PROJECT_LIST = (year, sector, unit, source, sdg, marker, marker_id, levelTwoMarker) => '/api/v1/project/map?year=' + year + '&operating_unit=' + unit + '&budget_source=' + source + '&sector=' + sector + '&sdg=' + sdg +'&marker_type=' + marker+'&marker_id='+marker_id+'&level_two_marker='+levelTwoMarker;
  static API_MAP_PROJECT_DETAIL = (project_id) => '/api/v1/project/map?project_id=' + project_id
  static API_MAP_THEMES = (year, sector, unit, source,signatureSolution) => '/api/v1/project/map?year=' + year + '&operating_unit=' + unit + '&budget_source=' + source + '&sector=' + sector + '&signature_solution=' + signatureSolution;
  static API_MAP_SIGNATURE = (year, sector, unit, source) => '/api/v1/project/map?year=' + year + '&operating_unit=' + unit + '&budget_source=' + source + '&signature_solution=' + sector
  static API_MAP_DONORS = (year, unit, sector, source, sdg) => '/api/v1/project/map?year=' + year + '&operating_unit=' + unit + '&sector=' + sector + '&budget_source=' + source + '&sdg=' + sdg;
  static API_MAP_SDG = (year, sdg, unit, source, tab) => '/api/v1/project/map?year=' + year + '&operating_unit=' + unit + '&sdg=' + sdg + '&budget_source=' + source + '&tab=' + tab;
  static API_MAP_RECIPIENT = (year, unit) => '/api/v1/project/map?year=' + year + '&operating_unit=' + unit;
  static API_MAP_OUTPUTS = (year, unit, sector, source, project_id, budget_type, sdg,marker,markerSubtype,sigSoln) => '/api/v1/project/map?year=' + year + '&operating_unit=' + unit + '&sector=' + sector + '&project_id=' + project_id + '&sdg=' + sdg + '&budget_source=' + source + '&budget_type=' + budget_type + '&provide_output=1' + '&marker_type='+marker +'&marker_id='+ markerSubtype+'&signature_solution='+sigSoln;
  static API_MAP_DONOR = (year, source, budget_type) => '/api/v1/project/map?year=' + year + '&budget_source=' + source + '&budget_type=' + budget_type ;
  static API_MAP_SDG_TARGETS =(year, target, unit, source, tab) => '/api/v1/project/map?year=' + year + '&sdg_target=' + target;
  ////////////////////////////////////////////////////////////////////////
  static API_DONOR_DATA = '/api/v1/donor/contribution/'
  static API_THEME_SLIDER = (year, sector) => '/api/v1/sector/details?year=' + year + '&sector=' + sector
  /////////////////SEARCH API ///////////////
  static API_SEARCH_RESULT = '/api/v1/project/search_full_text/?';
  /////////////////////////////////
  static API_GLOBAL_TOP_BUDGET_SOURCES = (year, code) => '/api/v1/donor/top_budget_sources?year=' + year + '&operating_unit=' + code
  static API_GLOBAL_THEMES_BUDGET = (year, code) => '/api/v1/global/themes?year=' + year + '&operating_unit=' + code
  static API_DOCUMENT_CATEGORY_FILTER = '/api/v1/master/document_categories'
  static API_COUNTRYREGION_SEARCH = (search, theme, sdg, donor, currentYear) => '/api/v1/master/country_regions?search=' + search + '&sector=' + theme + '&sdg=' + sdg + '&donor=' + donor + '&year=' + currentYear;
  static API_SIGNATURE_COUNTRYREGION_SEARCH = (search, theme, sdg, donor, currentYear) => '/api/v1/master/country_regions?search=' + search + '&ss_id=' + theme + '&sdg=' + sdg + '&donor=' + donor + '&year=' + currentYear
  static API_COUNTRYREGION_MASTER = '/api/v1/master/country_regions';
  static API_LAST_UPDATED = '/api/v1/admin_log/last_modified';
  static API_EXPORTPDF = '/api/v1/undp/export_pdf/?'
  static API_DOWNLOAD_CSV_PROJECT_LISTS = (year,keyword,source,sectors,units,sdgs,type,signatureSolution,target,markerId,markerSubType,l2marker) => '/api/v1/undp/export_csv/?' +'year='+year +'&keyword='+keyword+'&budget_sources=' + source + '&operating_units=' + units+'&sdgs='+sdgs+'&budget_type='+type+'&sectors='+sectors+'&signature_solution='+signatureSolution+'&sdg_target='+target+'&marker_type='+markerId+'&marker_id='+markerSubType+'&level_two_marker='+l2marker;
  // static API_DOWNLOAD_CSV_PROJECT_LISTS = (year,keyword,source,sectors,units,sdgs,type,signatureSolution,target) => '/api/v1/undp/export_csv/?' +'year='+year +'&keyword='+keyword+'&budget_sources=' + source + '&operating_units=' + units+'&sdgs='+sdgs+'&budget_type='+type+'&sectors='+sectors+'&signature_solution='+signatureSolution+'&sdg_target='+target;
  static API_DOWNLOAD_CSV_PROJECT_DETAILS = (projectId,item,search,category) => '/api/v1/undp/export_csv/projectdetails/?' +'project_id='+projectId +'&item='+item+'&search='+search+'&category='+category;
  static API_DOWNLOAD_CSV_DONORS = (year,fundType,fundStream,donorType) => '/api/v1/undp/export_donors_csv?' +'year='+year +'&fund_type='+fundType+'&fund_stream='+fundStream+'&donor_type='+donorType;
  static API_FETCH_SDG_TARGETS = (year,sdgTargetId) => '/api/v1/project/sdg_target/details?year='+year+'&sdg_target='+sdgTargetId ;
  static API_SSC_MARKER_PATH = '/api/v1/output/flight_map';
  static API_MARKER_DATA = (year, markerType, country,markerId,level2Marker) => '/api/v1/output/marker_aggregate/' + country + '?year=' +year+'&type=' + markerType+'&level_two_marker='+level2Marker+'&marker_id=' +markerId;
  static API_MARKER_DESCRIPTION_DATA = (year,type,country,markerId) => {
    if (type!==5) {
        return '/api/v1/output/marker_details/?year='+year+'&type='+type+(country ? ('&operating_unit='+country): '') + '&marker_id=' + markerId;
    } 
        return '/api/v1/output/partner_description?year='+year+(country ? ('&operating_unit='+country): '')+ '&description=' + markerId;
               
  }
  static API_MARKER_BARCHART_DATA = (year, type, country, marker_id, levelTwoMarker) => '/api/v1/output/marker/details?year='+year + '&marker_type='+type+'&operating_unit='+country+'&marker_id='+marker_id+'&level_two_marker='+levelTwoMarker;
  static API_MARKER_PROJECTLIST_DATA = (year,type,keyword,limit,offset,country,markerType, levelTwoMarker) => '/api/v1/output/project_list?keyword='+keyword+'&limit='+limit+'&offset='+offset+'&marker_type='+type+'&year='+year + '&operating_unit=' + country +'&marker_id=' +markerType+'&level_two_marker='+levelTwoMarker;
  static API_MARKER_SUBTYPE_DATA = (markerId,country) => '/api/v1/output/marker_dropdown/'+ markerId+'?operating_unit=' + country;
  static API_SECTOR_LIST = '/api/v1/project/sector_list';
  static SSC_OUR_APPROACHES = (country, levelTwoMarker, markerType) => '/api/v1/output/marker_description?operating_unit='+ country+'&level_two_marker='+levelTwoMarker+'&marker_id=' +markerType;
  static API_LEVEL_TWO_COUNTRY_DATA = (opUnit, markerId) => '/api/v1/output/level_two_dropdown?operating_unit='+opUnit+'&marker_id='+markerId;
  static API_SSC_COUNTRY_REGION_SEARCH = (search, theme, sdg, donor, currentYear, markerType, markerId, levelTwoMarker) => '/api/v1/master/country_regions?search=' + search + '&sector=' + theme + '&sdg=' + sdg + '&donor=' + donor + '&year=' + currentYear+'&marker_type='+markerType+'&marker_id='+markerId+'&level_two_marker='+levelTwoMarker;
}

export default Api;
