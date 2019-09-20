/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { Router } from 'preact-router';
import { connect } from 'preact-redux';
 
/************************* Custom Component Files ************************/
import Home from './home';
import SDGTargets from './sdg-target-details';
import OurApproaches from './ourApproaches' ;
import Profile from './profile';
import Themes from './themes';
import Signature from './signature';
import Project from './project';
import ProjectDetails from './projectDetails';
import SearchResults from './searchResults';
import Donors from './donors';
import About from './aboutUs';
import Sdg from './sdg';
import EmbedViewProject from './embedViews/project';
import EmbedProjectDetailsView from './embedViews/projectDetails';
import EmbedDonorsView from './embedViews/donors';
import EmbedRecepientProfileView from './embedViews/profile';
import EmbedHomeRecipientCountry from './embedViews/home/recipientCountry';
import EmbedThemes from './embedViews/themes';
import Preloader from '../components/preLoader';
import EmbedSdgView from './embedViews/sdg';
import EmbedSdgTargetView from './embedViews/sdgTarget';
import ErrorPage from './404Page';
import EmbedHomeTabs from './embedViews/home/homeTabcommon';
import EmbedSignature from './embedViews/signature';
import SdgLanding from './sdgLanding';
import EmbedSdgLandingView from './embedViews/sdgLanding';
import SSCMarker from './sscMarker';
import EmbedMarkers from './embedViews/markers';
/**********************  Third party libraries x**********************/
import Helmet from 'preact-helmet';
import Marker from './marker';
/************************* Redux Action Files ************************/
import { onChangeRoute } from '../shared/actions/routerActions';
import { onAppInit } from '../shared/actions/commonDataActions';
import { fetchMasterSdgList } from '../shared/actions/sdgListActions';
import EmbedSSCMarkerView from './embedViews/sscMarker';
class Route extends Component {
	handleRoute = (e) => {
		this.currentUrl = e.url;
	}
	componentWillMount() {
		this.props.onAppInit();
	}
	componentWillReceiveProps(nextProps) {
		if(nextProps.mapCurrentYear != this.props.mapCurrentYear) {
			this.props.fetchMasterSdgList(nextProps.mapCurrentYear);
		}
	}
	render() {
		const title = 'UNDP Transparency Portal',
			description ='At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.';
		return (
			<div id="app">
				<Helmet
					meta={[
						{ property: 'og:type', content: 'website' },
						{ property: 'twitter:image', content: 'https://image.ibb.co/dSzZDH/open_graph_image.png' },
						{ property: 'twitter:card', content: 'summary_large_image' },
						{ property: 'og:locale', content: 'en_US' },
						{ property: 'og:site_name', content: title },
						{ property: 'og:image', content: 'https://image.ibb.co/dSzZDH/open_graph_image.png' },
						{ property: 'og:secure_url', content: 'https://image.ibb.co/dSzZDH/open_graph_image.png' },
						{ property: 'og:url', content: window.location.href },
						{ name: 'description', content: description },
						{ property: 'og:title', content: title },
						{ property: 'og:description', content: description },
						{ property: 'twitter:title', content: title },
						{ property: 'twitter:description', content: description }
					]}
					link={[
						{ rel: 'stylesheet', href: 'https://use.typekit.net/dqn0siy.css' }
					]}
				/>
				{
					this.props.year.length ?
						<Router onChange={this.handleRoute}>
							<Home path="/" />
							<Project path="/projects" />
							<Profile path="/profile/:code/:type" />
							<SearchResults path="/search-results" />
							<Donors path="/donors" />
							<ProjectDetails path="/projects/:id" />
							<About path="/about-us/:type" />
							<Themes path="/themes/:code/:type" />
							<Signature path="/signature/:code/:type" />
							<Sdg path="/sdg/:code/:type" />
							<SdgLanding path="/sustainable-development-goals" />
							<SDGTargets path="/sdg/targets/:code/:target_id" />
							<EmbedViewProject path="/embed/projects" />
							<EmbedProjectDetailsView  path="/embed/projects/:id" />
							<EmbedThemes path="/embed/themes" />
							<EmbedDonorsView path="/embed/donors" />
							<EmbedRecepientProfileView path="/embed/profile/:code/:type" />
							<EmbedSdgView path="/embed/sdg/" />
							<EmbedHomeRecipientCountry path="/embed/home/recipientCountry" />
							<EmbedHomeTabs path="/embed/home/:type" />
							<EmbedMarkers path="/embed/our-approaches" />
							<EmbedSdgTargetView path="/embed/sdg/targets/" />
							<EmbedSignature path="/embed/signature" />
							<EmbedSdgLandingView path="/embed/sustainable-development-goals/" />
							<EmbedSSCMarkerView path="/embed/our-approaches/ssc" />
							<OurApproaches path="/our-approaches" />
							<Marker path="/our-approaches/:code" />
							<ErrorPage default />
							<SSCMarker path="/our-approaches/ssc/" />
							<ErrorPage default />
						</Router> : <Preloader />
				}
			</div>
		);
	}
}


const mapStateToProps = (state) => {
	const { year } = state.projectTimeline;
	const { countries } = state.countryList;
	const { mapCurrentYear } = state.mapData.yearTimeline;
	return {
		state,
		year,
		countries,
		router: state.router,
		mapCurrentYear
	};
};

const mapDispatchToProps = (dispatch) => ({
	onChangeRoute: (url) => dispatch(onChangeRoute(url)),
	onAppInit: () => dispatch(onAppInit()),
	fetchMasterSdgList: (year) => dispatch(fetchMasterSdgList(year)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Route);
