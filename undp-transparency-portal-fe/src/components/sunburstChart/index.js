/**************************** Preact files ******************************/
import { connect } from 'preact-redux';
import { h,Component } from 'preact';

/**************************** Style files******************************/
import style from './style';

/**************************** Components ******************************/
import d3 from 'd3';
import { numberToCurrencyFormatter } from "../../utils/numberFormatter";
import { getBrowserInformation } from "../../utils/commonActionUtils";
import SDGLegend from './components/sdgLegend';
import { getAPIBaseUrRl } from '../../utils/commonMethods';
import { updateSDG } from './../../routes/sdgLanding/action';

class SunburstChart extends Component {
    constructor(props) {
        super(props);
        this.isIE = false;
    }
    componentDidMount() {
        this._onSunburstBarChart(this);
    }
    _onSunburstBarChart(sunburstChart) {
        
        if( getBrowserInformation() && getBrowserInformation().toString().indexOf('IE') !== -1 )
            this.isIE = true;

        
        let userAgentString = window.navigator.userAgent.toLocaleLowerCase(),
            isSafari = userAgentString.indexOf("safari") && ( userAgentString.indexOf("iphone") > -1 || userAgentString.indexOf("ipad") > -1 ) ;
        
        var margins = {
            top: 40,
            right: 40,
            bottom: 45,
            left: 40
        },
        translateIndex = this.isIE ? -70 : 30;
        ;
        var width = this.props.width ? this.props.width : 400,
            height = this.props.height ? this.props.height - margins.bottom : 300,
            radius = Math.min(this.props.width, this.props.height) / 2,
            lastSelectedNode,
            _this = this;

        var x = d3.scale.linear()
            .range([0, 2 * Math.PI]);

        var y = d3.scale.linear()
            .range([0, radius]);

        var partition = d3.layout.partition()
            .sort(function (a, b) { return d3.ascending(Number(a.code), Number(b.code)); })
            .value(function (d) {
                return d.size ? d.size.budget : 1;
            });
        if (!d3.select('#' + this.props.chart_id).empty()) {
            d3.select('#' + this.props.chart_id + ' svg').remove();
        }
        var svg = d3.select('#' + this.props.chart_id)
            .append("svg")
            .attr("id", "multi_level_svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", "0 0 " + width + " " + (height + margins.bottom + margins.top))
            .classed("svg-content", true)
            .classed( this.isIE ? `${style.svgIe}` : '', true)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + ( (height / 2) + translateIndex) + ")");

