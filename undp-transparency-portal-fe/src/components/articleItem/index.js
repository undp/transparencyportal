import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import style from './style';

export default class ArticleItem extends Component {
    render() {
        return (
            <section class={style.acheivements}>
                <h2 class={style.heading}>{this.props.title}</h2>
                <span class='heading-highlight'></span>
                <p class={style.mainDescription}>{this.props.description}</p>
                {this.props.children}
            </section>
        );
    }
}