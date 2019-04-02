import { h, Component } from 'preact';
import { Router } from 'preact-router';
import { Provider } from 'react-redux';
import configureStore from '../store'
import Footer from './footer';
import Home from '../routes/home';
import Profile from '../routes/profile';
import Project from '../routes/project';
import ProjectDetails from '../routes/projectDetails';
import ReactGA from 'react-ga'; 
import { connect } from 'preact-redux'
import { onChangeRoute } from '../shared/actions/routerActions';
import Api from '../lib/api'
import Route from '../routes';


const store = configureStore()

 export default class App extends Component {
	
	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
	// handleRoute = e => {
	// 	this.currentUrl = e.url;
	// 	this.props.onChangeRoute(e);
	// };
	constructor() {
		super();
		this.state = {
		  someData: null,
		};
	
		// Add your tracking ID created from https://analytics.google.com/analytics/web/#home/
		ReactGA.initialize(Api.GA_TRACKING_ID);
		// This just needs to be called once since we have no routes in this case.
		ReactGA.pageview(window.location.pathname);
	  }
	render() {
		return (
			<Provider store={store}>
				<Route/>
			</Provider>
		);
	}
}



