/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { connect } from 'preact-redux';

/************************* Custom Component Files ************************/
import CommonHeader from '../../components/commonHeader';
import UrlBreadCrumb from '../../components/urlBreadCrumb';
import Footer from '../../components/footer';
/****************** Third Party Components  ********************/
import Helmet from 'preact-helmet';

/************************* Redux Action Files ************************/
import { setPageHeader } from '../../components/urlBreadCrumb/data/actions';
import { onChangeRoute } from '../../shared/actions/routerActions';


import { aboutUsInfo } from './../../assets/json/undpAboutUsData'

/************************* Style Files ************************/
import style from './style';
function AboutItem(props){
    return (<section class={style.info}>
                <img src={props.data.img} class={style.img}/>
                <section class={style.infoText}>
                    <a href={props.data.id === 3 ? '/our-approaches/ssc':'/our-approaches/'+props.data.label} class={style.infoTitle}>{props.data.title}</a>
                    <section>{props.data.desc}</section>
                </section>
            </section>
    )
}
class OurApproaches extends Component {
	setPageHeader(type) {
		this.props.setPageHeader({
			breadcrumb: [
				{
					id: 1,
					title: 'Home',
					link: '/'
				}, {
					id: 2,
					title: type
				}
			]
		});
		this.props.onChangeRoute(type);
		this.setState({
			pageTitle: type + ' | UNDP Transparency Portal'
		});
	}
    
    constructor(props, context) {
        super(props, context);
        this.state = {
            pageTitle : ''
        }
    }

	componentDidMount = () => {
		window.scrollTo(0, 0);
		this.setPageHeader('Our Approaches');
	}

	render({ router }) {
		const title = this.state.pageTitle,
			description = 'At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.';
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
                <CommonHeader  title={'Our Approaches'}  enableSearch enableBanner active='our-approaches' />
				<div class={style.breadCrumbWrapper}>
					<UrlBreadCrumb />
				</div>
                <section class={style.desc}>
                    <section class={style.desc1}> UNDP applies a wide range of approaches and partnerships
                         to achieve development goals.
                    </section>
                    <section class={style.desc2}>
                        Explore how UNDP is making a difference to the life of people across the globe
                    </section>
                </section>
                <section class={style.infoSection}>
                    {
                        aboutUsInfo.data.map((item,index)=> {
                            return <AboutItem key={index} data={item} />
                        })
                    }
                </section>
				<Footer />
			</div>
		);
	}
}
const mapStateToProps = (state) => 
{
return(
	{
	router: state.router
});
}
const mapDispatchToProps = (dispatch) => ({
	onChangeRoute: (url) => dispatch(onChangeRoute(url)),
	setPageHeader: data => dispatch(setPageHeader(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(OurApproaches);
