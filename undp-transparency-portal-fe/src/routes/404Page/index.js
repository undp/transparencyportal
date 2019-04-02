/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { connect } from 'preact-redux';
import { route } from 'preact-router';
/****************** Custom Components Files ********************/
import CommonHeader from '../../components/commonHeader';
import Footer from '../../components/footer';

/****************** Third Party Components  ********************/
import Helmet from 'preact-helmet';

/*********************** Action Files  **************************/
import { onChangeRoute } from '../../shared/actions/routerActions';
import { setPageHeader } from '../../components/urlBreadCrumb/data/actions';
/*********************** Style Files  **************************/
import style from './style';

class ErrorPage extends Component {
	setPageHeader() {
		const title = '404 Not Found';
		this.props.onChangeRoute(title);
		document.title = title + ' | UNDP Transparency Portal';
		this.props.setPageHeader({
			title
		});
	}

	componentDidMount() {
		window.scrollTo(0, 0);
		this.setPageHeader();
	}

	render({ router }) {
		const title = '404 Not Found | UNDP Transparency Portal',
			description ='At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.';
		return (
			<div role="main">
				<Helmet title={title}
					meta={[
						{ name: 'description', content: description },
						{ property: 'og:title', content: title },
						{ property: 'og:description', content: description },
						{ property: 'twitter:title', content: title },
						{ property: 'twitter:description', content: description }
					]}
				/>
				<CommonHeader  title={'404 Not Found'} enableSearch/>
				<div class={style.container}>
					<div class={style.errorSection}>
						<img class={style.oopsImage} src="/assets/icons/oops_img.png" alt="UNDP Logo" />
						<p class={style.errorText}>Oops!</p>
						<p class={style.errorText}>Something went wrong !</p>
						<p>You can refresh the page or try again later</p>
						<a href="/" class={style.backLink}>Go to Homepage</a>
					</div>
				</div>
				<Footer />
			</div>
		);
	}
}
const mapStateToProps = (state) => ({
	router: state.router
});

const mapDispatchToProps = (dispatch) => ({
	onChangeRoute: (url) => dispatch(onChangeRoute(url)),
	setPageHeader: data => dispatch(setPageHeader(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(ErrorPage);