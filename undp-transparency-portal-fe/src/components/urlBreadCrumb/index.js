import { h, Component } from 'preact';
import { connect } from 'preact-redux';
import style from './style';


class Route extends Component {

    constructor(props){
        super(props);
        this.state = {
            data: {}
        }
    }


    generateBreadCrumbList = (routeArray) =>{
        return routeArray.map((data,index)=>{
            return (
                <li>
                    <a  class={ index ===routeArray.length -1?style.activeCrumb:style.inactiveCrumb} href={data.link}>{data.title}</a>
                </li>
            )
        })
    }

	render() {
        let { data } = this.props
		return (
			<ul class={this.props.marker ? style.markerBreadCrumb :style.breadCrumb} >
                    {
                        data.breadcrumb && this.generateBreadCrumbList(data.breadcrumb)
                    }
             </ul>
		);
	}
}

const mapStateToProps = (state) => {
    return {
        data: state.breadCrumb
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        // setPageHeader: data => dispatch(setPageHeader(data))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Route)
