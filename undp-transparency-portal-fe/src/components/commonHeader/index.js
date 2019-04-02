import { h, Component } from 'preact';

import style from './style';
import { connect } from 'preact-redux';
import { updateSearchText } from '../../shared/actions/searchActions';
import { route } from 'preact-router';
import { getFormmattedDate } from '../../utils/dateFormatter';
import ReactGA from 'react-ga';
import DownloadModal from '../downloadModal';

class CommonHeader extends Component {
	constructor(props) {
		super(props);
		this.state = {
			headerClass: style.header,
			hamburgerSelected: false,
			showDownload: false,
			navbarLinkClass: style.navbarLink,
			searchSelected: false,
			showMenu: '',
			scrolled: false
		};
	}
	componentWillMount() {
		this.checkDimension();
		window.addEventListener('resize', () => this.checkDimension());
	}


	componentWillUnmount() {
		document.removeEventListener('mousedown', (e) => this.handleClickOutside(e));
	}
	componentDidMount() {
		document.addEventListener('mousedown', (e) => this.handleClickOutside(e));
		window.addEventListener('scroll', (event) => {
			if (window.pageYOffset === 0) {
				this.setState({ headerClass: style.header,navbarLinkClass: style.navbarLink,scrolled: false });
			}
			else {
				this.setState({ headerClass: `${style.header} ${style.scrolled}`,navbarLinkClass: `${style.navbarLink} ${style.addPadding}`,scrolled: true });
			}
		});
	}
	handleClickOutside = (e) => {
		if (this.state.searchSelected && this.searchContainer && !this.searchContainer.contains(e.target)) {
			this.setState({ searchSelected: false });
		}
	}
	checkDimension() {
		if (window.innerWidth < 992) this.setState({ hamburgerSelected: false });
		else this.setState({ hamburgerSelected: true });
	}

	menucloseClick() {
		this.setState({ showMenu: 'close', hamburgerSelected: false },
			() => {
				document.body.style.overflowY = 'scroll';
			});
	}
	menuClick = () => {
		this.setState({ showMenu: 'open', hamburgerSelected: true });

		document.body.style.overflowY = 'hidden';
	}
	innerMenuClick = (type) => {
		if (type === 'download') {

			this.setState({ showDownload: true });
		}
		if (type === 'search') {
			this.setState({ searchSelected: true });
		}
		document.body.style.overflowY = 'scroll';
		this.setState({ showMenu: 'close', hamburgerSelected: false });
	}

