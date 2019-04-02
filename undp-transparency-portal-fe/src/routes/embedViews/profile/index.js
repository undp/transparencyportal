import { h, Component } from 'preact';
import BootTable from '../../../components/bootstraptable'
import Map from '../../../components/map';
import { connect } from 'preact-redux';
import { loadProjectListMapData } from '../../../shared/actions/mapActions/projectListMapData';
import {
    updateYearList,
    setCurrentYear
} from "../../../shared/actions/getYearList";
import style from './style';

import ProfilePage from './profilePage';


class EmbedProfileView extends Component {


    constructor(props){
        super(props);
        this.state={
            projectList: [],
            unitType: "",
            selectedCountry: {
				name: '',
				iso2: '',
				iso3: '',
				email: '',
				web: ''
			},
			profileFound:false
        }

        this.profileFound = false;
		this.profileName = ""
		this.profileType = "Donor Profile"

    }


    componentWillMount() {
        window.scrollTo(0, 0)
        this.props.countryList.countries.forEach((item, index) => {
            if (item.iso2 == this.props.code || item.iso3 == this.props.code) {
                this.profileFound = true
                this.setState({ unitType: 2, selectedCountry: item ,profileFound:true})
                this.profileName = item.name
            }
        })
        if (!this.profileFound) {
            this.props.searchResult.forEach((item, index) => {
                if (item.code == this.props.code) {
                    item.iso3 = item.code;
                    this.profileFound = true
                    this.setState({ unitType: 1, selectedCountry: item,profileFound:true })
                    this.profileName = item.name
                }
            })
        }
        if (this.props.type == 'recipientprofile') this.profileType = 'Recipient Profile'
    }
    componentWillReceiveProps = (nextProps) => {
		if (nextProps.type !== this.props.type || nextProps.code != this.props.code) {
			nextProps.type === 'recipientprofile' ? this.profileType = 'Recipient Profile' : this.profileType = 'Donor Profile'
			this.setState({profileFound:false});
			this.profileFound = false
		}
		if (!this.profileFound && nextProps.countryList.countries.length) {
			nextProps.countryList.countries.forEach((item, index) => {
				if (item.iso2 == nextProps.code || item.iso3 == nextProps.code) {
					this.profileFound = true
					this.setState({ unitType: 2, selectedCountry: item,profileFound:true })		// Only Both Profiles
					this.profileName = item.name
				}
			})
		}

		if (!this.profileFound &&
			nextProps.masterDonorList.data != undefined && !this.profileFound) {
			nextProps.masterDonorList.data.donors.forEach((item, index) => {
				if (item.code == this.props.code) {
					item.iso3 = item.code;
					this.profileFound = true
					this.setState({ unitType: 3, selectedCountry: item,profileFound:true })	// Only Donor Profile
					this.profileName = item.name

				}
			})
		}
		if (!this.profileFound &&
			nextProps.masterDonorList.data != undefined && !this.profileFound) {
			nextProps.masterDonorList.data.donors.forEach((donor, index) => {
				donor.organisations.forEach((item, index) => {
					if (item.code == this.props.code) {
						item.iso3 = item.code;
						this.profileFound = true
						this.setState({ unitType: 3, selectedCountry: item,profileFound:true })	// Only Donor Profile
						this.profileName = item.name

					}
				})

			})
		}
		if (!this.profileFound && this.props.searchResult != nextProps.searchResult) {
			nextProps.searchResult.forEach((item, index) => {
				if (item.code == this.props.code) {
					item.iso3 = item.code
					this.profileFound = true
					this.setState({ unitType: 1, selectedCountry: item,profileFound:true })
					this.profileName = item.name
				}
			})
		}
		if (!this.profileFound &&
			nextProps.masterDonorList.data != undefined && !this.profileFound) {
			nextProps.masterDonorList.data.donors.forEach((donor, index) => {
				donor.organisations.forEach((item, index) => {
					if (item.code == this.props.code) {
						item.iso3 = item.code;
						this.profileFound = true
						this.setState({ unitType: 3, selectedCountry: item,profileFound:true })	// Only Donor Profile
						this.profileName = item.name

					}
				})

			})
		}
	}

    render() {
        return (
					this.state.profileFound?	<ProfilePage
					countries={this.state.unitType == 1 ? this.props.searchResult : this.props.countryList.countries}
					countryCode={this.props.code}
					selectedCountry={this.state.selectedCountry}
					unitType={this.state.unitType}
					profileType={this.props.type}
					{...this.props}
				 />:null
        )
    }
}


const mapStateToProps = (state) => {
	const { list:searchResult } = state.countryRegionSearch
	return {
		router: state.router,
		countryList: state.countryList,
		masterDonorList: state.masterDonorList,
		searchResult
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		searchCountryRegionsListData: () => dispatch(searchCountryRegionsListData())
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(EmbedProfileView)
