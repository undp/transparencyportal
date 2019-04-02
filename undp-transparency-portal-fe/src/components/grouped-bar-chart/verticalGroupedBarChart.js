import { h, Component } from 'preact';
import style from './style'
import d3 from 'd3'
import { numberToCurrencyFormatter } from '../../utils/numberFormatter'
export default class VerticalGroupedBarChart extends Component {

    componentDidMount() {
        this._onDrawGroupedBarChart();
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this._onDrawGroupedBarChart();
        }
    }
    _onDrawGroupedBarChart() {
        var dataArray = [{
            "type_level_3": "Proj 1",
            "total_budget": 4499890,
            "total_expense": 2704659
        },
        {
            "type_level_3": "Proj 2",
            "total_budget": 3277946,
            "total_expense": 2027307

        },
        {
            "type_level_3": "Proj 3",
            "total_budget": 2141490,
            "total_expense": 1208495

        },
        {
            "type_level_3": "Proj 4",
            "total_budget": 1938695,
            "total_expense": 1140516

        },
        {
            "type_level_3": "Proj 5",
            "total_budget": 1558919,
            "total_expense": 894368

        },
        {
            "type_level_3": "Proj 6",
            "total_budget": 1345341,
            "total_expense": 737462

        },
        {
            "type_level_3": "Proj 7",
            "total_budget": 1345341,
            "total_expense": 737462

        },
        {
            "type_level_3": "Proj 8",
            "total_budget": 1345341,
            "total_expense": 737462

        }
        ]
        var data = this.props.data ? this.props.data : dataArray,
            label = this.props.label ? this.props.label : 'type_level_3'
        var margin = { top: 40, right: 20, bottom: 40, left: 40 },
            width = this.props.width ? this.props.width : 400,
            height = this.props.height ? this.props.height - margin.top - margin.bottom : 300;

        var y0 = d3.scale.ordinal()
            .rangeRoundBands([height, 0], .1);

        var y1 = d3.scale.ordinal();

        var x = d3.scale.linear()
            .range([0, width - 200])

        var color = d3.scale.ordinal()
            .range(['#16537d', '#cae1f7']);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(6)
            .tickFormat('')
            // .tickFormat(
            //     function (d) {
            //         return numberToCurrencyFormatter(d, 0);
            //     })
            .innerTickSize(-height)
            .outerTickSize(0)
            .tickPadding(10);


        var yAxis = d3.svg.axis()
            .scale(y0)
            .orient("left");

        if (!d3.select('#' + this.props.chart_id).empty()) {
            d3.select('#' + this.props.chart_id + ' svg').remove();
        }

        var actualHeight = height + margin.top + margin.bottom;

        var svg = d3.select('#' + this.props.chart_id).append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + width + " " + actualHeight)
            .classed("svg-content", true)
            .classed(`${style.svgIe}`, true)

        var ageNames = d3.keys(data[0]).filter(function (key) { return (key == "total_expense" || key == "total_budget"); });

        data.forEach(function (d) {
            d.ages = ageNames.map(function (name) { return { name: name, value: +d[name] }; });
        });
        data = this.props.slice_limit ? data.slice(0, this.props.slice_limit) : data
        data.sort((a, b)=>{return (a.total_budget - b.total_budget)})
        y0.domain(data.map(function (d) { return d[label]; }));
        y1.domain(ageNames).rangeRoundBands([0, y0.rangeBand()]);
        x.domain([0, d3.max(data, function (d) { return d3.max(d.ages, function (d) { return d.value; }); })]);

        var alteredHeight = height + 20;
        var translate_xaxis = this.props.translate_xaxis ? this.props.translate_xaxis : 20,
            translate_yaxis = this.props.translate_yaxis ? this.props.translate_yaxis : 60,
            translate_graph = this.props.translate_graph ? this.props.translate_graph : 50;

        svg.append("g")
            .attr("class", style.xaxis)
            .attr("transform", "translate(" + translate_yaxis + "," + 10 + ")")
            .call(yAxis)
            .selectAll('text')
            .call(wrap, 200)
            .selectAll('tspan')
            .attr("font-size", this.props.tspanSize)
        svg.append("g")
            .attr("class", style.yaxis)
            .call(xAxis)
            .attr("transform", "translate(" + translate_xaxis + "," + (alteredHeight + 10) + ")")
            .selectAll('text').attr("font-size", this.props.textSize)

        var wrap = svg.append("g")
            .attr("transform", "translate(" + translate_graph + "," + 20 + ")")

        var state = wrap.selectAll(".state")
            .data(data)
            .enter().append("g")
            .attr("class", "state")
            .attr("transform", function (d) {
                return "translate(0,"+y0(d[label])+")";
            });

        state.selectAll("rect")
            .data(function (d) { return d.ages; })
            .enter().append("rect")
            .attr("height", y1.rangeBand())
            .attr("x", function (d, i) {
                return 0

            })
            .attr("y", function (d) {  return y1(d.name); })
            .attr("width", function (d) { return x(d.value); })
            .style("fill", function (d) { return color(d.name); })
        function wrap(text, width) {
            text.each(function () {
                let text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 0.35, // ems
                    y = text.attr("y"),
                    dy = 0.6,
                    tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em").attr("font-size", 12);
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word).attr("font-size", 12);
                    }
                }
            });
        }
    }


    render() {
        return (
            <div class={style.grouped_chart}
                id={this.props.chart_id} >
            </div>);
    }
}



 // .attr("width", x1.rangeBand())
//  .attr("x", function (d, i) {
//     return i === 0 ? x1(d.name) : x1(d.name) - 250;

// })