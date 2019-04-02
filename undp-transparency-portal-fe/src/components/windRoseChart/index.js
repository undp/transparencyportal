import { h, Component } from 'preact';
import d3 from 'd3';
import style from './style'
import NoDataTemplate from '../no-data-template'
import { numberToCommaFormatter } from '../../utils/numberFormatter';
import CloseCard from '../../assets/images/closeCard.png';
export default class WindRoseChart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            description: {
                text: '',
                x: '',
                y: '',
                display: false
            },
            budgetExpense: {
                actual: '',
                target: '',
                x: '',
                y: '',
                display: false
            },
            showDisplay: false
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.data != this.props.data && nextProps.data.length > 0) {
            this.drawWindRose(nextProps.data, nextProps.sectorColor);
        }
        else if (!nextProps.data.length) {
            d3.select("#windRoseChart svg").remove();
        }
    }
    componentDidMount() {
        this.props.data.length > 0 &&
            this.drawWindRose(this.props.data, this.props.sectorColor);
        d3.select('#budget_expense').html(null).style("opacity", 0)
    }
    processData(chartData) {
        let list = chartData;
        let newList = list.map((item, index) => {
            item.percent = item.target == 0 ? 0 : Math.floor((item.actual / item.target) * 100)
            return item;
        })
        return newList;
    }

    modifyText = (string, limit) => {

        return string.slice(0, limit) + "..."
    }


    calcXpos = (xpos) => {
        if (xpos - 220 < 0) {
            return (220)
        }
        else if (xpos + 220 > window.outerWidth) {
            return (window.outerWidth - 220)
        }
        else {
            return xpos
        }
    }



    drawWindRose = (chartData, sectorColor) => {
        let data = this.processData(chartData);
        var that = this;
        let width = Math.min(window.outerWidth, 1200);
        let height = 700;
        let radius = 200,
            labelr = radius + 50;

        let color = d3.scale.ordinal()
            .range(["#98abc5", "#ffffff", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
        let arc;
        let arcColor = sectorColor;

        let pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return 1;
            });

        if (!d3.select("#windRoseChart").empty()) {
            d3.select("#windRoseChart svg").remove();
        }

        let svg = d3.select("#windRoseChart").append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + width + " " + height)
            .classed(`${style.svgIe}`, true)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        let g = svg.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        let outerArc = d3.svg.arc()
            .outerRadius(radius)
            .innerRadius(radius - 90);
        let innerArc = d3.svg.arc()
            .outerRadius(radius - 90)
            .innerRadius(0);

        g.append("path")
            .attr("d", outerArc)
            .style("fill", 'white')
            .style("stroke", "#d4d4d4")
            .style("stroke-width", 2)

        g.append("path")
            .attr("d", innerArc)
            .style("fill", 'white')
            .style("stroke", "#d4d4d4")
            .style("stroke-width", 2)


        let sector = data.length;
        let diff = (2 * Math.PI) / (sector * 3);
        let startAngle = diff;



        data.forEach((item, index) => {
            let arcRadius = item.percent * radius / 100;
            if (arcRadius > radius) arcRadius = radius + 30;
            let labelradius = arcRadius + 10;
            let themeArc = svg.append('g')
                .attr("class", "themes")
            arc = d3.svg.arc()
                .innerRadius(0)
                .outerRadius(arcRadius)
                .startAngle(startAngle)
                .endAngle(startAngle + diff)

            startAngle = startAngle + 3 * diff;
            themeArc.append("path")
                .attr("class", "arc")
                .attr("d", arc)
                .on("mouseover", function (d) {
                    d3.select('#budget_expense')
                        .html(`<div id="budget_expense_innerData" class=${style.actualDescriptionWrapper}>
                                 <div class=${style.actual}>Actual: ${numberToCommaFormatter(item.actual)}</div>
                                 <div class=${style.target}>Milestone: ${numberToCommaFormatter(item.target)}</div>
                    <div>`)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px")
                        .style("opacity", 1)
                })
                .on("mouseout", function (d) {
                    d3.select('#budget_expense').html(null).style("opacity", 0)

                })

                .style("fill", '#'+arcColor)
                .style("stroke", "#FFFFFF")
                .style("stroke-width", 2)

            themeArc.append('text')
                .attr("transform", function () {
                    let xTransformValue, yTransformValue
                    var c = arc.centroid(),
                        x = c[0],
                        y = c[1],
                        h = Math.sqrt(x * x + y * y);
                    if ((x / h * labelradius) <= 0) xTransformValue = (x / h * labelradius) - 10
                    else xTransformValue = (x / h * labelradius) + 10
                    if ((y / h * labelradius) <= 0) yTransformValue = (y / h * labelradius) + 5
                    else yTransformValue = (y / h * labelradius) + 10
                    return "translate(" + xTransformValue + ',' +
                        yTransformValue + ")";
                })
                .attr("font-size", "14px")
                .attr("font-weight", 'bold')
                .attr("fill", 'black')
                .attr("text-anchor", "middle")

                .text(() => {
                    return item.percent != 0 ? item.percent + '%' : null
                })

        })
        svg.append('g')
            .append('text')
            .attr("font-size", "14px")
            .attr("fill", 'black')
            .attr("transform", "translate(-5, 3)")
            .text('0%')

        svg.append('g')
            .append('text')
            .attr("font-size", "14px")
            .attr("fill", 'black')
            .attr("transform", "translate(-15," + (-(radius + 10)) + " )")
            .text('100%')

        g.append("text")
            .attr("transform", function (d) {
                var xTransformText, yTransformText;
                var c = outerArc.centroid(d),
                    x = c[0],
                    y = c[1],
                    h = Math.sqrt(x * x + y * y);
                if ((x / h * labelr) <= 0) xTransformText = (x / h * labelr) - 30
                else xTransformText = (x / h * labelr) + 30
                if ((y / h * labelr) >= 0) yTransformText = (y / h * labelr) - 25
                else yTransformText = (y / h * labelr) - 15
                return "translate(" + xTransformText + ',' +
                    yTransformText + ")";
            })
            .attr("font-size", "14px")
            .attr("fill", '#3a3a3a')
            .attr("width", 100)


            .attr("text-anchor", function (d) {
                return (d.endAngle + d.startAngle) / 2 > Math.PI ?
                    "end" : "start";
            })

            .text((d) => {
                return d.data.country_result.description
            })
            .attr("class", style.textDescription)
            .call(wrap, 200)
            .attr("cursor", "pointer")
            .on("mouseover", function (d, i) {
                d3.select("#display_label .tooltip")
                    .style('border', '1px solid #d4d4d4');
                that.setState({
                    description: {
                        ...that.state.description,
                        text: d.data.country_result.description,
                        x: that.calcXpos(d3.event.pageX),
                        y: d3.event.pageY + 30,
                        display: true
                    },
                });


            })

            .on("mouseout", function (d) {
                d3.select("#display_label .tooltip")
                    .style("border", "none");
                that.setState({
                    description: {
                        ...that.state.description,
                        display: false
                    }
                });

            })

        var div = d3.select("#display_label")
            .attr("class", style.tooltip)
            .style("opacity", 0);






        function wrap(text, width) {


            text.each(function () {
                let text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 0.1, // ems
                    y = text.attr("y"),
                    dy = 1,
                    tspan = text.text(null).append("tspan")
                        .attr("class", style.tspan)
                        .attr("x", 0).attr("y", y).attr("dy", dy + "em");



                while (word = words.pop()) {
                    if (lineNumber < 2) {
                        line.push(word);
                        if (line.join(" ").length < 45) {

                            tspan.text(line.join(" "));
                        }
                        else {
                            line.pop();
                            tspan.text(line.join(" "));
                            if (lineNumber !== 1) {
                                line = [word];
                                ++lineNumber;
                                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em").text(word);
                            }

                        }
                    }

                }
            });
        }
    }

    handleCloseDescription = () => {
        this.setState({
            description: {
                ...this.state.description,
                display: false
            }
        })
    }

    handleCloseBudget = () => {
        this.setState({
            budgetExpense: {
                ...this.state.budgetExpense,
                display: false
            }
        })
    }

    render(props, { description, budgetExpense }) {
        return (
            <div>
                <div id="windRoseChart"
                class={style.windRoseChart}
                ref={(node) => this.container = node}>
                </div>
                {
                    
                    this.props.data.length ?
                        description.display ?
                        <div id="display_label" class={style.tooltip} style={{ left: description.x - 200, top: description.y, padding: 10 }}>
                            <span class={style.textDescription}>{description.text}</span>

                        </div> : null
                        :<NoDataTemplate />
                }
                <div id="budget_expense" class={style.tooltip}>
                </div>
                
            </div>
        );
    }
}