	onKeyPress = (e) => {

		if (e.keyCode === 13) {
			if (this.props.page && this.props.page === 'search') {
				this.props.searchFilterChange('search', this.props.searchAllResult.searchText);
			}
			else {
				this.navigateToSearchpage(e.target.value);
			}
			document.body.style.overflowY = 'scroll';
		}

	}
	navigateToSearchpage = (value) => {
		if (value.trim() !== '') {
			route('/search-results');
		}
	}
	closeDownload = () => {
		this.setState({ showDownload: false });
	}
	search = () => (
		<div ref={(node) => this.searchContainer = node}>
			<span class={style.searchIcon} />
			{
				this.state.searchSelected === true ?
					<input autofocus class={style.searchBar} placeholder={'Search using Projects, Donors, Recipients or Keyword'}
						value={this.props.searchAllResult.searchText}
						onInput={(e) => {
							this.props.updateSearchText(e.target.value);
						}}
						onKeyPress={(e) => {
							this.onKeyPress(e);

						}}
						ref={(input) => { this.textInput = input; }}
						autofocus
					/>
					: null
			}
		</div>
	)
	searchMobile = () => (
		<div class={style.searchMobileWrapper}>
			<span class={style.searchIcon} />
			<input class={style.searchBar} placeholder={'Search'}
				value={this.props.searchAllResult.searchText}
				onInput={(e) => {
					this.props.updateSearchText(e.target.value);
				}}
				onKeyPress={(e) => {
					this.onKeyPress(e);
				}}
				ref={(input) => { this.textInput = input; }}
			/>
		</div>
	)
	render(props) {
		return (
			<div class={style.innerHeadersection}>
				<header class={this.state.headerClass}>
					<div class={style.headerContainer}>
						<nav class={style.mainNav}>
							<span class={style.headerLogo}>
								<a target="_blank"
									onclick={() => ReactGA.ga('send', 'event', 'External Links', 'UNDP Logo', 'http://www.undp.org')}
									href=" http://www.undp.org"
								><img src="/assets/images/logo.png" alt="UNDP Logo" /></a>
							</span>
							<span class={style.projectTitle}>Transparency Portal</span>
							<span class={style.dateUpdatedMobile}>{`Data last updated on: ${getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)}`}</span>
							<button class={style.hamburger} onClick={() => { this.menuClick(); }}>&#9776;</button>
							<ul class={`${style.navBar} ${this.state.showMenu === 'open' && style.menuactiveClose} ${this.state.showMenu === 'close' && style.menuinactiveClose}`}>
								<li class={style.closeWrapper}><button class={style.menuClose} onClick={() => { this.menucloseClick(); }} /></li>
								<li class={`${style.navbarLink} ${style.searchMobile}`}>{this.searchMobile()}</li>
								<li class={this.state.searchSelected === false ? this.state.navbarLinkClass : style.linkHidden} onClick={() => { this.innerMenuClick(); }}><a class={props.active === 'profile' && style.active} href="/">Home</a></li>
								<li class={this.state.searchSelected === false ? this.state.navbarLinkClass: style.linkHidden} onClick={() => { this.innerMenuClick(); }}><a class={props.active === 'projects' && style.active} href="/projects">Projects</a></li>
								<li class={this.state.searchSelected === false ? this.state.navbarLinkClass: style.linkHidden} onClick={() => { this.innerMenuClick(); }}><a class={props.active === 'donors' && style.active} href="/donors">Donors</a></li>
								<li class={this.state.searchSelected === false ? this.state.navbarLinkClass : style.linkHidden} onClick={() => { this.innerMenuClick(); }}><a class={props.active === 'sdg' && style.active} href="/sustainable-development-goals">Sustainable development goals</a></li>
								<li class={this.state.searchSelected === false ? this.state.navbarLinkClass: style.linkHidden} onClick={() => { this.innerMenuClick(); }}><a class={props.active === 'our-approaches' && style.active} href="/our-approaches">OUR APPROACHES</a></li>
								{
									screen.width > 991 ?
										<li class={this.state.searchSelected === false ? this.state.navbarLinkClass : style.linkHidden} onClick={() => { this.innerMenuClick(); }}>
											<div class={style.dropdown}>
												<a class={this.state.scrolled ? `${style.dropbtn} ${style.scrolledDropBtn}`: `${style.dropbtn} ${style.unscrolledDropBtn}`} > MORE</a>
												<div class={this.state.scrolled?`${style.dropdown_content} ${style.scrolledDropDown}`:style.dropdown_content}>
													<a class={style.dropDownItems} href="/about-us/open"> ABOUT US</a>
													<a class={style.dropDownItems} onClick={() => { this.innerMenuClick('download'); }}>Download</a>
												</div>
											</div>
										</li>
										:
										<div>
											<li class={this.state.searchSelected === false ? this.state.navbarLinkClass: style.linkHidden} onClick={() => { this.innerMenuClick(); }}><a class={props.active === 'about' && style.active} href="/about-us/open">About us</a></li>
											<li class={this.state.searchSelected === false ? `${this.state.navbarLinkClass} ${style.download}` : style.linkHidden} onClick={() => { this.innerMenuClick('download'); }}>
												<a >Download</a>
											</li>
										</div>
								}
								<span class={style.dateUpdated}>{`Data last updated on: ${getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)}`}</span>	
								<li class={this.state.searchSelected === true ? `${style.navbarLink} ${style.searchCentered}` : style.navbarLink} onClick={() => { this.innerMenuClick('search'); }}>{this.search()}</li>
							</ul>
							{
								this.state.showDownload && <DownloadModal onCloseModal={() => this.closeDownload()} />
							}

						</nav>
					</div>
				</header>
				{
					this.props.enableBanner ?
						<section class={style.innerBanner}>
							<div class={style.linkHeading} >
								<span>{props.title}</span>
								<span class={style.subTitle}>{props.subTitle}</span>
							</div>
						</section>
						: null
				}

			</div>
		);
	}

}

const mapStateToProps = (state) => ({
	searchAllResult: state.searchAllResult,
	lastUpdatedDate: state.lastUpdatedDate
});

const mapDispatchToProps = (dispatch) => ({
	updateSearchText: data => dispatch(updateSearchText(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(CommonHeader);
