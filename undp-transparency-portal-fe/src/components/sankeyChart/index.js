/*********************** Preact *******************************/
import { h, Component } from 'preact';
import PropTypes from 'prop-types';

/******************* Third party plugins **********************/
import d3 from 'd3';
require('d3.chart');
require('d3-plugins-sankey');

/********************** Custom components *********************/
import NoDataTemplate from '../no-data-template';
import Sankey from './d3.chart.sankey.js';

/*********************** Util Actions *************************/
import { numberToCurrencyFormatter } from '../../utils/numberFormatter';

/*********************** Style Files **************************/
import style from './style';
import commonConstants from '../../utils/constants';
/**************************************************************/
export default class SankeyChart extends Component {
	constructor(props) {
		super(props);
		this.state = {
			sankeyData: this.props.data,
			currentYearSelected: this.props.currentYearSelected
		};
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.data != this.props.data) {    // Check if there is data change
			this.setState({
				sankeyData: nextProps.data
			});
			this.drawSankey();                      // Draws Sankey Chart only on data change
		}
	}
	componentDidMount() {
		if (this.state.sankeyData.nodes.length && this.state.sankeyData.links.length)   // Check if nodes and lengths of sankey data non empty
			this.drawSankey();
	}


	drawSankey() {
		var chart, tooltip;
		if (!d3.select('#sankey svg').empty()) {    // Removes existing svg and tooltip from DOM
			d3.select('#sankey' + ' svg').remove();
			d3.select('#sankey' + ' .tooltip').remove();
		}
		chart = d3.select('#sankey')        // Appends svg to the div with id = sankey
			.append('svg')
			.chart('Sankey.Path');   // Chart Type = Sankey.Path

		tooltip = d3.select('#sankey')      // Create span element for tooltip and append it to div with id = sankey
			.append('span')
			.attr('class', 'tooltip');
			// .style('opacity', 0);

		chart.name(label)                   // function to add node label
			.colorNodes(                    // color for nodes
				function (name, node) {
					if(node.color)
						return '#' + node.color;
					else
						return '#013B69';
				})
			.colorLinks(                    // color for labels
				function (link) {
					return '#' + link.source.color;
				})
			.nodeWidth(15)                  // width of node
			.nodePadding(30)                // vertical space between nodes
			.spread(true)                   // whether to spread nodes vertically after layout
			.draw(this.state.sankeyData);


		d3.selectAll('.link')               // Set all link opacities to .05 initially
			.style('fill', 'none')
			.style('stroke-opacity', '.05');

		d3.select('span.tooltip')           // Customize tooltip
			.style('text-align', 'center')
			.style('padding', '10px')
			.style('font', '12px')
			.style('color', '#000')
			.style('background', '#fff')
			.style('border', '1px solid #ccc')
			.style('border-radius', '8px')
			.style('pointer-events', 'none')
			.style('position', 'absolute');

		d3.selectAll('.node rect')          // Node Customization
			.style('fill-opacity', '1')
			.style(' shape-rendering', 'crispEdges')
			.style('stroke-width', '0')
			.on('mouseover', function (d) { // Mouse over function
				d3.select(this)
					.style('cursor', 'pointer')         // Set cursor to pointer
					.style('stroke-width', '1');         // Increase stroke width
				d3.selectAll('.link')
					.style('stroke-opacity', '0.8')     // Increase stroke opacity
					.append;
				tooltip.transition()
				.duration(500)
				.style('opacity', 0);
				d3.select(this).style('stroke-opacity', '.05');
			}).on('mouseout', function () { // Mouse out function
				d3.select(this)
					.style('cursor', 'none')            // Set cursor to none
					.style('stroke-width', '0');         // Reset stroke width
				d3.selectAll('.link')
					.style('stroke-opacity', '.05');     // Reset stroke opacity

			});



		d3.selectAll('.node text')
			.text(function(d){
				return d.short_name ? d.short_name : d.name;
			})                      // Add Text shadow to node text
			.style('text-shadow', '0 1px 0 #fff').call(wrap);

		function label(node) {                          // Add node label
			return node.name.replace(/\s*\(.*?\)$/, '');
		}

		function wrap(text) {
		  text.each(function() {
		    var text = d3.select(this),
		        words = text.text().split(/\s+/).reverse(),
		        word,
		        width = 200,
		        line = [],
		        lineNumber = 0,
		        lineHeight = 0.9, // ems
		        y = text.attr("y"),
		        xx = text.attr("x"),
		        dy = parseFloat(text.attr("dy")),
		        tspan = text.text(null).append("tspan").attr("x", xx).attr("y", y).attr("dy", dy + "em");
		    while (word = words.pop()) {
		      line.push(word);
		      tspan.text(line.join(" "));
		      if (tspan.node().getComputedTextLength() > width) {
		        line.pop();
		        tspan.text(line.join(" "));
		        line = [word];
		        tspan = text.append("tspan").attr("x", xx).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		      }
		    }
		  });
		}

		d3.selectAll('.link')   // Link Customization
			.on('click', function (link) {
				tooltip.transition()
					.duration(200)
					.style('opacity', .9);
				tooltip.html(link.source_name + ' - ' + link.target_name + ': ' +
					'<strong>' + numberToCurrencyFormatter(link.value, 2) + '</strong>')
					.style('left', (d3.event.pageX - 28) + 'px')
					.style('top', (d3.event.pageY - 28) + 'px');
				d3.select(this)
					.style('stroke-opacity', '0.8')
					.style('cursor', 'pointer')
					.append;
			})
			.on('mouseover', function (link) {
				tooltip.transition()
					.duration(200)
					.style('opacity', .9);
				tooltip.html(link.source_name + ' - ' + link.target_name + ': ' +
					'<strong>' + numberToCurrencyFormatter(link.value, 2) + '</strong>')
					.style('left', (d3.event.pageX - 28) + 'px')
					.style('top', (d3.event.pageY - 28) + 'px')
					.style('text-align', 'center')
					.style('padding', '10px')
					.style('font', '12px')
					.style('color', '#000')
					.style('background', '#fff')
					.style('border', '1px solid #ccc')
					.style('border-radius', '8px')
					.style('pointer-events', 'none')
					.style('position', 'absolute');
		
				d3.select(this)
					.style('stroke-opacity', '0.8')
					.style('cursor', 'pointer')
					.append;
			}).on('mouseout', function () {
				tooltip.transition()
					.duration(500);
					// .style('opacity', 0);
				d3.select(this).style('stroke-opacity', '.05');
			});
	}

	render() {
		var isNonEmpty = this.state.sankeyData.links.length > 0
            && this.state.sankeyData.links.length > 0;
		return (
			<div>
				{
					isNonEmpty ?
						<section class={style.sankey_container} >
							<div class={style.legend_container}>
								<span class={`${style.legend_row}`}>
									<span class={style.legend_row_title}>Budget Sources</span>
									<span>{'Where our resources come from'}</span>
								</span>
								<span class={`${style.legend_row} ${this.props.sankeyYear >= commonConstants.SIGNATURE_SOLUTION_YEAR ? style.child2 : ''}`}>
									<span class={style.legend_row_title}>Recipient Region</span>
									<span>{'Where our resources go'}</span>
								</span>
								<span class={`${style.legend_row} ${this.props.sankeyYear >= commonConstants.SIGNATURE_SOLUTION_YEAR ? style.child3 : ''}`}>
									<span class={style.legend_row_title}>Our Focus</span>
									<span>{'What our resources are spent on'}</span>
								</span>
								{this.props.sankeyYear >= commonConstants.SIGNATURE_SOLUTION_YEAR ? <span class={`${style.legend_row} ${this.props.sankeyYear >= commonConstants.SIGNATURE_SOLUTION_YEAR ? style.child4 : ''}`}>
									<span class={style.legend_row_title}>Signature Solutions</span>
									<span>{'Which solutions are applied'}</span>
								</span> 
									:null
								}
								
							</div>

							<div class={style.sankey} id="sankey"></div>
						</section>
						:
						< NoDataTemplate />
				}
			</div>
		);
	}
}
SankeyChart.propTypes = {
	data: PropTypes.object
};