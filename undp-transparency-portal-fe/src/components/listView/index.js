import Render from './Render';
import { h, Component } from 'preact';
import { Link } from 'preact-router/match';

export default class List extends Component {
  constructor(props, context) {
    super(props, context);
  }
  render() {
    const props = this.props;
    return Render.bind(this)(props);
  }
}

