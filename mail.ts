import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let mailTransporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASS
	}
});

const mail = (
	to: string,
	subject: string,
	text: string,
	files: string[][]
) => {
	let details = {
		from: process.env.EMAIL,
		to,
		subject,
		text,
		attachments: files.map(file => ({
			filename: file[0],
			path: file[1]
		}))
	};

	mailTransporter.sendMail(
		details,
		err => {
			if (err) console.log('Error sending email ', err);
			else console.log('Email sent!');
		}
	);
};

export default mail;
