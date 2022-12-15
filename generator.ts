interface EmailData {
	title: string,
	firstName: string,
	lastName: string
}

interface ReturnData {
	subject: string,
	txt: string
}

const l = (txt?: string) => `
<div style='text-align:justify'>
	<font face='arial'>
		${txt ? txt : '<br/>'}
	</font>
</div>
`;

const portfolio = 'https://bradscottwhite.github.io/';

const generator = ({
	title,
	firstName,
	lastName
}: EmailData): ReturnData => ({
	subject: `Opportunities at ${title}`,
	txt: `Dear ${firstName} ${lastName} and the rest of the ${title} hiring team,

My name is Bradley White, and I‘m a software engineer dedicated to developing, designing and deploying creative and functional apps on the wild web. I’m contacting you to inquire about internship/job opportunities in the software development field.

I have been immersed in the world of programming from a young age and seeking a front-end or full-stack role or internship to contribute my skills and knowledge, while expanding my technical experience. I am currently only open to working remotely unless it is in the Richmond, Virginia area.

My technical experience is primarily in React, AWS, TypeScript, Tailwind and Node. I'm also familar with Java, Python and Angular and always looking to learn more about the craft.

You can find more details on my skills and work on <a href='${portfolio}'>my portfolio website</a>. I’ve also attached a copy of my resume with this email (as well as a letter of recommendation).

If you have any questions, please don't hesitate to contact me.

Hope we get in touch soon. Have a great day.

Kind regards,
Bradley White<br/>
`.split('\n').map(line => l(line)).join('')
});

export default generator;
