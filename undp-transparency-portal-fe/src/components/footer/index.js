import { h, Component } from 'preact';
import style from './style';
import ReactGA from 'react-ga';
import DownloadModal from '../downloadModal';
export default class Footer extends Component {
    constructor(props) {
		super(props);
		this.state = {
            headerClass: style.header,
			showDownload: false,
		};
    }
    closeDownload = () => {
        this.setState({ showDownload: false });
	}
    
    innerMenuClick = (type) => {
		if (type === 'download') {
			this.setState({ showDownload: true });
		}

		document.body.style.overflowY = 'scroll';
    }
    

    renderDownloadBox = () => {
        let {showDownload} = this.state;
        return showDownload ? <DownloadModal onCloseModal={() => this.closeDownload()} /> : null;
    }


    render() {
        var currentYear = new Date().getFullYear()
        return (
            <footer class={style.footer}>
                <a target="_blank" href="  http://www.undp.org"
                    onclick={() => ReactGA.ga('send',
                        'event',
                        'External Links',
                        'UNDP Logo',
                        'http://www.undp.org')}
                >
                    <img class={style.whiteLogo} src="/assets/images/logo_Undp.svg" alt=
                        "white-logo" />
                </a>
                <ul class={style.linkSection}>
                    <li class={style.linkItems}><a class={style.footerLink}
                        onclick={() => ReactGA.ga('send',
                            'event',
                            'External Links',
                            'About us',
                            'http://www.undp.org/about-us')}
                        target="_blank" href=" http://www.undp.org/about-us">About us</a></li>
                    <li class={style.linkItems}><a class={style.footerLink} 
                        onclick={() => ReactGA.ga('send',
                            'event',
                            'External Links',
                            'Sustainable Development Goals',
                            'http://www.undp.org/sustainable-development-goals')}
                        href="/sustainable-development-goals">Sustainable Development Goals</a></li>
                    <li class={style.linkItems}><a class={style.footerLink} target="_blank"
                        onclick={() => ReactGA.ga('send',
                            'event',
                            'External Links',
                            'Partners',
                            'http://www.undp.org/partners')}
                        href=" http://www.undp.org/partners">Partners</a></li>
                    <li class={style.linkItems}><a class={style.footerLink} target="_blank"
                        onclick={() => ReactGA.ga('send',
                            'event',
                            'External Links',
                            'Report fraud, abuse, misconduct',
                            'http://www.undp.org/content/undp/en/home/operations/accountability/audit/office_of_audit_andinvestigation.html')}
                        href="http://www.undp.org/content/undp/en/home/operations/accountability/audit/office_of_audit_andinvestigation.html">Report fraud, abuse, misconduct</a></li>
                    <li class={style.linkItems}><a class={style.footerLink} target="_blank"
                        onclick={() => ReactGA.ga('send',
                            'event',
                            'External Links',
                            'Submit social or environmental complaint',
                            'http://www.undp.org/content/undp/en/home/operations/accountability/secu-srm.html')}
                        href="http://www.undp.org/content/undp/en/home/operations/accountability/secu-srm.html">Submit social or environmental complaint</a></li>
                    <li class={style.linkItems}><a class={style.footerLink} target="_blank"
                        onclick={() => ReactGA.ga('send',
                            'event',
                            'External Links',
                            'Scam alert',
                            'http://www.undp.org/content/undp/en/home/operations/scam_alert.html')}
                        href="http://www.undp.org/content/undp/en/home/operations/scam_alert.html">Scam alert</a></li>
                    <li class={style.linkItems}><a class={style.footerLink} target="_blank"
                        onclick={() => ReactGA.ga('send',
                            'event',
                            'External Links',
                            'Terms of use',
                            'http://www.undp.org/content/undp/en/home/operations/copyright_and_termsofuse.html')}
                        href="http://www.undp.org/content/undp/en/home/operations/copyright_and_termsofuse.html">Terms of use</a></li>
                    <li class={style.linkItems} onClick={() => { this.innerMenuClick('download'); }}>
						<a class={style.footerLink}>Download</a>
							
                    </li>
                    { 
                        this.renderDownloadBox()
					}
                </ul>
            </footer>
        );
    }
}
