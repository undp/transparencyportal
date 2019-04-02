import { h, Component } from 'preact';
import d3 from 'd3';
import style from './style';
import { connect } from 'preact-redux';
import { numberToCurrencyFormatter } from '../../utils/numberFormatter';
class AreaChartView extends Component {
    constructor() {
        super();
        this.state = {
            budget_utilization: {}
        };
    }
    componentWillReceiveProps = (nextProps) => {

        const budget_utilization =  nextProps.projectDetail.budget_utilization,
                {expense_data,budget_data} = budget_utilization;

        if (nextProps.projectDetail.budget_utilization != this.props.projectDetail.budget_utilization) {
            this.setState({
                budget_utilization: nextProps.projectDetail.budget_utilization
            }, () => {
                if(expense_data && budget_data){
                    this.drawAreaChart();
                }
            });
        }
    }
    drawAreaChart = () => {
        let widthOfDevice = window.outerWidth;
        var formatxAxis = d3.format('.0f');
        var formatyAxis = d3.format('');
        var margin = { top: 20, right: 20, bottom: 30, left: 50 },
            height = 250 - margin.top - margin.bottom,
            width = 500 - margin.left - margin.right;
        var x = d3.scale.linear()
            .range([0, width]);

        var tickLength = this.props.projectDetail.budget_utilization.expense_data.length!==0?this.props.projectDetail.budget_utilization.expense_data.length-1:1;

        var addedHeigth = height+margin.top+margin.bottom;


        var y = d3.scale.linear()
            .range([height, 0]);
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(tickLength)
            .tickFormat(formatxAxis);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5)
            .tickFormat(
            function (d) {
                return numberToCurrencyFormatter(d,0);
            });



        var areaBudget = d3.svg.area()
            .x(function (d) { return x(d.year); })
            .y0(height)
            .y1(function (d) { return y(d.budget); });
        var areaExpense = d3.svg.area()
            .x(function (d) { return x(d.year); })
            .y0(height)
            .y1(function (d) { return y(d.expense); });

        var lineFuncExpense = d3.svg.line()
            .x(function (d) { return x(d.year); })
            .y(function (d) { return y(d.expense); });
        var lineFuncBudget = d3.svg.line()
            .x(function (d) { return x(d.year); })
            .y(function (d) { return y(d.budget); });


        if (!d3.select('#area_chart').empty()) {
            d3.select('#area_chart' + ' svg').remove();
        }

        var addedWidth = width+margin.left+margin.right;


        var svg = d3.select("#area_chart")
            .append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 "+ addedWidth+" "+ addedHeigth)
            .classed(`${style.svgContent}`, true)
            .classed(`${style.svgIe}`, true)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var div = d3.select("#display_label")
            .attr("class", style.tooltip)
            .style("opacity", 0);

        x.domain(d3.extent(this.props.projectDetail.budget_utilization.budget_data, function (d) { return d.year; }));
        y.domain([0, d3.max(this.props.projectDetail.budget_utilization.budget_data, function (d) { return d.budget; })]);


        svg.append("path")
            .datum(this.props.projectDetail.budget_utilization.budget_data)
            .attr("class", style.chart_area1)
            .attr("d", areaBudget);


        svg.append("path")
            .datum(this.props.projectDetail.budget_utilization.budget_data)
            .attr("class", style.line_chart1)  // with a darker color
            .attr("d", lineFuncBudget);



        svg.append("path")
            .datum(this.props.projectDetail.budget_utilization.expense_data)
            .attr("class", style.chart_area2)
            .attr("d", areaExpense);

        svg.append("path")
            .datum(this.props.projectDetail.budget_utilization.expense_data)
            .attr("class", style.line_chart2)  // with a darker color
            .attr("d", lineFuncExpense);


        svg.selectAll("dot")
            .data(this.props.projectDetail.budget_utilization.budget_data)
            .enter().append("circle")
            .attr("r", 3.5)
            .attr("cx", function (d) { return x(d.year); })
            .attr("cy", function (d) { return y(d.budget); })
            .attr("class", style.budgetDot)
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 1);

                div.html(`<span class=${style.yearDisplay}>${d.year}</span><div class=${style.contentWrapper}><div class=${style.markerWrapper}><span class=${style.budgetMarker}></span></div><div><span class=${style.expenseWrapper}>Budget : ${numberToCurrencyFormatter(d.budget,2)}</span></div></div>`)
                    .style("left", (d3.event.pageX) - 150 + "px")
                    .style("top", (d3.event.pageY) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        svg.selectAll("dot")
            .data(this.props.projectDetail.budget_utilization.expense_data)
            .enter().append("circle")
            .attr("r", 3.5)
            .attr("cx", function (d) { return x(d.year); })
            .attr("cy", function (d) { return y(d.expense); })
            .attr("class", style.budgetDot)
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 1);

                div.html(`<span class=${style.yearDisplay}>${d.year}</span><div class=${style.contentWrapper}><div class=${style.markerWrapper}><span class=${style.expenseMarker}></span></div><div><span class=${style.expenseWrapper}>Expense : ${numberToCurrencyFormatter(d.expense,2)}</span></div></div>`)
                    .style("left", (d3.event.pageX) - 150 + "px")
                    .style("top", (d3.event.pageY) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.append("g")
            .attr("class", style.xaxis)
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .attr("stroke", "#bdbdbd");


        svg.append("g")
            .attr("class", style.yaxis)
            .call(yAxis)
            .attr("stroke", "#bdbdbd")
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("dy", "1em")
            .style("text-anchor", "end");
    }


    componentDidMount() {
        const budget_data = this.props.projectDetail.budget_utilization.budget_data,
                 expense_data =  this.props.projectDetail.budget_utilization.expense_data;
        if(Object.keys(this.props.projectDetail.budget_utilization).length && budget_data && expense_data )
        this.drawAreaChart();
        }

    render() {
        return (
            <div id="area_chart" class={style.area_chart}>
                <div id="display_label" className={style.tooltip}>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        projectDetail: state.projectDetail
    };
};

const mapDispatchToProps = (dispatch) => {
    return {

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AreaChartView);