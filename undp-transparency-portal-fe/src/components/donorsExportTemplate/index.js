import { h, Component } from "preact";
import style from "./style";
import DonutChart from '../donutChart';
import BudgetExpenseLegend from '../budget-expense-legend'
import Map from '../map';
import { Scrollbars } from 'react-custom-scrollbars';
import GlobalDonorTemplate from './noDonorSelectedTemplate'
import VerticalGroupedBarChart from '../grouped-bar-chart/verticalGroupedBarChart'
import DonorDetailsTemplate from './donorSelectedTemplate';

export default class DonorsExportTemplate extends Component {

    pickExportTemplate(year, donorSelected, unitSelected, themeSelected, sdgSelected, tabData) {
        if(donorSelected && donorSelected!=""){
            return <DonorDetailsTemplate
                    year={year}
                    unitSelected={unitSelected}
                    themeSelected={themeSelected}
                    sdgSelected={sdgSelected}
                    tabData={tabData}
            />
        }
        else{
            return <GlobalDonorTemplate
                    year={year}
                    unitSelected={unitSelected}
                    themeSelected={themeSelected}
                    sdgSelected={sdgSelected}
                    tabData={tabData}
                />
        }
    }

    render({year, donorListLoading, donorSelected, unitSelected, themeSelected, sdgSelected, tabData},state) {
        return (
            <div class={style.mainWrapper} style={{ height: '100%' }}>
                {
                    this.props.countryTemplate && this.renderPagination()
                }
                <Scrollbars style={this.props.countryTemplate ? { height: 'calc(100% - 36px)' } : { height: '100%' }}
                    renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}
                >
                    <div class={style.pdfBackground}>
                        {
                            donorListLoading ?
                                <span class={style.previewLoading}>Generating Preview</span>
                                :
                                        this.pickExportTemplate(year, donorSelected, unitSelected, themeSelected, sdgSelected, tabData)
                        }
                    </div>
                </Scrollbars>
            </div>
        )
    }


}