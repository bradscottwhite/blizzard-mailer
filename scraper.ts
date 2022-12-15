import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

type CompanyData = {
	title: string;
	href: string;
};

type SiteData = {
	title: string;
	website: string;
};

type EmailData = {
	title: string;
	website: string;
	emails: Email[];
};

type Email = {
	firstName: string;
	lastName: string;
	email: string[];
};

const scraper = async (
	pageUrl: string,
	startPage: number,
	pagesNum: number
): Promise<EmailData[]> => {
	const browser = await puppeteer.launch({
		headless: false // after testing set to true
	});

	const getCompanies = async (pageUrl: string) => {
		const page = await browser.newPage();

		// Login to LinkedIn:
		await page.setCookie({
			name: 'li_at',
			value: process.env.COOKIE as string,
			domain: '.www.linkedin.com'
		});

		await page.goto(pageUrl);

		// Scrape company LinkedIn addresses:
		let data: CompanyData[] = [];

		const linkSel = 'li > div > div > .entity-result__content.entity-result__divider.pt3.pb3.t-12.t-black--light > .mb1 > .t-roman.t-sans > div > span > span > a';

		for (let i = startPage; i < pagesNum; i++) {
			await page.waitForSelector(linkSel);
			const newData = await page.$$eval(
				linkSel,
				links => Array.from(links)
					.map(link => ({
						title: link.innerText,
						href: link.href
					}))
			);

			data = [ ...data, ...newData ];

			if (i !== pagesNum)
				await page.goto(pageUrl + `&page=${i + 1}`);
		}

		await page.close();

		return data;
	};

	const getWebsites = async (coData: CompanyData[]) => {
		const aboutPage = await browser.newPage();
		
		const data: SiteData[] = [];

		for (let i in coData) {
			await aboutPage.goto(coData[i].href + 'about');
			
			const siteSel = 'dd.mb4.text-body-small.t-black--light a';
			if (await aboutPage.$(siteSel) !== null) {
				await aboutPage.waitForSelector(siteSel);
				const website = await aboutPage.$eval(siteSel, site => site.href);

				data.push({
					title: coData[i].title,
					website
				});
			}
		}
		
		await aboutPage.close();
		
		return data;
	};

	const getEmails = async (siteData: SiteData[]) => {
		const page = await browser.newPage();
		
		const data: EmailData[] = [];
	
		for (let i in siteData) {
			await page.goto(
				`https://www.linkedin.com/search/results/people/?keywords=recruiter%20${siteData[i].title.replace(' ', '%20')}&origin=GLOBAL_SEARCH_HEADER`
			);

			const website = siteData[i].website
				.replace(/(https)|(http)/, '')
				.replace('://', '')
				.replace('www.', '')
				.split('/')[0];
			
			let emails: Email[] = [];

			// Gather first and last names of HR/recruiting managers on LinkedIn:

		  const ulSel = '.search-results-container > div:nth-child(2) > div > ul';
			const liSel = 'li > div > div > .entity-result__content.entity-result__divider.pt3.pb3.t-12.t-black--light > .mb1 > .t-roman.t-sans > div > span.entity-result__title-line.entity-result__title-line--2-lines > span > a > span > span:nth-child(1)';
			await page.waitForSelector(ulSel);
			
			if (Array.from(await page.$$(liSel)).length >= 2) {
				const names = await page.$$eval(
					liSel,
					lis => Array.from(lis)
						.splice(0, 3)
						.map(li => li.innerText)
				);
				
				// Brute force verify/check 3 methods of address codes and find valid email:
				for (let j in names) {
					const firstName = names[j].split(' ')[0];
					const lastName = names[j].split(' ')[1];

					// Verify email against 3 methods:
					// 1. first.Last@website.com
					const email1 = `${firstName}.${lastName}@${website}`;
					// 2. firstLast@website.com
					const email2 = `${firstName}${lastName}@${website}`;
					// 3. fLast@website.com
					const email3 = `${firstName.charAt(0)}${lastName}@${website}`;

					// Verify emails:
					// Don't use Hunter.io as it costs money!:
					/*const verify = async (email: string) => {
						const newPage = await browser.newPage();

						// Login to hunter.io:
						await page.setCookie({
							name: '_emailhunter_session',
							value: process.env.HUNTER as string,
							domain: 'hunter.io'
						});

						await newPage.goto(
							`https://hunter.io/verify/${email}`
						);
						
						const statusSel = '#email-status > div';
						await newPage.waitForSelector(statusSel);
						const status = await newPage.$eval(
							statusSel,
							status => status.innerText === 'VALID'
						);

						await newPage.close();

						return status;
					};*/

					/*let email;
					if (await verify(email1)) email = email1;
					else if (await verify(email2)) email = email2;
					else if (await verify(email3)) email = email3;*/

					//if (email)
					emails.push({
						firstName,
						lastName,
						
						// These aren't validated and are most likely +90% invalid:
						// Given 70% will always be invalid no matter what
						// 70% - +90% = -33% Valid
						// Meaning 150 companies
						// = 3 employees
						// = 3 email addresses
						// - 66% Invalid
						// = -~50 recruiter emails
						// (10 companies = -~3 valid email addresses)
						
						email: [ email1.toLowerCase(), email2.toLowerCase(), email3.toLowerCase() ]
					});
				}

				data.push({
					title: siteData[i].title,
					website,
					emails
				});
			}
		}
		
		await page.close();
		
		return data;
	};


	const emailData = await getEmails(
		await getWebsites(
			await getCompanies(pageUrl)
		)
	);


	await browser.close();

	// Update progress:
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

	if (pastUrl === pageUrl && pastEnd === startPage + 1)
		fs.writeFile(
			'progress.txt',
`Url: ${pageUrl}
Scraped pages: ${pastStart}-${pastEnd + pagesNum}
Total: ${pastNum + pagesNum}`
		);
	else
		fs.writeFile(
			'progress.txt',
`Url: ${pageUrl}
Scraped pages: ${startPage}-${startPage + pagesNum}
total: ${pagesNum - startPage + 1}`
		);

	// Add data to old data in file:
	const fileData = await fs.readFile('data.json', 'utf8');
	fs.writeFile(
		'data.json',
		JSON.stringify([
			...JSON.parse(fileData),
			...emailData
		])
	);

	return await emailData;
};

export default scraper;
