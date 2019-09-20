import { h, Component } from 'preact';
import YearSummary from '../YearSummary';
import DownloadModal from '../downloadModal';
import { route } from 'preact-router';
import style from './style';
import { connect } from 'preact-redux';
import ReactGA from 'react-ga';
import { getFormmattedDate } from '../../utils/dateFormatter';
import {getAPIBaseUrRl} from '../../utils/commonMethods';
class homeHeader extends Component {
	constructor(props) {
		super(props);
		this.state = {
			headerClass: style.header,
			hamburgerSelected: false,
			showDownload: false,
			searchSelected: false,
			showMenu: '',
			scrolled: false,
			showCovidResponse: true
		};
		this.textInput = '';
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
				this.setState({ headerClass: style.header, searchSelected: false, scrolled: false });
			}
			else {
				this.setState({ headerClass: `${style.header} ${style.scrolled}`,scrolled: true });
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

	closeDownload = () => {
		this.setState({ showDownload: false });
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
		if (value.trim() != '') {
			route('/search-results');
		}
	}
	search = () => (
		<div ref={(node) => this.searchContainer = node}>
			<span class={style.searchIcon}></span>
			{
				this.state.searchSelected === true ?
					<input autofocus={true} class={style.searchBar} placeholder={'Search using Projects, Donors, Recipients or Keyword'}
						value={this.props.searchAllResult.searchText}
						onInput={(e) => {
							this.props.updateSearchText(e.target.value);
						}}
						onKeyPress={(e) => {
							this.onKeyPress(e);

						}}
						ref={(input) => { this.textInput = input; }}
						autofocus />
					: null
			}
		</div>
	)
	searchMobile = () => (
		<div class={style.searchMobileWrapper}>
			<span class={style.searchIcon}></span>
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

	getMenuWrapperClass = () => {
		let baseClass = style.navBar;
		let overrideClass = this.state.showMenu === 'open' ? style.menuactiveClose : style.menuinactiveClose;

		return `${baseClass} ${overrideClass}`;
	}

	covidResponseClose = () => {
		this.setState({ showCovidResponse: false });
	}

	render(props) {
		return (
			<section class={(this.state.showCovidResponse && !this.state.scrolled) ? `${style.container} ${style.addOnContainer}` : style.container }>
				<header class={this.state.headerClass}>
					<section class={(this.state.showCovidResponse && !this.state.scrolled) ? style.upperAddonSection: `${style.upperAddonSection} ${style.hideUpperAddonSection}`}>
						<a class={style.link} href="/our-approaches/undpcr">COVID-19 Response<i></i></a>
						<i onClick={this.covidResponseClose}></i>
					</section>
					<div class={style.headerContainer}>
						<nav class={style.mainNav}>
							<span class={style.headerLogo}>
								<a target="_blank"
									onclick={() => ReactGA.ga('send',
										'event',
										'External Links',
										'UNDP Logo',
										'http://www.undp.org')}
									href="http://www.undp.org"><img src={getAPIBaseUrRl()+"/assets/images/logo.png"} alt="UNDP Logo" /></a>
							</span>
							<span class={style.projectTitle}>Transparency Portal</span>
							<span class={style.dateUpdatedMobile}>{`Data last updated on: ${getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)}`}</span>
							<button class={style.hamburger} onClick={() => { this.menuClick(); }}>&#9776;</button>
							<ul class={this.getMenuWrapperClass()}>
								<li class={style.closeWrapper}><button class={style.menuClose} onClick={() => { this.menucloseClick(); }}></button></li>
								<li class={`${style.navbarLink} ${style.searchMobile}`}>{this.searchMobile()}</li>
								<li
									class={this.state.searchSelected === false ? style.navbarLink : style.linkHidden}
									onClick={() => { this.innerMenuClick(); }}
								>
									<a
										class={props.active === 'profile' && style.active}
										href="/"
									>
										Home
									</a>
								</li>
								<li class={this.state.searchSelected == false ? style.navbarLink : style.linkHidden} onClick={() => { this.innerMenuClick(); }}><a class={props.active == 'projects' && style.active} href="/projects">Projects</a></li>
								<li class={this.state.searchSelected == false ? style.navbarLink : style.linkHidden} onClick={() => { this.innerMenuClick(); }}><a class={props.active == 'donors' && style.active} href="/donors">Donors</a></li>
								<li class={this.state.searchSelected == false ? style.navbarLink : style.linkHidden} onClick={() => { this.innerMenuClick(); }}><a class={props.active == 'sdg' && style.active} href="/sustainable-development-goals">Sustainable development goals</a></li>
								<li class={this.state.searchSelected === false ? style.navbarLink : style.linkHidden} onClick={() => { this.innerMenuClick(); }}><a class={props.active == 'our-approaches' && style.active} href="/our-approaches">OUR APPROACHES</a></li>
								{
									screen.width > 991 ?
										<li class={this.state.searchSelected === false ? style.navbarLink : style.linkHidden} onClick={() => { this.innerMenuClick(); }}>
											<div class={style.dropdown}>
												<a class={style.dropbtn} > MORE</a>
												<div class={this.state.scrolled?`${style.dropdown_content} ${style.scrolledDropDown}`:style.dropdown_content}>
													<a class={style.dropDownItems} href="/about-us/open"> ABOUT US</a>
													<a class={style.dropDownItems} onClick={() => { this.innerMenuClick('download'); }}>Download</a>
												</div>
											</div>
										</li>
										:
										<section>
											<li class={this.state.searchSelected === false ? style.navbarLink : style.linkHidden} onClick={() => { this.innerMenuClick(); }}><a class={props.active === 'about' && style.active} href="/about-us/open">About us</a></li>
											<li class={this.state.searchSelected === false ? `${style.navbarLink} ${style.downloadsItem}` : style.linkHidden}  onClick={() => { this.innerMenuClick('download'); }} ><a>Download</a></li>
										</section>
								}
								<span class={style.dateUpdated}>{`Data last updated on: ${getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)}`}</span>
								<li class={this.state.searchSelected === true ? `${style.navbarLink} ${style.searchCentered}` : style.navbarLink} onClick={() => { this.innerMenuClick('search'); }}>{this.search()}</li>
							</ul>
							<div class={this.state.showMenu === 'open' ? style.backgroundLayer : style.hide} onClick={() => { this.menucloseClick(); }} />
							{
								this.state.showDownload && <DownloadModal onCloseModal={() => this.closeDownload()} />
							}

						</nav>
					</div>
				</header>
				<section class={style.bannerSection}>
					<section class={style.headerContainer}>
						<div class={style.overviewWrapper}>
							<h1>UNDP Transparency Portal</h1>
							<p class={style.summary}>
								In UNDP, we are committed to eradicating poverty, fighting climate change and reducing inequalities and exclusion around the world. Discover how, with the help of our partners, we work day to day to make this a reality.
							</p>
							<div class={style.searchItems}>
								<input type="text" name="search" id="search" class={style.searchField}
									placeholder="Search using Projects, Donors, Recipients or Keyword"
									value={this.props.searchAllResult.searchText}
									onInput={(e) => {
										this.props.updateSearchText(e.target.value);
									}}
									onKeyPress={(e) => {
										this.onKeyPress(e);

									}}
									ref={(input) => { this.textInput = input; }}
								/>
								<a><span onClick={() => this.navigateToSearchpage(this.textInput.value)} class={style.searchIcon}></span></a>
							</div>
						</div>
						<YearSummary />
					</section>
				</section>
			</section>
		);
	}
}

const mapStateToProps = (state) => ({
	lastUpdatedDate: state.lastUpdatedDate
});

export default connect(mapStateToProps)(homeHeader);