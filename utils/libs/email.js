const nodemailer = require('nodemailer')

const sendEmail = async(options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.TEST_HOST,
        port: process.env.TEST_PORT,
        auth: {
        user: process.env.TEST_USER,
        pass: process.env.TEST_PASSWORD,
        }
    })

    const message = {
        from: `${process.env.TESTL_FROM_NAME} <${process.env.TEST_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.message,
    }
    await transporter.sendMail(message)
}

const sendGmail = async (options) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      auth: {
          user: `${process.env.GMAIL_ADDRESS}`,
          pass: `${process.env.GMAIL_PASSWORD}`
      },
      tls: {
          rejectUnauthorized: false
      }
    });

    let mailOptions = {
        from: options.fromEmail,
        to: options.toEmail,
        subject: options.subject,
        text: options.message,
        html: htmlTemplate
    }
  
    await transporter.sendMail(mailOptions)
}

module.exports = {
    sendEmail,
    sendGmail
}