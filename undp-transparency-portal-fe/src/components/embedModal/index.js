import { h, Component } from 'preact';
import style from './style';
import closeIcon from '../../assets/images/closeCard.png';
import { Scrollbars } from 'react-custom-scrollbars';


export default class EmbedModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			displayNoData: false,
			iframeHeight: '100%'
		};
	}

	handleCopyBtnPress = () => {
		this.embedUrlBox.select();
		document.execCommand('Copy');
	}

	componentWillUnmount() {
		document.body.style.overflowY = 'scroll';
		window.removeEventListener('mousedown', this.handleOutsideClick);
		window.removeEventListener('touchstart', this.handleOutsideClick);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.display !== this.props.display) {
			if (!this.props.display) {
				document.body.style.overflowY = 'hidden';
				window.addEventListener('mousedown', this.handleOutsideClick);
				window.addEventListener('touchstart', this.handleOutsideClick);
			} else {
				document.body.style.overflowY = 'scroll';
				window.removeEventListener('mousedown', this.handleOutsideClick);
				window.removeEventListener('touchstart', this.handleOutsideClick);
			}
		}
	}

	handleOutsideClick = (e) => {
		if (!this.modal.contains(e.target)) {
			this.props.handleClose();
		}
	}

	handleOnSelect = (e, data) => {
		this.props.handleOnSelect(e, data);
	}
	onCLose = () => {
		this.props.handleClose();
	}
	generateSelectionList = () => {
		let flag = false;
		let checkList = this.props.checkList.map((item) => {
			flag = flag || item.flag;
			return (
				<div class={style.list}>
					<input type={'checkbox'} checked={item.flag} onChange={(e) => { this.handleOnSelect(e, item); }} />
					<label for={item.label}>{item.label}</label>
				</div>
			);
		});
		if (flag !== this.state.displayNoData) {
			this.setState({
				displayNoData: flag
			}, () => {

			});
		}

		return checkList;

	}
	render({ display, children }, { displayNoData }) {
		return (
			display ?
				<section className={style.outerContainer}>
					<div className={style.modalContainer} ref={(node) => this.modal = node}>
						<header class={style.headerWrapper}>
							<h3 className={style.resultsHeader}>Embed</h3>
							<span className={style.closeBtn} onClick={() => this.onCLose()} />
						</header>
						<div class={style.srcollBarWrapper}>
								<div class={style.modalContent}>
									<div class={style.innerContentWrapper}>

										<div class={style.selctionListWrapper}>
											<div class={style.selectionText}>Select the section you would like to include in your website</div>
											{this.generateSelectionList()}
										</div>

										<div class={style.childrenWrapper}>
											{
												this.state.displayNoData ?
													<div class={style.iframeWrapper}>
														<iframe class={style.iframe} height={'100%'} src={this.props.modifiedUrl} frameborder={0}
															width={'100%'}
														/>
													</div> :
													<div class={style.noOptionsMsg}>
														<span >To use this widget choose options from above.</span>
													</div>
											}
										</div>
									</div>
								</div>
						</div>
						<div class={style.embedUrlBox}>
							<div class={style.copyOuterWrapper}>
								<div class={style.selectionText}>Copy embeded code</div>
								<div class={style.copyWrapper} onClick={() => { this.handleCopyBtnPress(); }}>
									<span class={style.copyImage} title="Copy" />
								</div>
							</div>
							<div class={style.embedUrlWrapper}>
								<input
									ref={(refs) => { this.embedUrlBox = refs; }}
									value={`<iframe height="250" width="500" frameborder="0" src="${this.props.modifiedUrl}"></iframe>`}
									class={style.embedUrl}
								/>
							</div>
						</div>
					</div>
				</section> : null
		);
	}
}


