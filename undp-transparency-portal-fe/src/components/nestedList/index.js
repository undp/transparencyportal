import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import style from './style';
import { Scrollbars } from 'react-custom-scrollbars';
import Accordion from '../nestedDropList/component'
import NoDataTemplate from '../no-data-template'
import PreLoader from '../preLoader';


export default class NestedList extends Component {
    constructor(props) {
        super(props);
    }

    handleDataChange = (newValue) =>{
        this.props.handleChange(newValue)
    }


    render({dataList,loading, wrapperClass},state) {

        const initLoading = this.props.initialLoading?this.props.initialLoading:null;

        return (

                <div class={`${style.dropDownUl} ${wrapperClass && wrapperClass}`} style={this.props.wrapperStyle}>
                    <Scrollbars renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}>
                        {

(initLoading || loading)?<PreLoader/>:(
                            dataList.length!==0? dataList.map((item) => {
                                return (
                                    <Accordion baseURL={this.props.baseURL} handleChange={this.handleDataChange} data={item} donor={this.props.donor} />

                                )
                            }):  <div class={style.noResultWrapper}><div>No Results</div></div>
                        )


                        }
                    </Scrollbars>

                </div>


        )
    }
}

