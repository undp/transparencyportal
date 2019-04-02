import { h, Component } from 'preact';

import style from './style'

export default class ProgressBar extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      styles: {
        progressWrapper: {
          width: this.props.percentage + '%',
          backgroundColor: this.props.color,
        },
        progressPercent: {
          color: this.props.color,
          fontFamily: 'Bebas',
          left: this.props.percentage + '%'
        }
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      styles: {
        progressWrapper: {
          width: nextProps.percentage + '%',
          backgroundColor: nextProps.color,
        },
        progressPercent: {
          color: nextProps.color,
          fontFamily: 'Bebas',
          left: nextProps.percentage + '%'
        }
      }
    })
  }

  render() {
    var percentage =
    // this.props.tabSelected === "sdg" ? Math.ceil(this.props.percentage) :
    parseFloat(this.props.percentage).toFixed(1)
    return (
      <div>
        <div class={style.progressOuterWrapper}>
            <span  class={style.progressWrapper} style={this.state.styles.progressWrapper}>
            </span>
            <span class={style.progressPercent} style={this.state.styles.progressPercent}>
              {!parseInt(percentage)?'<1':percentage}
            <span style={this.state.styles.progressPercentage}>{'%'}</span>
            </span>
        </div>
      </div>
    )
  }
}
