import scraper from './scraper';
import mail from './mail';
import generator from './generator';

(async () => {
	const pageNum = 1; //50

	const data = await scraper(
	 'https://www.linkedin.com/search/results/companies/?companyHqGeo=%5B%22103644278%22%5D&companySize=%5B%22B%22%2C%22C%22%2C%22D%22%5D&hasJobs=%5B%221%22%5D&industryCompanyVertical=%5B%224%22%5D&origin=FACETED_SEARCH&sid=-f-',
	 pageNum
	);

	data.forEach(coData =>
		coData.emails.forEach(emailData =>
			emailData.email.forEach(emails =>
				emails.forEach(email => {
					const msg = generator({
						title: coData.title,
						firstName: emailData.firstName,
						lastName: emailData.lastName
					});

					mail(
						email,
						msg.subject,
						msg.txt,
						[
							[ 'Bradley White resume.pdf', './files/Bradley White resume.pdf' ],
							[ 'Bradley White resume.docx', './files/Bradley White resume.docx' ],
							[ 'letter_of_recommendation.pdf', './files/letter_of_recommendation.pdf' ]
						]
					)
				})
			)
		)
	);
})();
