import { h, Component } from 'preact';
import List from '../../components/listView'
import style from './style';
import ProgressBar from '../../components/progressBar'
import { numberToCurrencyFormatter } from '../../utils/numberFormatter'
import donorProfile from '../profilePage/actions/donorActions'
import { connect } from 'preact-redux'
import { getAPIBaseUrRl } from '../../utils/commonMethods';

class SideBarDonorItem extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            styles: {
                alloted_budget: {
                    color: this.props.data.color,
                    fontSize: 18,
                    fontWeight: 600,
                    textTransform: 'uppercase'
                },
            },
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            styles: {
                alloted_budget: {
                    color: nextProps.data.color,
                    fontSize: 18,
                    fontWeight: 600,
                    textTransform: 'uppercase'
                },
            }
        })
    }


    renderTopRow = (item) => {
        let donor_name = item.ref_id ? item.org_name : item.level_3_name,
            donor_code = item.ref_id ? item.ref_id : item.level_3_code,
            donor_img =  item.donor_lvl ==='OTH' ?  '/assets/images/Empty.svg' :`${getAPIBaseUrRl()}/media/flag_icons/${ item.level_3_code}.svg`;
        return (
            <section class={style.row}>
                <article class={style.columnLeft}>
                    <div class={style.theme_wrapper}>

                        {donor_name ?
                          <section class={style.donorDataSection}>
                                <img src={donor_img} class={style.donorImg} 
                                     onError={(e)=>{ e.target.src = '/assets/images/Empty.svg'}}
                                />
                            <a href={`/profile/${donor_code}/donorprofile`}
                            target={this.props.embed?"_blank":""}
                            class={style.theme_name}>
                            {donor_name}
                            </a>
                        </section>
                           
                        
                        :   null
                        }
                    </div>
                </article>
            </section>
        );
    }
    renderMiddleRow = (item) => {
        return (
            <div>
                <section class={style.rowMiddle}>
                    <article class={style.columnLeft}>
                        <div class={style.percentageFill}>
                            <span>{item.total_budget ? numberToCurrencyFormatter(item.total_budget, 2) : numberToCurrencyFormatter(0)}</span>
                        </div>
                    </article>

                    <div class={style.arrowDesktop}>
                        <article class={style.columnRight}
                            onClick={() => this.handleLangChange()}>
                            {
                                this.props.embed ? null :
                                    <span class={style.theme_next} />
                            }
                        </article>
                    </div>
                    <div class={style.arrowMobile}>
                        <article class={style.columnRight}
                            onClick={() => {
                                this.props.selectMap && this.props.selectMap()
                            }}
                        >
                        {
                            this.props.embed ? null:<span class={style.theme_map} />
                        }
                        </article>
                    </div>
                </section>
            </div>
        );
    }

    handleLangChange = () => {
        var flag = true
        this.props.onSelectLanguage && this.props.onSelectLanguage(flag);
    }

    render() {
        return (
            <article className={this.props.selected ? style.isActive : style.isInActive}
                onClick={() => {
                    this.props.selectRow && this.props.selectRow(this.props)
                }}>
                {this.renderTopRow(this.props.data)}
                {this.renderMiddleRow(this.props.data)}
            </article>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        getDonorDetails: (code, year) => donorProfile(dispatch, code, year),
    }
}

export default connect(mapDispatchToProps)(SideBarDonorItem)