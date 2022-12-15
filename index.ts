import scraper from './scraper';
import mail from './mail';
import generator from './generator';

import { promises as fs } from 'fs';
import prompt from 'prompt';

(async () => {
	const url = `https://www.linkedin.com/search/results/companies/?companyHqGeo=%5B%22103644278%22%5D&companySize=%5B%22B%22%2C%22C%22%2C%22D%22%2C%22E%22%2C%22F%22%2C%22G%22%5D&industryCompanyVertical=%5B%224%22%5D&origin=FACETED_SEARCH&sid=W%3BA`;

	const pastTxt = await fs.readFile('progress.txt', 'utf8');
	const pastUrl = pastTxt.split('\n')[0].split(': ')[1];
	const pastPages = pastTxt.split('\n')[1].split(': ')[1];
	const pastStart = parseInt(
		pastPages.split('-')[0]
	);
	const pastEnd = parseInt(
		pastPages.split('-')[1]
	);
	const pastNum = parseInt(
		pastTxt.split('\n')[2].split(': ')[1]
	);

	if (url !== pastUrl) {
		console.log('Different url!!!');
		return;
	}

	console.log(`Url: ${url}`);
	console.log(`Scraped pages: ${pastStart}-${pastEnd}`);
	console.log(`Total: ${pastNum}`);

	const props = [
		{ name: 'continue' },
		{
			name: 'pagesNum',
			validator: /^[0-9]+$/,
			warning: 'Must be a number'
		}
	];
	prompt.start();
	let pagesNum = 0;
	prompt.get(
		props,
		(err, res) => {
			if (err) console.log('Error with prompt: ', err);

			else if ((res.continue as string).toLowerCase() === 'y')
				main(
					parseInt(res.pagesNum as string)
				);
		}
	);
	const startNum = pastEnd + 1;
	
	const main = async (pagesNum: number) => {

		console.log(`Starting to scrape/mail thru page: ${startNum}-${startNum + pagesNum - 1}...`);

		const data = await scraper(
		 url,
		 startNum,
		 pagesNum
		);


		for (let w in data) {
			let coData = data[w];
			for (let x in coData.emails) {
				let emailData = coData.emails[x];
				for (let y in emailData.email) {
					let emails = emailData.email[y];
					for (let z = 0; z < 2; z++) {
						let email = emails[z] as string;

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
						);
					}
				}
			}
		}

		/*type EmailData = {
			firstName: string;
			lastName: string;
			email: string[];
		};

		data.forEach((coData: {
			title: string;
			website: string;
			emails: EmailData[];
		}) =>
			coData.emails.forEach((emailData: EmailData) =>
				emailData.email.forEach((emails: string[]) =>
					emails.forEach((email: string) => {
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
		);*/

		// For testing mailer:
		/*const msg = generator({
			title: 'Development LLC',
			firstName: 'Rob',
			lastName: 'Whitman'
		});
		mail(
			'bradscottwhite@gmail.com',
			msg.subject,
			msg.txt,
			[
				[ 'Bradley White resume.pdf', './files/Bradley White resume.pdf' ],
				[ 'Bradley White resume.docx', './files/Bradley White resume.docx' ],
				[ 'letter_of_recommendation.pdf', './files/letter_of_recommendation.pdf' ]
			]
		);*/
	
	};
})();
