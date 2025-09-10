import nodemailer from 'nodemailer'

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port:process.env.EMAIL_PORT ,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass:process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async(to, subject,body) => {
    await transport.sendMail({
        from:'"Game" < game@game.com',
        to,
        subject,
        html:body
    })
}

export default sendEmail