/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { connect } from 'preact-redux';

/****************** Custom Components Files ********************/
import CommonHeader from '../../components/commonHeader';
import Footer from '../../components/footer';
import UrlBreadCrumb from '../../components/urlBreadCrumb';
import About from '../../components/aboutUs';

/****************** Third Party Components  ********************/
import Helmet from 'preact-helmet';

/*********************** Action Files  **************************/
import { onChangeRoute } from '../../shared/actions/routerActions';
import { setPageHeader } from '../../components/urlBreadCrumb/data/actions';

/*********************** Style Files  **************************/
import style from './style';

class AboutUs extends Component {
	setPageHeader() {
		const title = 'About Us';
		this.props.onChangeRoute(title);
		document.title = title + ' | UNDP Transparency Portal';
		this.props.setPageHeader({
			title,
			breadcrumb: [
				{
					id: 1,
					title: 'Home',
					link: '/'
				}, {
					id: 2,
					title
				}
			]
		});
	}

	componentDidMount() {
		window.scrollTo(0, 0);
		this.setPageHeader();
	}

	render({ router }) {
		const title = 'About Us | UNDP Transparency Portal',
			description ='At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.';
		return (
			<div>
				<Helmet title={title}
					meta={[
						{ name: 'description', content: description },
						{ property: 'og:title', content: title },
						{ property: 'og:description', content: description },
						{ property: 'twitter:title', content: title },
						{ property: 'twitter:description', content: description }
					]}
				/>
				<CommonHeader active="about" title={'About Us'} enableSearch enableBanner/>
				<div class={style.breadCrumbWrapper}>
					<UrlBreadCrumb />
				</div>
				<About profileType={this.props.type} />
				<Footer />
			</div>
		);
	}
}
const mapStateToProps = (state) => ({
	router: state.router,
	yearList: state.yearList
});

const mapDispatchToProps = (dispatch) => ({
	onChangeRoute: (url) => dispatch(onChangeRoute(url)),
	setPageHeader: data => dispatch(setPageHeader(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(AboutUs);