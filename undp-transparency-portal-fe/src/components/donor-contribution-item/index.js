import { h, Component } from "preact";
import { numberToCurrencyFormatter } from "../../utils/numberFormatter";
import { roundTo } from "../../utils/numberFormatter";
import style from "./style";

export default class DonorContributionItem extends Component {
  constructor(props, context) {
    super(props, context);
    var color = '#' + this.props.data.color
    this.state = {
      styles: {
        allDonorWrapper: {
          width: this.props.data.percentage + "%",
          height: 25,
          backgroundImage: `repeating-linear-gradient(45deg,#fff,#fff 2px,#fff 2px,${color} 4px)`,
          backgroundColor: color,
          borderWidth: 1,
          borderStyle:"solid",
          borderColor: color,
          verticalAlign: "middle"
        },
        countryWrapper: {
          width:
            this.props.data.country_percentage *
            this.props.data.percentage /
            100 +
            "%",
          height: 25,
          backgroundColor: color,
          verticalAlign: "middle"
        }
      }
    };
  }
  componentWillReceiveProps(nextProps) {
    var color = '#' + nextProps.data.color
    this.setState({
      styles: {
        allDonorWrapper: {
          height: 25,
          verticalAlign: "middle",
          width: nextProps.data.percentage + "%",
          backgroundImage: `repeating-linear-gradient(45deg,#fff,#fff 2px,#fff 2px,${color} 4px)`,
          backgroundColor: color,
          borderWidth: 1,
          borderStyle:"solid",
          borderColor: color
        },
        countryWrapper: {
          width:
            nextProps.data.country_percentage *
            nextProps.data.percentage /
            100 +
            "%",
          height: 25,
          backgroundColor: color,
          verticalAlign: "middle"
        }
      }
    });
  }

  render() {
    var percentage = roundTo((this.props.data.country_percentage * 100) / 100, 1);
    let percentageToShow;
    if (percentage === 0) {
      percentageToShow = '0'
    } else if (percentage > 0 && percentage < 1) {
      percentageToShow = '<1'
    } else {
      percentageToShow = percentage
    }
    return (
      <section class={style.wrapper}>
        <div class={style.row}>{this.props.data.fund_stream}</div>
        <div class={style.row}>
          <div class={style.rowWrapper}>
            <div
              class={`${style.countryWrapper} ${style.rowWrapperItem}`}
              style={this.state.styles.countryWrapper}
            />
            <div class={style.rowText}>
              <span>
                {numberToCurrencyFormatter(
                  this.props.data.country_contribution,
                  2
                )}
              </span>
              <span class={style.country_percentage}>
                {percentageToShow}%
              </span>
            </div>
          </div>
          <div class={style.rowWrapper}>
            <div
              class={`${style.allDonorWrapper} ${style.rowWrapperItem}`}
              style={this.state.styles.allDonorWrapper}
            />
            <div class={style.rowText}>
              {numberToCurrencyFormatter(this.props.data.total_contribution, 2)}
            </div>
          </div>
        </div>
      </section>
    );
  }
}
