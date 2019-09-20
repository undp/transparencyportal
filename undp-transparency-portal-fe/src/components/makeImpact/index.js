import { h, Component } from 'preact';
import style from './style';
import ArticleItem from '../articleItem'
export default class MakeImpact extends Component {
    render() {
        return (
            <ArticleItem title={'Making An Impact'}
                description={'More than 50 years of work in some 170 countries and territories. In 2018'}
            >
                <section class={style.medals}>
                <article class={style.article}>
                        <img src="/assets/icons/make-an-impact/Poverty1.svg" alt="Tackling Poverty" />
                        <div class={style.impactWrapper}>
                            <span class={style.value}>31M</span>
                            <span class={style.text}>people</span>
                            <span class={style.description}>had better access to the services they need to tackle poverty</span>
                        </div>
                    </article>
                    <article class={style.article}>
                        <img src="/assets/icons/make-an-impact/Job1.svg" alt="Job Creation" />
                        <div class={style.impactWrapper}>
                            <span class={style.value}>4M</span>
                            <span class={style.text}>people</span>
                            <span class={style.description}>living in or recovering from crisis got a job or improved their livelihoods</span>
                        </div>
                    </article>
                    <article class={style.article}>
                        <img src="/assets/icons/make-an-impact/SustEnergy1.svg" alt="Sustainable Energy Image" />
                        <div class={style.impactWrapper}>
                            <span class={style.text}>Leveraged</span>
                            <span class={style.value}>$6B</span>
                            <span class={style.description}>from public and private sources across 110 countries for sustainable energy</span>
                        </div>
                    </article>
                    <article class={style.article}>
                        <img src="/assets/icons/make-an-impact/Vote1.svg" alt="Voter Image" />
                        <div class={style.impactWrapper}>
                            <span class={style.value}>21M</span>
                            <span class={style.text}>people</span>
                            <span class={style.description}>registered to vote in 2018</span>
                        </div>
                    </article>
                    <article class={style.article}>
                        <img src="/assets/icons/make-an-impact/GreenCars1.svg" alt="Green Cars Image" />
                        <div class={style.impactWrapper}>
                            <span class={style.value}>256M</span>
                            <span class={style.text}>tonnes</span>
                            <span class={style.description}>of carbon emissions cut with our support (equivalent to 50 million cars in one year)</span>
                        </div>
                    </article>
                    <article class={style.article}>
                        <img src="/assets/icons/make-an-impact/WomenEmpowerment1.svg" alt="Women Empowerment Image" />
                        <div class={style.impactWrapper}>
                            <span class={style.value}>73</span>
                            <span class={style.text}>countries</span>
                            <span class={style.description}>promoted women in leadership and decisionmaking positions</span>
                        </div>
                    </article>
                    {/* <article class={style.article}>
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
                    </article> */}
                </section>
            </ArticleItem>
        );
    }
}
