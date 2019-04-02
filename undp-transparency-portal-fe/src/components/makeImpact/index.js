import { h, Component } from 'preact';
import style from './style';
import ArticleItem from '../articleItem'
export default class MakeImpact extends Component {
    render() {
        return (
            <ArticleItem title={'Making An Impact'}
                description={'More than 50 years of work in some 170 countries and territories.'}
            >
                <section class={style.medals}>
                    <article class={style.article}>
                        <img src="/assets/icons/lovelihoods.svg" alt="Ranking Image" />
                        <div class={style.impactWrapper}>
                            <span class={style.value}>37.3M</span>
                            <span class={style.text}>people</span>
                            <span class={style.description}>to benefit from improved livelihoods</span>
                        </div>
                    </article>
                    <article class={style.article}>
                        <img src="/assets/icons/new_jobs.svg" alt="Job Creation" />
                        <div class={style.impactWrapper}>
                            <span class={style.text}>Nearly</span>
                            <span class={style.value}> 3M </span>
                            <span class={style.description}>people to find new jobs, 41% of them women</span>
                        </div>

                    </article>
                    <article class={style.article}>
                        <img src="/assets/icons/money.svg" alt="Disaster Reduction" />
                        <div class={style.impactWrapper}>
                            <span class={style.text}>Nearly</span>
                            <span class={style.value}>170M</span>
                            <span class={style.description}> voters to register in 52 countries</span>
                        </div>
                    </article>
                    <article class={style.article}>
                        <img src="/assets/icons/Legal.svg" alt="Disaster Reduction" />
                        <div class={style.impactWrapper}>
                        <span class={style.value}>4.1M</span>
                        <span class={style.text}>people</span>
                        <span class={style.description}>to gain access to legal aid services in 39 countries, 51% of them women</span>
                        </div>
                    </article>
                    <article class={style.article}>
                        <img src="/assets/icons/power.svg" alt="Disaster Reduction" />
                        <div class={style.impactWrapper}>
                        <span class={style.text}>More than</span>
                        <span class={style.value}>6.7M</span>
                        <span class={style.description}>  people to have improved access to energy in 55 countries</span>
                        </div>
                    </article>
                    <article class={style.article}>
                        <img src="/assets/icons/exchange.svg" alt="Disaster Reduction" />
                        <div class={style.impactWrapper}>
                        <span class={style.text}>ranked</span>
                        <span class={style.value}># 1</span>
                        <span class={style.description}>   in value for money in Development Information for Policy Making</span>
                        </div>
                    </article>
                </section>
            </ArticleItem>
        );
    }
}
