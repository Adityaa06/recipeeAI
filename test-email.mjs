import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'singhaditya06.04.2005@gmail.com',
        pass: 'bhrj fapj huoe riag'
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
});

async function main() {
    console.log('Verifying connection...');
    try {
        await transporter.verify();
        console.log('✅ Connection verified successfully');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: '"Test" <singhaditya06.04.2005@gmail.com>',
            to: 'singhaditya06.04.2005@gmail.com',
            subject: 'Test Email',
            text: 'Hello world'
        });
        console.log('✅ Email sent: ' + info.messageId);
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

main();
