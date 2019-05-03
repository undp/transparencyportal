import { h, Component } from 'preact';
import { getFormmattedDate } from '../../utils/dateFormatter';
import style from './style'

export default class projectimeline extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			data: this.props.data ? this.props.data : {},
			perc: 0
		},
		this.isProjectTimeLineNonEmpty = this.props.data && Object.keys(this.props.data).length > 0
	}
	componentWillMount() {
		this.setPercentCompleted();
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.data != this.props.data) {
			this.isProjectTimeLineNonEmpty = nextProps.data && Object.keys(nextProps.data).length > 0
			this.setState({
				data: nextProps.data
			}, () =>
				this.setPercentCompleted()
			)
		}
	}
  setPercentCompleted = () => {
  	let perc = this.calculatePerc() + "%";
  	this.setState({ perc: perc });
  }
  calculatePerc = () => {
  	if (this.isProjectTimeLineNonEmpty) {
  		var start = new Date(this.state.data.start_date),
  			end = new Date(this.state.data.end_date),
  			today = new Date(),
  			p = Math.round(((today - start) / (end - start)) * 100);
  		return p
  	}
  }
  render() {
  	if (this.isProjectTimeLineNonEmpty) {
  		var length = this.state.data.year_array.length,
  			start_year = this.state.data.year_array[0],
  			end_year = this.state.data.year_array[length - 1],
  			divisions = end_year - start_year,
  			width_factor = 100 / divisions,
  			list = [];
  		for (var i = start_year; i <= end_year; i++) {
  			list.push(i);
  		};
  	}
  	return (
  		<section>
  			{this.isProjectTimeLineNonEmpty &&
          <section>
          	<p class={style.timeLine}>Project Timeline</p>
          	<div class={style.progressBar}>
          		<div class={style.progressBarChild} style={{ width: this.state.perc }}>
          		</div>
          		{list.map((el, index) => {
          			let width_percentage =
                  {
                  	left: index * width_factor + '%'
                  }
          			return (
          				<div class={style.bar_step} style={width_percentage}>
          					<div class={style.label_percent}>{el}</div>
          					<div class={style.label_line}></div>
          				</div>
          			)
          		})
          		}
          	</div>
          	<div class={style.dateWrapper}>
          		<span>{getFormmattedDate(this.state.data.start_date)}</span>
          		<span>{getFormmattedDate(this.state.data.end_date)}</span>
          	</div>

          </section>
  			}</section>
  	)
  }
}
