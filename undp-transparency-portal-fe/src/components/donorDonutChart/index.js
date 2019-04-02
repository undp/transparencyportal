import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import { numberToCurrencyFormatter, roundTo } from '../../utils/numberFormatter';
import style from './style';
import d3 from 'd3';
import DonorDonutChartLegend from '../donor-donut-chart-legend';
import RegularOtherLegend from '../regular-other-legend';
import { getSDGImageFromCode } from '../../utils/commonActionUtils';

export default class DonorDonutChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data ? this.props.data : [],
            label: this.props.data[0] && (this.props.data[0].fund_stream || this.props.data[0].fund_type || this.props.data[0].sector_name) ? (this.props.data[0].fund_stream || this.props.data[0].fund_type || this.props.data[0].sector_name) : "",
            sdg_code: this.props.data[0] && this.props.data[0].sdg_code ? this.props.data[0].sdg_code : "",
            percentage: this.props.data[0] && this.props.data[0].percentage ? this.props.data[0].percentage : 0,
            total_contribution: this.props.data[0]?!isNaN(this.props.data[0].total_contribution)?this.props.data[0].total_contribution:this.props.data[0].theme_budget:0
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.data,
            label: nextProps.data[0] && (nextProps.data[0].fund_stream || nextProps.data[0].fund_type || nextProps.data[0].sector_name) ? (nextProps.data[0].fund_stream || nextProps.data[0].fund_type || nextProps.data[0].sector_name) : "",
            sdg_code: nextProps.data[0] && nextProps.data[0].sdg_code ? nextProps.data[0].sdg_code : "",
            percentage: nextProps.data[0] && nextProps.data[0].percentage ? nextProps.data[0].percentage : 0,
            total_contribution: nextProps.data[0]?!isNaN(nextProps.data[0].total_contribution)?nextProps.data[0].total_contribution:nextProps.data[0].theme_budget:0
        },
            () => {
                if (nextProps.data.length !== 0) {
                    this.drawDonut()

                }
            }
        )
    }

    componentDidMount() {
        if (this.props.data.length !== 0 && this.props.chart_id) {
            this.drawDonut();
        }
    }

    drawDonut = () => {
        const EDGE = window.navigator.userAgent.indexOf("Edge") > -1,
            IE = false || !!document.documentMode,
            EDGE_IE = EDGE || IE;

        var that = this;

        let data = this.state.data
        var width = this.props.chartWidth ? this.props.chartWidth : 400,
            height = this.props.chartHeight ? this.props.chartHeight : 400,
            radius = Math.min(width, height) / 2,
            labelr = radius + 40,
            outerRadius = this.props.outerRadius || radius - 10,
            innerRadius = this.props.innerRadius || radius - 70;

        var arc = d3.svg.arc()
            .outerRadius(outerRadius)
            .innerRadius(innerRadius);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.percentage;
            })
            .padAngle(0);


        const onHover = (d) => {
            this.setState({
                label: d.data.fund_stream || d.data.fund_type || d.data.sector_name,
                percentage: d.data.percentage,
                sdg_code: d.data.sdg_code,
                total_contribution: !isNaN(d.data.total_contribution)?d.data.total_contribution:d.data.theme_budget
            }, () => {

            })
        }

        if (!d3.select('#' + this.props.chart_id).empty()) {
            d3.select('#' + this.props.chart_id + ' svg').remove();
        }

        var svg = d3.select('#' + this.props.chart_id)
            .append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + width + " " + height)
            .classed(`${style.svgIe}`, true)
            .append("g")
            .attr("transform",
                "translate(" + width / 2 + "," + height / 2 + ") scale(0.7, 0.7)");

        var g = svg.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");
         
        var newArcs = g.append("path")
            .attr("d", arc)
            .style("fill", function (d) { return "#" + (d.data.color || d.data.sector_color); })

        var [firstArc, ...lastArc] = newArcs[0];
        firstArc.style.opacity = 1;
        firstArc.setAttribute("transform", 'scale(1.025,1.025)');
        firstArc.style.stroke = "#eee"
        firstArc.style.strokeWidth = "1px"
        lastArc.forEach((item) => {
            item.style.transform = 'scale(1, 1)';
            item.style.stroke = "#eee"
            item.style.strokeWidth = "1px"
        })
        !this.props.exportLegend &&
            newArcs.on("mouseover", (d, i) => {

                if (EDGE_IE) {
                    var newArray = [];
                    d3.select(`#${that.props.chart_id}`).selectAll(".arc")[0].forEach((item) => {

                        for (var i = 0, len = item.childNodes.length; i < 1; ++i) {
                            var child = item.childNodes[i];
                            newArray.push(child)
                            if (child.nodeType !== 1/*Node.ELEMENT_NODE*/) continue;
                            // Now, do whatever you want with the child element.
                        }
                    })
                    var all = [...newArray]

                    all.forEach((item) => {
                        item.style.opacity = 1;
                        item.setAttribute("transform", 'scale(1,1)');
                    })

                    let current = d3.event.target;
                    current.setAttribute("transform", 'scale(1.025,1.025)');
                    current.style.stroke = "#eee"
                    current.style.strokeWidth = "1px"
                    onHover(d);
                } else {
                    var all = d3.select(`#${that.props.chart_id}`).selectAll(".arc")[0].filter((item) => {
                        return item.children && (item.children[0] !== d3.event.target);
                    })
                    d3.selectAll(all).selectAll("path")
                        .style('transform', 'scale(1,1)')
                        .style('opacity', 1);

                    let current = d3.event.target;
                    current.style.transform = 'scale(1.025,1.025)';
                    current.style.stroke = "#eee"
                    current.style.strokeWidth = "1px"
                    onHover(d);
                }
            })
    }

    calculateTotalContribution(dataset) {
        let total_contribution = 0;
        dataset.forEach((item, index)=>{
            total_contribution += item.theme_budget
        })
        return numberToCurrencyFormatter(parseFloat(total_contribution), 2)
    }

    render(props, { label, percentage, total_contribution, sdg_code }) {
        var sdg_src = sdg_code && getSDGImageFromCode(sdg_code);
        this.props.legendData = _.remove(this.props.legendData, function(n) {
            return n.fund_stream !== 'Regular Resources';
        });
        return (
            <div>
            <div class={`${style.donut_wrapper} ${this.props.donor_wrapper_styles}`}>
                <div class={`${style.donut} ${this.props.donut_styles}`} id={this.props.chart_id}>

                    {
                        !this.props.exportLegend && (percentage != 0 || percentage != "") ? <span class={`${style.textLabel} ${this.props.textWrapperStyle}`} >
                            {sdg_code ? <span class={style.imageWrapper}><img class={style.sdg_image} src={`../../../assets/icons/${sdg_src}`} alt="sdg image"/></span> : null}
                            <span class={`${style.perc} ${this.props.perc}`}>
                                {percentage == parseInt(percentage)
                                    ?
                                    parseInt(percentage) + '%' 
                                    : (percentage >= 1) ? roundTo(percentage, 1) + '%' : '< 1%'
                                }
                            </span>
                            <span class={`${style.textField} ${this.props.textFieldStyle}`}>{label}</span>
                            <span class={`${style.dollor} ${this.props.dollor}`}>{numberToCurrencyFormatter(total_contribution, 2)}</span>
                        </span> : null
                    }
                    {
                        this.props.exportLegend &&
                            <span class={`${style.textLabel} ${this.props.textWrapperStyle}`} >
                                <span class={style.dollor}>{this.calculateTotalContribution(props.data)}</span>
                                <span class={`${style.textField} ${this.props.textFieldStyle}`}>Total Contribution</span>
                            </span>
                    }

                </div>
                {
                    this.props.displayRegularLegend && this.props.displayRegularLegend == 'false' ? null : <div class={`${style.legend} ${this.props.legend_styles}`}>
                        <RegularOtherLegend data={_.sortByOrder(this.props.regularOtherData, ['fund_type'], ['desc'])}/>
                    </div>

                }
               
                {
                    this.props.exportLegend ?
                        <div class={`${style.exportLegend} ${this.props.legend_styles}`}>
                            <ul class={style.legendWrapper}>
                                {
                                    this.props.data.map((item, index) => {
                                        return (
                                            <li class={style.legendItem}>
                                                <span class={style.legendColor} style={{ backgroundColor: '#' + item.color }}></span>
                                                <span class={style.legendDescription}>{item.fund_stream}</span>
                                                <span class={style.legendPercentage}>{roundTo(item.percentage, 2)}%</span>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                        : null
                }
            </div>
             {
                this.props.displayLegend && this.props.displayLegend == 'false' ? null : <div class={style.regularOtherLegend}>
                    <DonorDonutChartLegend legendLabel={this.props.legendLabel} legendData={this.props.legendData} />
                </div>

            }
            </div>
        )
    }
}