        var tooltip = d3.select("body").append("div").attr("class", style.toolTip);
        var isLevelOne = true;
        d3.select("g").append("svg:image")
            .attr('x', -78)
            .attr('y', -78)
            .attr('class', `${style.sdgImage}`)
            .attr('width', 156)
            .attr('height', 156)
            .attr("xlink:href", getAPIBaseUrRl()+"/assets/images/sdg.png");
        let startAngle = 0;
        let endAngle = 0;
        var arc = d3.svg.arc()
            .startAngle(function (d) {
                startAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x)));
                return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
            })
            .endAngle(function (d) {
                endAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
                // return (endAngle - startAngle ) < 0.17? d.depth === 2?  0.17 : endAngle :endAngle ;
                return endAngle;
            })
            .innerRadius(function (d) {
                return isLevelOne ? 180 : Math.max(0, y(d.y));
            })
            .outerRadius(function (d) {
                return 307;
            });

        var g = svg.selectAll("path")
            .data(partition.nodes(this.props.data))
            .enter().append("g");

        var path = g.append("path")
            .attr("d", arc)
            .style("fill", function (d) {
                return '#' + d.color;
            })
            .style("stroke", "#ffffff")
            .style("stroke-width"
                , function (d) {
                    return d.image ? '0px' : '1px'
                })
            .attr("opacity", function (d) {
                return d.name === '' || (d.code !=="0" && !d.children) ? 0 : 1;
            })
            .style("display", function (d) {
                return d.name === '' || (d.code !=="0" && !d.children) ? 'none' : 'block';
            })
            .attr('class', style.rect)
            .on("click", click);
        if(!isSafari){
            path.on("mousemove", function (d) {
            if (d.name) {
                tooltip
                    .style("left", d3.event.pageX + 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .style("z-index", 2)
                    .html((d.code !=="0" && !d.children) ? '<span class="' + style.head + '">' + d.name + ': </span><span>' + d.description + '</span><br><span class="' + style.head + '">Budget: </span><span>' + numberToCurrencyFormatter(d.size.budget, 0) + '</span><br><span class="' + style.head + '"> Expense: </span><span>' + numberToCurrencyFormatter(d.size.expense, 0) + '</span>' : '<span class="' + style.head + '">' + d.name + ': </span><span>' + d.fullName + '</span><br><span class="' + style.head + '">Budget: </span><span>' + numberToCurrencyFormatter(d.size.budget, 0) + '</span><br><span class="' + style.head + '"> Expense: </span><span>' + numberToCurrencyFormatter(d.size.expense, 0) + '</span>');
            }
            })
            .on("mouseout", function (d) { tooltip.style("display", "none"); });
        }
        
        var text = g.append("text")
            .filter(filter_min_arc_size_text)
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")";
            })
            .attr("text-anchor", "middle")
            .attr("dx", "0") // margin
            .attr("dy", ".35em") // vertical-align

            .style("font-size", "15px")
            .style("display", function (d) {
                return d.name === '' || (d.code !=="0" && !d.children) ? 'none' : 'block';
            })
            .style("fill", "#ffffff")
            .on("click", click)
            .style("cursor", "pointer")
            .on("mousemove", function (d) {
                if (d.name) {
                    tooltip
                        .style("left", d3.event.pageX + 50 + "px")
                        .style("top", d3.event.pageY - 70 + "px")
                        .style("display", "inline-block")
                        .html((d.code !=="0" && !d.children) ? '<span class="' + style.head + '">' + d.name + ': </span><span>' + d.description + '</span>' : '<span class="' + style.head + '">' + d.name + ': </span><span>' + d.fullName + '</span><br><span class="' + style.head + '">Budget: </span><span>' + numberToCurrencyFormatter(d.size.budget, 0) + '</span><br><span class="' + style.head + '"> Expense: </span><span>' + numberToCurrencyFormatter(d.size.expense, 0) + '</span>');
                }

            })
            .on("mouseout", function (d) { tooltip.style("display", "none"); })

        g.append("svg:image")
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")rotate(" + computeImageRotation(d) + ")";
            })
            .attr("text-anchor", "middle")
            .attr("dx", "0") // margin
            .attr("dy", ".35em") // vertical-align
            .attr('width', 156)
            .attr('height', 156)
            .style("display", 'none')
            .attr("opacity", 0)
            .attr('class', style.rect)
            .on("click", imageClick)
            .attr("xlink:href", function (d) {
                return d.image ? d.image : '';
            });

        function filter_min_arc_size_text(d, i) {
            let compare
            if (d.depth > 1) {
                compare = 0.1
                if (d.parent.name === 'SDG 3') {
                    compare = 0.25
                }
                if (d.parent.name === 'SDG 16') {
                    compare = 0.3
                }
            }
            else {
                compare = 1
            }
            return (d.dx * d.depth * radius / 2) > compare
        };

        function click(d, isImgClick, goBack = false) {
            if(d.code!=="0") {
                isLevelOne = goBack
                tooltip.style("display", "none");
                d.code ? sunburstChart.props.updateSDG(parseInt(d.code)) : sunburstChart.props.updateSDG('');
                let glowCircle = d3.select('#glowCircle');
                glowCircle ? glowCircle.remove() : null;
                if (!isLevelOne) {
                    setTimeout(function () {
                        var path2 = d3.select("g")
                            .append("circle")
                            .attr("cx", 0)
                            .attr("cy", 0)
                            .attr("r", 158)
                            .attr('class', `${style.sdgCircle}`)
                            .attr("id", 'glowCircle')
                            .style("fill", function (d) {
                                return 'transparent';
                            })
                            .style("stroke", "#fdfdfd")
                            .style("stroke-width", '3px')
                            .style("stroke-linejoin", "round")
                            .style("stroke-linecap", "round")
                    }, 1000);



                }
                if (isImgClick === 0)
                    return;

                if (!d.children) {
                    _this.props.onTargetClick(d);
                    return;
                }

                text.transition().attr("opacity", 0);
                path.transition()
                    .duration(750)
                    .attrTween("d", arcTween(d))
                    .each("end", function (e, i) {
                        var arcTextAll = d3.select(this.parentNode).select("text");
                        arcTextAll.transition().duration(750)
                            .style("display", 'none')
                        // check if the animated element's data e lies within the visible angle span given in d
                        if (e.x >= d.x && e.x < (d.x + d.dx)) {
                            // get a selection of the associated text element
                            if (!isLevelOne) {
                                document.getElementById("leftArray").style.display = "none";
                                document.getElementById("rightArray").style.display = "none";
                                document.getElementById("sdgBackButton").style.display = "inline-block";
                                document.getElementById('sdgBackButton').onclick = function goBack() {
                                    if (lastSelectedNode) {
                                        click(lastSelectedNode.parent, true, true);
                                    }
                                }
                                var arcText = d3.select(this.parentNode).select("text");
                                // fade in the text element and recalculate positions
                                arcText.filter(filter_min_arc_size_text)
                                    .attr("transform", function (d) {
                                        return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")";
                                    })
                                    .attr("text-anchor", "middle")
                                    .attr("dx", "0") // margin
                                    .attr("dy", ".35em") // vertical-align
                                    .text(function (d, i) {
                                        return d.name;
                                    })
                                    .style("font-size", "15px")
                                    .style("pointer-events","none")
                                    .style("display", function (d) {
                                        return d.name === '' || (d.code !=="0" && !d.children) ? 'none' : 'block';
                                    })
                                    .style("fill", "#ffffff")
                                    .on("click", click)
                                    .style("cursor", "pointer")
                                    .on("mousemove", function (d) {
                                        if (d.name) {
                                            tooltip
                                                .style("left", d3.event.pageX + 50 + "px")
                                                .style("top", d3.event.pageY - 70 + "px")
                                                .style("display", "inline-block")
                                                .html((d.code !=="0" && !d.children) ? '<span class="' + style.head + '">' + d.name + ': </span><span>' + d.description + '</span>' : '<span class="' + style.head + '">' + d.name + ': </span><span>' + d.fullName + '</span><br><span class="' + style.head + '">Budget: </span><span>' + numberToCurrencyFormatter(d.size.budget, 0) + '</span><br><span class="' + style.head + '"> Expense: </span><span>' + numberToCurrencyFormatter(d.size.expense, 0) + '</span>');
                                        }

                                    })
                                    .on("mouseout", function (d) { tooltip.style("display", "none"); })
                                    .transition().duration(750)
                                    .attr("opacity", function (d) {
                                        return d.image ? isImgClick === true ? 1 : 0 : 1;
                                    })
                                    .attr("transform", function (d) {
                                        return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")";
                                    })
                                    .style("display", function (d) {
                                        return getPathOpacity(d, isImgClick) === 1 ? 'block' : 'none';
                                    })
                                    .attr("text-anchor", "middle");
                            } else {
                                document.getElementById("leftArray").style.display = "inline-block";
                                document.getElementById("rightArray").style.display = "inline-block";
                                document.getElementById("sdgBackButton").style.display = "none";
                            }

                            var arcImage = d3.select(this.parentNode).select("image");
                            arcImage.transition().duration(750)
                                .attr("opacity", d.image ? 1 : 0)
                                .style("display", d.image ? 'block' : 'none')
                                .attr("transform", function (d) {
                                    return "translate(" + -70 + ", -80)rotate(" + computeImageRotation(d) + ")";
                                })
                                .attr("text-anchor", "middle");

                            var pathItem = d3.select(this.parentNode).select("path");
                            pathItem.transition().duration(750)
                                .attr("opacity", function (d) {
                                    return getPathOpacity(d, isImgClick)
                                })
                                .style("display", function (d) {
                                    return getPathOpacity(d, isImgClick) === 1 ? 'block' : 'none';
                                })
                        }
                    });

                lastSelectedNode = d;
                _this.props.handleOnClick(lastSelectedNode);
            }
        }

        function imageClick(d) {
            _this.props.onSDGClick(d)
        }
        function getPathOpacity(d, isImgClick) {
            let opacityVal = 0;
            if (isImgClick === true) {
                opacityVal = d.name ? (d.code === "0" || d.children) ? 1 : 0 : 0;
            }
            else
                opacityVal = d.name ? 1 : 0;

            return opacityVal;
        }
        function arcTween(d) {
            var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                yd = d3.interpolate(y.domain(), [d.y, 1]),
                yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
            return function (d, i) {
                return i ? function (t) {
                    return arc(d);
                } : function (t) {
                    x.domain(xd(t));
                    y.domain(yd(t)).range(yr(t));
                    return arc(d);
                };
            };
        }

        function computeTextRotation(d) {
            var ang = (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
            return (ang > 90) ? 180 + ang : ang;
        }
        function computeImageRotation(d) {
            return 0;
        }
    }
    render() {
        if(this.props.data && this.props.data.children){
            const data = this.props.data.children,
                arrayLength = data.length,
                rightArray = data.slice(0, Math.ceil(arrayLength / 2)),
                leftArray = data.slice(Math.ceil(arrayLength / 2), arrayLength),
                windowWidth = window.innerWidth;
            return (
                <div class={style.sdgWrapper}>

                    <span style={{
                        display: 'inline-block',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        zIndex: 1
                    }}
                        id="rightArray"
                        class={this.props.embed ? `${style.rightArray} ${style.embedArray}`: style.rightArray}
                    ><SDGLegend data={leftArray}
                        embed={this.props.embed}
                        sdgTooltip='rightSDGTooltip' 
                        baseURL={getAPIBaseUrRl()}/>
                    </span>
                    <div style={{
                        height: 'auto', position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                    }}
                        class={style.hStackedBar_chart}
                        id={this.props.chart_id} >

                    </div>

                    <span style={{
                        display: 'inline-block', position: 'absolute',
                        top: 0,
                        left: 0
                    }}
                        id="leftArray"
                        class={this.props.embed ? `${style.leftArray} ${style.embedArray}`: style.leftArray}>
                        <SDGLegend data={windowWidth <= 649 ? data : rightArray}
                            sdgTooltip='leftSDGTooltip' 
                            embed={this.props.embed}
                            baseURL={getAPIBaseUrRl()}/>
                    </span>
                    <section class={`${style.backButtonContainer} ${this.props.backButtonTop}`}>
                        <button id="sdgBackButton" class={style.backButton}>
                            {windowWidth >= 650 ?
                            <img src={getAPIBaseUrRl()+'/assets/icons/backButtonImg.png'} class={style.backImg} /> : null
                            }
                            Back 
                        </button>
                    </section>
                </div>);   
        }
        
    }

}

const mapStateToProps = (state) => {
    const sdgSelected = state.sdgSelected;
		
	return {
        sdgSelected
	};
};

const mapDispatchToProps = (dispatch) => ({
    updateSDG: (sdg) => dispatch(updateSDG(sdg))
});


export default connect(mapStateToProps,mapDispatchToProps)(SunburstChart)
