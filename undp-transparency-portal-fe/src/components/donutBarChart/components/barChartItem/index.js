import { h, Component } from "preact";
import { numberToCurrencyFormatter } from "../../../../utils/numberFormatter";
import { getSDGImageFromCode } from '../../../../utils/commonActionUtils'
import style from "./style";

export default class ChartItem extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      styles: {
        allDonorWrapper: {
          width: (this.props.data.budgetPercentage + "%"),
          height: 25,
          backgroundColor: '#42689b',
          borderLeftWidth: 1,
          borderColor: '#42689b',
          verticalAlign: "middle"
        },
        countryWrapper: {
          width: this.props.data.expensePercentage + "%"
          ,
          height: 25,
          backgroundColor: "#cae1f7",
          verticalAlign: "middle"
        }
      }
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      styles: {
        allDonorWrapper: {
          height: 25,
          verticalAlign: "middle",
          width: nextProps.data.budgetPercentage + "%",
          backgroundColor: '#42689b',
          borderLeftWidth: 1,
          borderColor: '#42689b'
        },
        countryWrapper: {
          width: nextProps.data.expensePercentage + "%",
          height: 25,
          backgroundColor: "#cae1f7",
          verticalAlign: "middle"
        }
      }
    });
  }

  render() {
    var sdg_src =this.props.data.sdg_code && getSDGImageFromCode(this.props.data.sdg_code)
    return (
      <section class={`${style.wrapper} ${style.wrapperSdg}`}>
        <div class={style.rowLegend}>
        {this.props.data.sdg_code ? <span class={style.imageWrapper}><img class={style.sdg_image} src={`../../../assets/icons/${sdg_src}`} alt="sdg image" /></span>:
        <div class={style.innerLegend} style={{backgroundColor:'#'+this.props.data.color}}></div> }

        </div>
        <div class={style.row}><span class={style.barType}>{this.props.data.sector_name}</span></div>
        <div class={style.row}>

          <div class={style.rowWrapper}>
            <div
              class={`${style.allDonorWrapper} ${style.rowWrapperItem}`}
              style={this.state.styles.allDonorWrapper}
            />
            <div class={style.text} style={{ left: this.state.styles.allDonorWrapper.width }}>
              <span class={style.barValue}>
                {numberToCurrencyFormatter(
                  this.props.data.total_budget,
                  2
                )}
              </span>
            </div>

          </div>
          <div class={style.rowWrapper}>
            <div
              class={`${style.countryWrapper} ${style.rowWrapperItem}`}
              style={this.state.styles.countryWrapper}
            />
            <div class={style.text} style={{ left: this.state.styles.countryWrapper.width }}>

              <span class={style.barValue}>
                {numberToCurrencyFormatter(
                  this.props.data.total_expense,
                  2
                )}
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
