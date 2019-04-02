/************************* Lib Files ************************/
import Api from '../../lib/api';
export const ABOUT_US = {
	start: 'fetch_start/about_us',
	end: 'fetch_end/about_us',
	success: 'fetch_success/about_us',
	failed: 'fetch_failed/about_us'
};

export const aboutUsFetchStart = () => ({
	type: ABOUT_US.start
});

export const aboutUsFetchEnd = () => ({
	type: ABOUT_US.end
});

export const aboutUsFetchSuccess = (content) => (
	{
		type: ABOUT_US.success,
		content
	});

export const aboutUsFetchFailed = (error) => ({
	type: ABOUT_US.failed,
	error
});
export const fetchaboutUsContent = () => (dispatch) => {
	dispatch(aboutUsFetchStart());
	return Api.get(Api.API_ABOUT).then(resp => {
		if (resp.success) {
			let training = {
			created_date: '',
			html_content: `<div class="aboutUsWrapper">
			<h2>Online Training Courses</h2>
			<div class="aboutUsWrapper">
				<strong>Introduction to International Aid Transparency Initiative (IATI)</strong>
				<p>
				This training course is designed to introduce you to the concept of aid transparency and its relevance to the IATI Standard. It explains the data publication to IATI and the importance of data usability. It also provides guidance for collecting quality data for IATI publication.</p>
				<strong>Start Course</strong>
				<ul class="linkSectionTraining">
					<li ><a class="linkColor trainingLink" target="_blank" 
					href="/assets/Training/iati/story.html">English</a></li>
					<li ><a class="linkColor trainingLink" target="_blank" 
					href="/assets/Training/iati-french/story.html">French</a></li>
					<li ><a class="linkColor trainingLink" target="_blank" 
					href="/assets/Training/iati-spanish/story.html">Spanish</a></li>
				</ul>
			</div>
			<div class="aboutUsWrapper">
				<strong>Harmonized Approach to Cash Transfer (HACT) Overview</strong>
				<p>This training provides an introduction to the Harmonized Approach to Cash Transfer (HACT), which is a set of principles and guidelines governing the disbursement and reporting of funds for a UN-funded project transferred by UN funding agencies to Implementing Partners (IP) or Responsible Parties (RP). By Implementing the HACT framework, UN Agencies adopt a risk management approach in transferring cash to Partners based on joint assessment of their financial management capacities.</p>
				<a class="linkColor trainingLink" target="_blank" href="/assets/Training/hact/story.html">Start Course</a>
			</div>
			<div class="aboutUsWrapper">
				<strong>UNDP Micro Assessment</strong>
				<p>Micro Assessments are key requirements of the Harmonized Approach to Cash Transfer (HACT) Framework. A micro assessment is used to manage the risk of transferring cash to partners by assessing their capacity to receive and use the funds for the intended purpose. This course provides an overview on the UNDP Procedures for the performance of Micro Assessments of partners implementing programmatic activities.</p>
				<a class="linkColor trainingLink" target="_blank" href="/assets/Training/micro-assessment/story.html">Start Course</a>
			</div>
			<div class="aboutUsWrapper">
				<strong>UNDP Assurance Activities</strong>
				<p>Assurance Activities are key requirements of the Harmonized Approach to Cash Transfer (HACT) Framework. These refer to planned activities used to determine whether funds transferred to Partners were used for their intended purpose and in accordance with the annual work plan. Assurance activities in the context of HACT include: programmatic output verification, spot checks, scheduled audits, special audits. This course describes the procedures and processes adopted by UNDP in the implementation of the various Assurance Activities.</p>
				<a class="linkColor trainingLink" target="_blank" href="/assets/Training/assurance-activities/story.html">Start Course</a>
			</div>
			<div class="aboutUsWrapper">
				<strong>HACT FACE Form Training</strong>
				<p>The Funding Authorization and Certificate of Expenditure (FACE) form refers to the common form among adopting agencies for Partners to request cash transfers; report on expenditures; and certify expenditures. It applies to all cash transfer modalities and serves the following purposes: request for funding authorization, reporting of expenditures, and certification of expenditures. This course describes the procedures and processes adopted by UNDP in relation to FACE forms.</p>
				<a class="linkColor trainingLink" target="_blank" href="/assets/Training/face-form/story_html5.html">Start Course</a>
			</div>
			</div>`,
			id: 5,
			modified_date: '',
			plain_text: 'TRAININGS',
			tab: 5 };
			if (!resp.data.data)
				resp.data.data = [];
			
			resp.data.data.push(training);
			dispatch(aboutUsFetchEnd());
			dispatch(aboutUsFetchSuccess(resp.data.data));
		}
		else {
			dispatch(aboutUsFetchEnd());
		}
	}).catch((exception) => {
		dispatch(aboutUsFetchEnd());
		dispatch(aboutUsFetchFailed(exception));
	});
};