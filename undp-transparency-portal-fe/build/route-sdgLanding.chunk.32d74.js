webpackJsonp([13],{"5Z2W":function(e){e.exports={breadCrumbWrapper:"breadCrumbWrapper__3S1av"}},wXQc:function(e){e.exports={profile_page_container:"profile_page_container__2EDjV",wrapper:"wrapper__1VDsD",SDGdisclaimer:"SDGdisclaimer__3xqPl",sunburstChartContainer:"sunburstChartContainer__32BAq",profileBarChart:"profileBarChart__2Yqw5",chartHead:"chartHead__1F4I9",sdgLogoChart:"sdgLogoChart__2OwN3",chartWrapper:"chartWrapper__2dAxc",recipient_themes_wrapper:"recipient_themes_wrapper__rkVRD",budget_percent:"budget_percent__1zofU",top_budget_sources_wrapper:"top_budget_sources_wrapper__1-vKe",chartSmall:"chartSmall__ij3bk",sdgIcon:"sdgIcon__2zwp1",displayNone:"displayNone__1bjpo",sunburstParent:"sunburstParent__2Hi-_"}},wcDD:function(e,t,n){"use strict";function r(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var c=n("KM04"),l=n("E/bI"),p=n("diX/"),u=n("v4O/"),d=n("7aq3"),h=n("xVFv"),b=n("s4wh"),f=n("wXQc"),g=n.n(f),y=n("k7Db"),m=n("ufjx"),_=n("wdDn"),w=Object(c.h)(_.a,null),S=Object(c.h)(m.a,null),O=function(e){function t(t,n){var a=r(this,e.call(this,t,n));return a.handleOnClick=function(){},a.onTargetClick=function(e){if(e.name){var t=e.name.replace("Target","").trim().split(".");window.location="/sdg/targets/"+t[0]+"/"+t[1]}},a.onSDGClick=function(e){e.parent.name.includes("SDG")&&(window.location="/sdg/"+e.parent.code+"/"+e.parent.fullName)},a}return a(t,e),t.prototype.componentWillMount=function(){this.props.fetchSdgSunburstData(this.props.currentYear)},t.prototype.componentWillReceiveProps=function(e){e.currentYear!==this.props.currentYear&&this.props.fetchSdgSunburstData(e.currentYear)},t.prototype.render=function(){return Object(c.h)("div",{class:g.a.profile_page_container},Object(c.h)("div",{class:g.a.wrapper},Object(c.h)("p",{class:g.a.SDGdisclaimer},"The Sustainable Development Goals (SDGs) are a universal call to action to end poverty, protect the planet and ensure that all people enjoy peace and prosperity. The SDGs continue to guide UNDP policy and funding until 2030. As the lead United Nations development agency, UNDP is uniquely placed to help implement the Goals through our work in some 170 countries and territories."),this.props.sdgSunburstData.loading?Object(c.h)("div",{style:{position:"relative",height:344}},S):Object(c.h)("div",{class:g.a.sunburstParent},this.props.sdgSunburstData.data.children&&this.props.sdgSunburstData.data.children.length?Object(c.h)("div",{class:g.a.sunburstChartContainer+" "+g.a.sunburstParent},Object(c.h)(y.a,{chart_id:"sdg_sunburst_chart",width:screen.width>=650?1600:screen.width>=550?1200:1e3,height:600,data:this.props.sdgSunburstData.data,handleOnClick:this.handleOnClick,onTargetClick:this.onTargetClick,onSDGClick:this.onSDGClick})):w)))},t}(c.Component),j=n("qYVk"),D=n("elYE"),v=n("Yza4"),C=function(e){return{sdgSunburstData:e.sdgSunburstData,currentYear:e.yearList.currentYear,sdgTopFiveData:e.sdgTopFiveData,sdgBarChartData:e.sdgBarChartData}},k=function(e){return{fetchSdgSunburstData:function(t){return e(Object(j.b)(t))},fetchsdgTopFiveData:function(t,n){return e(Object(D.b)(t,n))},fetchSdgBarChart:function(t,n){return e(Object(v.c)(t,n))}}},E=Object(l.a)(C,k)(O),M=n("5ttS"),P=n("hafV"),x=n("FJnM"),L=n.n(x),T=n("usUj"),Y=n("Y9jh"),G=n("+hMk"),U=n("5Z2W"),H=n.n(U),N=Object(c.h)(p.a,{active:"sdg",title:"Sustainable development goals",enableSearch:!0,enableBanner:!0}),W=Object(c.h)(u.a,null),R=Object(c.h)(M.a,null),q=function(e){function t(n){o(this,t);var r=i(this,e.call(this,n));return r.openEmbedModal=function(){r.setState({displayEmbedModal:!0})},r.handleClose=function(e){r.setState({displayEmbedModal:!1},function(){e()})},r.handleOnSelect=function(e,t){var n=r.state.checkList.map(function(n){return n.key===t.key?{flag:e.target.checked,label:n.label,key:n.key}:n});r.setState({checkList:n},function(){r.createCheckList()})},r.createCheckList=function(e){var t=r.baseUrl;r.state.checkList.forEach(function(e,n){t=0===n?t+e.key+"="+e.flag:t+"&"+e.key+"="+e.flag}),r.setState({selectionListUrl:t},function(){void 0!==e&&e()})},r.getFilteObjectValue=function(e){r.setState({filterObj:e},function(){})},r.baseUrl=window.location.origin+"/embed/sustainable-development-goals?",r.state={displayEmbedModal:!1,selectionListUrl:window.location.origin+"/embed/sustainable-development-goals?",checkList:[{flag:!0,label:"Title",key:"title"},{flag:!0,label:"Summary",key:"summary"}],showExportModal:!1},r}return s(t,e),t.prototype.setPageHeader=function(){var e="Sustainable Development Goals";this.props.onChangeRoute(e),this.props.setPageHeader({title:e,breadcrumb:[{id:1,title:"Home",link:"/"},{id:2,title:e}]})},t.prototype.componentDidMount=function(){window.scrollTo(0,0),this.setPageHeader()},t.prototype.hideExportModal=function(){this.setState({showExportModal:!1})},t.prototype.showExportModal=function(){this.setState({showExportModal:!0})},t.prototype.renderExportPopup=function(){var e=this,t={title:"Sustainable Development Goals"};return Object(c.h)(b.a,{templateType:"sdg",data:t,loading:!1,onCloseModal:function(){return e.hideExportModal()}})},t.prototype.render=function(){var e=this,t="SDG | UNDP Transparency Portal",n="At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.",r="year="+this.props.currentYear;return Object(c.h)("div",null,this.state.showExportModal?this.renderExportPopup():null,Object(c.h)(L.a,{title:t,meta:[{name:"description",content:n},{property:"og:title",content:t},{property:"og:description",content:n},{property:"twitter:title",content:t},{property:"twitter:description",content:n}]}),N,Object(c.h)("div",{class:H.a.breadCrumbWrapper},W,Object(c.h)(d.a,{onClickEmbed:this.openEmbedModal,showExportModal:function(){return e.showExportModal()},startYear:P.a.SDG_YEAR,hideExport:"true"})),Object(c.h)(E,{displayEmbedModal:this.state.displayEmbedModal,yearList:this.props.yearList,handleClose:this.handleClose,getEmbedModalState:this.getEmbedModalState}),Object(c.h)(h.a,{display:this.state.displayEmbedModal,checkList:this.state.checkList,modifiedUrl:this.state.selectionListUrl+r,handleClose:this.handleClose,getselectedItem:this.getselectedItem,handleOnSelect:this.handleOnSelect}),R)},t}(c.Component),B=function(e){return{router:e.router,sdgSunburstData:e.sdgSunburstData,currentYear:e.yearList.currentYear}},F=function(e){return{setPageHeader:function(t){return e(Object(T.a)(t))},onChangeRoute:function(t){return e(Object(Y.b)(t))},downLoadDonorsDetailsCsv:function(t,n,r,a){return e(Object(G.b)(t,n,r,a))}}};t.default=Object(l.a)(B,F,null,{withRef:!0})(q)}});
//# sourceMappingURL=route-sdgLanding.chunk.32d74.js.map