const puppeteer = require('puppeteer');
const fileUrl = 'https://api.open.undp.org/media/export_pdf/export.html';

async function printPDF(url) {
	try {
		const browser = await puppeteer.launch({ headless: true });
		const page = await browser.newPage();
		await page.goto(url, { waitUntil: 'networkidle0' });
		const pdf = await page.pdf({
			format: 'A4',
			path: '/home/un_trans/undp-phase-2/undp-transparency-portal-python/media/export_pdf/export.pdf',
			printBackground: true,
			margin: { top: '1cm', bottom: '1cm' }
		});

		await browser.close();
		return pdf;
	} catch (err) {
		console.log(err);
	}
}

printPDF(fileUrl);
