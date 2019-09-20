import { h, Component, render } from 'preact';
import { connect } from 'preact-redux';
import { fetchaboutUsContent } from '../../shared/actions/aboutUs';
import style from './style';
import Markup from 'preact-markup';
import PreLoader from '../preLoader';
import NoDataTemplate from '../no-data-template'
import { route } from 'preact-router';
import { Scrollbars } from 'react-custom-scrollbars';
import ReactGA from 'react-ga';

class About extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: '',
            accordionopenSelected: false,
        }
    }

    componentWillMount() {
        this.props.fetchaboutUsContent();
        let divs = document.body.querySelectorAll('.linkColor');
        for (let i = 0; i < divs.length; ++i) {
            divs[i].addEventListener('click', this.bindReactGA.bind(this))
        }
        
    }
    bindReactGA(event) {
        ReactGA.ga('send',
            'event',
            'External Links',
            event.target.text,
            event.target.href)
    };

    getContent(profileType, contentList) {
        let tab = 1;
        switch (profileType) {
            case "open": tab = 1; break;
            case "FAQ": tab = 2; break;
            case "glossary": tab = 3; break;
            case "contactinfo": tab = 4; break;
            case "trainings": tab = 5; break;
        }
        
        contentList.forEach((item, index) => {
            if (item.tab == tab) {
                
                this.setState({ content: item.html_content }, () => {
                    let divs = document.body.querySelectorAll('.linkColor');
                    for (let i = 0; i < divs.length; ++i) {
                        divs[i].addEventListener('click', this.bindReactGA.bind(this))
                    }
                });
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.profileType != nextProps.profileType) {
            document.body.className = style.accordionScroll;
            this.getContent(nextProps.profileType, nextProps.aboutUsContent.contentList)
        }
        if (this.props.aboutUsContent.contentList != nextProps.aboutUsContent.contentList) {
            this.getContent(nextProps.profileType, nextProps.aboutUsContent.contentList)
        }
    }

    componentWillUnmount() {
        document.body.className = '';
        [...document.body.querySelectorAll('.linkColor')].forEach((item, index) => {
            item.length > 0 ? Object.values(item).removeEventListener('click', this.bindReactGA.bind(this)): null;
        });
    }

    onAboutUsSelect = (about) => {
        if (this.state.accordionopenSelected)
            document.body.className = '';
        else
            document.body.className = style.accordionScroll;
        this.setState({ accordionopenSelected: !this.state.accordionopenSelected })
        route(`/about-us/` + about)
    }
    render(props) {
        return (
            <div>
                <div class={style.desktop}>
                    <div class={style.tabSwitch}>
                        <ul class={style.list}>
                            <li class={style.aboutWrapper} onClick={() => this.onAboutUsSelect('open')}>
                                <button class={props.profileType == "open" ? `${style.active} ${style.buttonStyle}` : style.buttonStyle}>ABOUT OPEN.UNDP</button>
                            </li>
                            <li class={style.aboutWrapper} onClick={() => this.onAboutUsSelect('FAQ')}>
                                <button class={props.profileType == "FAQ" ? `${style.active} ${style.buttonStyle}` : style.buttonStyle}>FAQ</button>
                            </li>
                            <li class={style.aboutWrapper} onClick={() => this.onAboutUsSelect('glossary')}>
                                <button class={props.profileType == "glossary" ? `${style.active} ${style.buttonStyle}` : style.buttonStyle}>GLOSSARY</button>
                            </li>
                            <li class={style.aboutWrapper} onClick={() => this.onAboutUsSelect('contactinfo')}>
                                <button class={props.profileType == "contactinfo" ? `${style.active} ${style.buttonStyle}` : style.buttonStyle}>CONTACT</button>
                            </li>
                            <li class={style.aboutWrapper} onClick={() => this.onAboutUsSelect('trainings')}>
                                <button class={props.profileType == "trainings" ? `${style.active} ${style.buttonStyle}` : style.buttonStyle}>ONLINE TRAINING COURSES</button>
                            </li>
                        </ul>
                    </div>
                    <div id="content-div">
                        {
                            this.props.aboutLoading ?
                            <div style={{position:'relative',height:'300px'}}><PreLoader /></div>
                            : this.state.content != '' ?
                            <Markup markup={this.state.content}
                                type="html"
                                trim={false}
                            />
                            :
                            <NoDataTemplate />
                        }
                    </div>
                </div>
                <div class={style.mobile}>
                    <div class={style.accordion}>
                        <div class={props.profileType == "open" && this.state.accordionopenSelected ? `${style.accordionItem} ${style.accordionPosition}` : style.accordionItem}>
                            <div class={props.profileType == "open" && this.state.accordionopenSelected ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={() => this.onAboutUsSelect('open')}>
                                <h3 class={style.accordionHead}>ABOUT OPEN.UNDP</h3>
                            </div>
                            {
                                props.profileType == "open" && this.state.accordionopenSelected
                                    ?
                                    <div class={style.accordionContent}>
                                        <div class={style.aboutUs}>
                                            <Scrollbars renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}>
                                                {
                                                    this.state.content != '' &&
                                                    <Markup markup={this.state.content}
                                                        type="html"
                                                        trim={false}
                                                    />
                                                }
                                            </Scrollbars>
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                        <div class={props.profileType == "FAQ" && this.state.accordionopenSelected ? `${style.accordionItem} ${style.accordionPosition}` : style.accordionItem}>
                            <div class={props.profileType == "FAQ" && this.state.accordionopenSelected ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={() => this.onAboutUsSelect('FAQ')}>
                                <h3 class={style.accordionHead}>FAQ</h3>
                            </div>
                            {
                                props.profileType == "FAQ" && this.state.accordionopenSelected
                                    ?
                                    <div class={style.accordionContent}>
                                        <div class={style.aboutUs}>
                                            <Scrollbars renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}>
                                                {
                                                    this.state.content != '' &&
                                                    <Markup markup={this.state.content}
                                                        type="html"
                                                        trim={false}
                                                    />
                                                }
                                            </Scrollbars>
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                        <div class={props.profileType == "glossary" && this.state.accordionopenSelected ? `${style.accordionItem} ${style.accordionPosition}` : style.accordionItem}>
                            <div class={props.profileType == "glossary" && this.state.accordionopenSelected ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={() => this.onAboutUsSelect('glossary')}>
                                <h3 class={style.accordionHead}>GLOSSARY</h3>
                            </div>
                            {
                                props.profileType == "glossary" && this.state.accordionopenSelected
                                    ?
                                    <div class={style.accordionContent}>
                                        <div class={style.aboutUs}>
                                            <Scrollbars renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}>
                                                {
                                                    this.state.content != '' &&
                                                    <Markup markup={this.state.content}
                                                        type="html"
                                                        trim={false}
                                                    />
                                                }
                                            </Scrollbars>
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                        <div class={props.profileType == "contactinfo" && this.state.accordionopenSelected ? `${style.accordionItem} ${style.accordionPosition}` : style.accordionItem}>
                            <div class={props.profileType == "contactinfo" && this.state.accordionopenSelected ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={() => this.onAboutUsSelect('contactinfo')}>
                                <h3 class={style.accordionHead}>CONTACT</h3>
                            </div>
                            {
                                props.profileType == "contactinfo" && this.state.accordionopenSelected
                                    ?
                                    <div class={style.accordionContent}>
                                        <div class={style.aboutUs}>
                                            <Scrollbars renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}>
                                                {
                                                    this.state.content != '' &&
                                                    <Markup markup={this.state.content}
                                                        type="html"
                                                        trim={false}
                                                    />
                                                }
                                            </Scrollbars>
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                        <div class={props.profileType == "trainings" && this.state.accordionopenSelected ? `${style.accordionItem} ${style.accordionPosition}` : style.accordionItem}>
                            <div class={props.profileType == "trainings" && this.state.accordionopenSelected ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={() => this.onAboutUsSelect('trainings')}>
                                <h3 class={style.accordionHead}>ONLINE TRAINING COURSES</h3>
                            </div>
                            {
                                props.profileType == "trainings" && this.state.accordionopenSelected
                                    ?
                                    <div class={style.accordionContent}>
                                        <div class={style.aboutUs}>
                                            <Scrollbars renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}>
                                                {
                                                    this.state.content != '' &&
                                                    <Markup markup={this.state.content}
                                                        type="html"
                                                        trim={false}
                                                    />
                                                }
                                            </Scrollbars>
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        aboutUsContent: state.aboutUsContent,
        aboutLoading: state.aboutUsContent.loading
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchaboutUsContent: () => dispatch(fetchaboutUsContent()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(About)