interface EmailData {
	title: string,
	firstName: string,
	lastName: string
}

interface ReturnData {
	subject: string,
	txt: string
}

const generator = ({
	title,
	firstName,
	lastName
}: EmailData): ReturnData => ({
	subject: `Opportunities...`,
	txt: `
Dear ${firstName} ${lastName},

I'm interested to work at ${title} as a software developer (frontend)...
My website is <a href='https://www.bradscottwhite.github.io/'>here</a>.
I have attached my resume below as well as a letter of recommendation.
...

Kind regards,
Bradley White
	`
});

export default generator;
