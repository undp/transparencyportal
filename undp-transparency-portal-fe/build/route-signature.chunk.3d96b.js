webpackJsonp([12],{FMV9:function(e){e.exports={breadCrumbWrapper:"breadCrumbWrapper__1yN8M"}},ZdCs:function(e,t,a){"use strict";function r(e){if(null==e)throw new TypeError("Cannot destructure undefined")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function c(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function n(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var p=a("KM04"),l=a("E/bI"),u=a("diX/"),h=a("v4O/"),d=a("7aq3"),_=a("wvix"),b=a("yNoq"),m=a("COsE"),j=a("2On6"),f=a("wdDn"),g=a("ufjx"),y=a("nZhv"),O=a("Au7/"),S=a("oSUj"),w=a.n(S),v=a("Cdrj"),D=Object(p.h)(g.a,null),L=Object(p.h)(g.a,null),k=Object(p.h)("span",null,"Our Focus"),M=Object(p.h)(g.a,null),C=Object(p.h)(f.a,null),x=Object(p.h)("span",null,"Top 10 Donors"),W=Object(p.h)(m.a,null),P=Object(p.h)(g.a,null),E=Object(p.h)(f.a,null),T=Object(p.h)("span",null,"Top 10 Recipient Offices"),U=Object(p.h)(m.a,null),Y=Object(p.h)(g.a,null),B=Object(p.h)(f.a,null),F=function(e){function t(t,a){var r=o(this,e.call(this,t,a));return r.state={themeSliderData:{},themesMapData:{},projectList:{},listSelected:!1,totalDataSize:0,links:"",projectListArr:[]},r}return s(t,e),t.prototype.componentDidMount=function(){this.props.fetchSignatureSliderData(this.props.currentYear,this.props.sector_code),this.props.loadThemesMapData(this.props.currentYear,"","","",this.props.sector_code),this.props.fetchSignatureOutcome(this.props.sector_code,this.props.currentYear),this.props.updateSignatureSolution(this.props.sector_code)},t.prototype.componentWillReceiveProps=function(e){if(e.currentYear!=this.props.currentYear&&(this.props.fetchSignatureSliderData(e.currentYear,this.props.sector_code),this.props.loadThemesMapData(e.currentYear,"","","",this.props.sector_code),this.props.fetchSignatureOutcome(this.props.sector_code,this.props.currentYear)),Object.keys(e.themeSliderData.data).length&&this.setState({themeSliderData:e.themeSliderData}),Object.keys(e.themesMapData.data).length&&this.setState({themesMapData:e.themesMapData}),Object.keys(e.projectList.projectList.data).length&&this.setState({projectList:e.projectList}),Object.keys(e.outcomeData.resourcesModalityContribution.data).length&&this.setState({outcomeChartData:e.outcomeData}),e.projectList.projectList!=this.props.projectList.projectList){var t=e.projectList.projectList.data;this.setState({projectListArr:function(e){return e.forEach(function(e){e.country_name=e.country,e.probObj={title:e.title,project_id:e.project_id},e.total_budget=null==e.budget?0:e.budget,e.total_expense=null==e.expense?0:e.expense}),e}(t),totalDataSize:e.projectList.projectList.count,links:e.projectList.projectList.links})}},t.prototype.render=function(e,t){var a=this,o=t.totalDataSize,s=t.themesMapData,i=t.themeSliderData,c=t.outcomeChartData,n=t.projectListArr;r(e);var l=Object.keys(this.state.themeSliderData).length,u=Object.keys(this.state.themesMapData).length,h=(this.state.projectList&&this.state.projectList.projectList&&Object.keys(this.state.projectList.projectList),l?i.data&&i.data.aggregate:{}),d=l?i.data&&i.data.budget_sources:{},m=l?i.data&&i.data.top_recipient_offices:{},f=u?s&&s.data&&s:{},i=this.props.themeSliderData,c=this.props.outcomeData.resourcesModalityContribution;return Object(p.h)("div",{class:w.a.profile_page_container},Object(p.h)("div",{class:w.a.wrapper},Object(p.h)("div",null,i.loading?Object(p.h)("div",{style:{position:"relative",height:83}},D):Object(p.h)("div",{class:w.a.infoWrapper},Object(p.h)("div",{class:w.a.imageWrapper},Object(p.h)("img",{class:w.a.ss_image,src:"0"===h.ss_id?"/assets/icons/placeHolder.svg":Object(v.d)()+"/media/ss-icons/SS-"+h.ss_id+".svg",alt:"ss icon"})),Object(p.h)("div",{class:w.a.tableWrapper},Object(p.h)("ul",{class:w.a.list},Object(p.h)("li",null,Object(p.h)("span",{class:w.a.value},h.budget_amount&&Object(O.d)(h.budget_amount,2)),Object(p.h)("span",{class:w.a.label},"Budget")),Object(p.h)("li",null,Object(p.h)("span",{class:w.a.value},h.expense_amount&&Object(O.d)(h.expense_amount,2)),Object(p.h)("span",{class:w.a.label},"Expense")),Object(p.h)("li",null,Object(p.h)("span",{class:w.a.value},h.projects&&Object(O.c)(h.projects)),Object(p.h)("span",{class:w.a.label},"Projects")),Object(p.h)("li",null,Object(p.h)("span",{class:w.a.value},h.budget_sources&&Object(O.c)(h.budget_sources)),Object(p.h)("span",{class:w.a.label},"Donors"))))))),Object(p.h)("div",{class:w.a.mapWrapper,style:this.state.listSelected&&{height:"auto"}},Object(p.h)("span",{class:w.a.mapSwitchContainer},Object(p.h)("span",{class:w.a.mapSwitch},Object(p.h)("button",{class:this.state.listSelected?w.a.mapBtn:w.a.mapBtn+" "+w.a.mapSelected,onClick:function(){return a.setState({listSelected:!1})}},"Map"),Object(p.h)("button",{class:this.state.listSelected?w.a.mapBtn+" "+w.a.listSelected:w.a.mapBtn,onClick:function(){return a.setState({listSelected:!0})}},"List"))),Object(p.h)("div",null,Object(p.h)("div",{style:{paddingTop:"9px",display:this.state.listSelected?"block":"none"}},Object(p.h)(b.a,{count:o,currentYear:this.props.currentYear,theme:"",data:n,signatureSolution:this.props.sector_code})),Object(p.h)("div",{class:w.a.mapContainer,style:{position:"relative",display:this.state.listSelected?"none":"block"}},u?Object(p.h)(_.a,{mapData:f,signatureSolution:"true"}):L,this.state.listSelected?null:window.dispatchEvent(new Event("resize")),u?Object(p.h)("div",{class:w.a.disclaimer},"* The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries."):null))),Object(p.h)("div",{class:w.a.wrapper+" "+w.a.chartWrapper},Object(p.h)("div",{class:w.a.top_budget_sources_wrapper},Object(p.h)("span",{class:w.a.chartHead},k),this.props.outcomeData.resourcesModalityContribution.loading?Object(p.h)("div",{style:{position:"relative",height:344}},M):Object(p.h)("div",null,c.data.country.length>0?Object(p.h)("div",{class:w.a.outcome_chart_wrapper+" "+w.a.outcome_resources_modality},Object(p.h)(y.a,{donor_wrapper_styles:w.a.outcome_wrapper_styles,donut_styles:w.a.donut_styles,legend_styles:w.a.legend_styles,textWrapperStyle:w.a.textWrapperStyle,textFieldStyle:w.a.textFieldStyle,ourFocusLegendStyles:w.a.our_focus_legend_styles,legendLabel:w.a.legendLabel,data:c.data.country,legendData:c.data.total,svgIe:w.a.svgIe,chartWidth:560,chartHeight:400,chart_id:"outcomes_chart_signature"})):C))),Object(p.h)("div",{class:w.a.wrapper+" "+w.a.chartWrapper},Object(p.h)("div",{class:w.a.top_budget_sources_wrapper},Object(p.h)("span",{class:w.a.chartHead},x,W),i.loading?Object(p.h)("div",{style:{position:"relative",height:344}},P):Object(p.h)("div",null,d.length>0?Object(p.h)("div",{class:w.a.budget_sources_wrapper},Object(p.h)(j.a,{chart_id:"themes_profile_budget_sources",width:1250,height:500,min_height:540,data:d,label:"short_name",tspanSize:"12px",textSize:"12px"})):E))),Object(p.h)("div",{class:w.a.wrapper+" "+w.a.chartWrapper},Object(p.h)("div",{class:w.a.top_budget_sources_wrapper},Object(p.h)("span",{class:w.a.chartHead},T,U),i.loading?Object(p.h)("div",{style:{position:"relative",height:344}},Y):Object(p.h)("div",null,m.length>0?Object(p.h)("div",{class:w.a.budget_sources_wrapper},Object(p.h)(j.a,{chart_id:"themes_profile_top_recipient_offices",width:1250,height:500,min_height:540,data:m,label:"iso3",tspanSize:"12px",textSize:"12px"})):B))))},t}(p.Component),H=a("6W2b"),I=a("t4UN"),A=a("STnb"),R=a("A1ba"),V=a("yg2x"),N=function(e){return{themeSliderData:e.themeSliderData,themesMapData:e.mapData.themesMapData,projectList:e.projectList,outcomeData:e.donorProfile}},z=function(e){return{fetchSignatureSliderData:function(t,a){return e(Object(H.b)(t,a))},loadThemesMapData:function(t,a,r,o,s){return e(Object(I.b)(t,a,r,o,s))},updateProjectList:function(t,a,r,o,s,i,c,n){return e(Object(A.c)(t,a,r,o,s,i,c,n))},fetchSignatureOutcome:function(t,a){return e(Object(R.c)(t,a))},updateSignatureSolution:function(t){return e(Object(V.b)(t))}}},X=Object(l.a)(N,z)(F),q=a("5ttS"),J=a("xVFv"),Q=a("s4wh"),Z=a("usUj"),G=a("Y9jh"),K=a("+hMk"),$=a("GXBc"),ee=a("FJnM"),te=a.n(ee),ae=a("FMV9"),re=a.n(ae),oe=Object(p.h)(h.a,null),se=Object(p.h)(q.a,null),ie=function(e){function t(a,r){i(this,t);var o=c(this,e.call(this,a,r));return o.openEmbedModal=function(){o.createCheckList(o.setState({displayEmbedModal:!0}))},o.handleClose=function(){o.setState({displayEmbedModal:!1},function(){o.clearSelect()})},o.createCheckList=function(e){var t=o.baseUrl;o.state.checkList.forEach(function(e,a){t=0===a?t+e.key+"="+e.flag:t+"&"+e.key+"="+e.flag}),o.setState({selectionListUrl:t},function(){void 0!==e&&e()})},o.handleOnSelect=function(e,t){var a=o.state.checkList.map(function(a){return a.key===t.key?{flag:e.target.checked,label:a.label,key:a.key}:a});o.setState({checkList:a},function(){o.createCheckList()})},o.clearSelect=function(){var e=o.state.checkList.map(function(e){return{flag:o.initialChecklist[e.key],label:e.label,key:e.key}});o.setState({checkList:e})},o.componentDidMount=function(){window.scrollTo(0,0),o.setPageHeader(o.props.type)},o.state={displayEmbedModal:!1,checkList:[{flag:!0,label:"Title",key:"title"},{flag:!0,label:"Stats",key:"stats"},{flag:!0,label:"Map",key:"map"},{flag:!1,label:"Project List",key:"projectTable"},{flag:!1,label:"Top Donors",key:"budgetSources"},{flag:!1,label:"Top Recipient Offices",key:"recepientOffices"},{flag:!1,label:"Our Focus",key:"ourFocus"}],selectionListUrl:window.location.origin+"/embed/signature?",showExportModal:!1},o.baseUrl=window.location.origin+"/embed/signature?",o.initialChecklist={title:!0,map:!0,projectTable:!1,budgetSources:!1,recepientOffices:!1,ourFocus:!1},o}return n(t,e),t.prototype.setPageHeader=function(e){var t="Signature Solutions";this.props.setPageHeader({title:t,breadcrumb:[{id:1,title:"Home",link:"/"},{id:2,title:t+" - "+e}]}),this.props.onChangeRoute(t+" - "+e),this.setState({pageTitle:t+" - "+e+" | UNDP Transparency Portal"})},t.prototype.showExportModal=function(){this.setState({showExportModal:!0})},t.prototype.hideExportModal=function(){this.setState({showExportModal:!1})},t.prototype.renderExportPopup=function(){var e=this,t=void 0,a=void 0,r=void 0,o=this.props.mapCurrentYear,s=this.props.code;return t={year:this.props.themeSliderData.data.aggregate.year,aggregate:this.props.themeSliderData.data.aggregate,budget_sources:this.props.themeSliderData.data.budget_sources,top_recipient_offices:this.props.themeSliderData.data.top_recipient_offices,donutChartData:this.props.outcomeData.resourcesModalityContribution,mapData:this.props.outputData.data,title:this.props.themeSliderData.data.aggregate.sector_name,projectList:this.props.projectList.projectList,tabSelected:"signature",lastUpdatedDate:Object($.a)(this.props.lastUpdatedDate.data.last_updated_date)},a=this.props.projectList.loading||this.props.themeSliderData.loading||this.props.outputData.loading,r="profile_sector",Object(p.h)(Q.a,{templateType:r,data:t,loading:a,downloadCsv:function(){e.props.downLoadProjectListCsv(o,"","","","","","",s)},onCloseModal:function(){return e.hideExportModal()}})},t.prototype.render=function(){var e=this,t=this.state.pageTitle,a="At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.",r="&year="+this.props.currentYear+"&themes="+this.props.code+"&themesLabel="+this.props.type;return Object(p.h)("div",null,this.state.showExportModal?this.renderExportPopup():null,Object(p.h)(te.a,{title:t,meta:[{name:"description",content:a},{property:"og:title",content:t},{property:"og:description",content:a},{property:"twitter:title",content:t},{property:"twitter:description",content:a}]}),Object(p.h)(u.a,{title:this.props.type,enableSearch:!0,enableBanner:!0}),Object(p.h)("div",{class:re.a.breadCrumbWrapper},oe,Object(p.h)(d.a,{showExportModal:function(){return e.showExportModal()},onClickEmbed:this.openEmbedModal})),Object(p.h)(X,{sector_code:this.props.code,currentYear:this.props.currentYear}),Object(p.h)(J.a,{display:this.state.displayEmbedModal,checkList:this.state.checkList,modifiedUrl:this.state.selectionListUrl+r,handleClose:this.handleClose,getselectedItem:this.getselectedItem,handleOnSelect:this.handleOnSelect}),se)},t}(p.Component),ce=function(e){return{router:e.router,countryList:e.countryList,currentYear:e.yearList.currentYear,themeSliderData:e.themeSliderData,outputData:e.mapData.outputData,projectList:e.projectList,mapCurrentYear:e.mapData.yearTimeline.mapCurrentYear,lastUpdatedDate:e.lastUpdatedDate,outcomeData:e.donorProfile}},ne=function(e){return{onChangeRoute:function(t){return e(Object(G.b)(t))},setPageHeader:function(t){return e(Object(Z.a)(t))},downLoadProjectListCsv:function(t,a,r,o,s,i,c,n){return e(Object(K.d)(t,a,r,o,s,i,c,n))}}};t.default=Object(l.a)(ce,ne)(ie)},oSUj:function(e){e.exports={profile_page_container:"profile_page_container__2MQv3",wrapper:"wrapper__2JP-i",btnListWrapper:"btnListWrapper__2bktx",btnList:"btnList__oCN-X",active:"active__2frBW",accessibility:"accessibility__WyFR3",list:"list__3ufMc",value:"value__1w62m",label:"label__3IPvd",infoWrapper:"infoWrapper__1bUnE",tableWrapper:"tableWrapper__1Mgwu",imageWrapper:"imageWrapper__1dw3I",ss_image:"ss_image__2m004",mapWrapper:"mapWrapper__1Va7L",mapSwitchContainer:"mapSwitchContainer__3V7Rr",mapProjectSwitch:"mapProjectSwitch__13hy2",mapProjectList:"mapProjectList__5vUG9",mapProjectButton:"mapProjectButton__2uVya",mapProjectItem:"mapProjectItem__kDWss",mapSwitch:"mapSwitch__BFT_9",mapBtn:"mapBtn__U-9wt",listSelected:"listSelected__3WjLo",mapSelected:"mapSelected__3fiLI",mapContainer:"mapContainer__2kVtP",filterWrapper:"filterWrapper__2CMpA",chartWrapper:"chartWrapper__eeYTj",recipient_themes_wrapper:"recipient_themes_wrapper__3Ol9A",budget_percent:"budget_percent__3V9hA",outcome_chart_wrapper:"outcome_chart_wrapper__3Bb82",outcome_wrapper_styles:"outcome_wrapper_styles__crwxT",textWrapperStyle:"textWrapperStyle__VeJsi",textFieldStyle:"textFieldStyle__QuAAE",our_focus_legend_styles:"our_focus_legend_styles__1saqN",legend_styles:"legend_styles__2S4PF",donut_styles:"donut_styles__2D86P",windroseWrapper:"windroseWrapper__xUW7Y",chartSmall:"chartSmall__3qIy_",chartHead:"chartHead__13yf9",chartSubHeading:"chartSubHeading__2CRSX",progress:"progress__2MQ40",contribution_wrapper:"contribution_wrapper__MgpE4",legendLabel:"legendLabel__15wT0",groupedBarChart2Wrapper:"groupedBarChart2Wrapper__2jGHX",recipient_charts_wrapper:"recipient_charts_wrapper__fKsQe",wind_rose_wrapper:"wind_rose_wrapper__2XVmB",top_budget_sources_wrapper:"top_budget_sources_wrapper__3p5EV",budget_sources_wrapper:"budget_sources_wrapper__1PmDZ",contribution_other_resource_wrapper:"contribution_other_resource_wrapper__3afe1",recipientDocumentWrapper:"recipientDocumentWrapper__16v8E",dropDownWrapper:"dropDownWrapper__113ld",disclaimer:"disclaimer__1Zw7h",no_box_shadow:"no_box_shadow__qoCgX",donor_country_contribution:"donor_country_contribution__19p0j",outcome_resources_modality:"outcome_resources_modality__2njWR",svgIe:"svgIe__1c1I1"}}});
//# sourceMappingURL=route-signature.chunk.3d96b.js.map