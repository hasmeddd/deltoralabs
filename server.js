const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('.'));

// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Endpoint gửi email
app.post('/send-email', async (req, res) => {
    const {
        projectName,
        xAccount,
        yourName,
        telegramHandle,
        budget,
        projectDescription
    } = req.body;

    // Validate required fields
    if (!projectName || !xAccount || !yourName || !telegramHandle || !budget) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please fill in all required fields' 
        });
    }

    // Kiểm tra environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.log('⚠️ Gmail not configured - running in test mode');
        return res.status(200).json({ 
            success: true,
            message: 'Newsletter subscription successful (Test Mode - no email sent)',
            testMode: true
        });
    }

    // Cấu hình SMTP Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    // Tạo nội dung email với HTML formatting
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed; text-align: center;">New Application from Deltora Labs</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Application Details:</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 10px; font-weight: bold; width: 30%;">Project Name:</td>
                        <td style="padding: 10px;">${projectName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 10px; font-weight: bold;">X Account:</td>
                        <td style="padding: 10px;"><a href="${xAccount}" target="_blank">${xAccount}</a></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 10px; font-weight: bold;">Contact Name:</td>
                        <td style="padding: 10px;">${yourName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 10px; font-weight: bold;">Telegram Handle:</td>
                        <td style="padding: 10px;">@${telegramHandle.replace('@', '')}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 10px; font-weight: bold;">Budget Range:</td>
                        <td style="padding: 10px;">${budget}</td>
                    </tr>
                </table>
            </div>

            ${projectDescription ? `
            <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h3 style="color: #333; margin-top: 0;">Project Description:</h3>
                <p style="line-height: 1.6; color: #555;">${projectDescription.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #7c3aed; color: white; border-radius: 10px;">
                <p style="margin: 0;">📧 This email was sent from Deltora Labs contact form</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Received at: ${new Date().toLocaleString()}</p>
            </div>
        </div>
    `;

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: 'titanworkcm@gmail.com',
        subject: `🚀 New Application: ${projectName} - ${budget}`,
        html: htmlContent,
        text: `
New Application from Deltora Labs

Project Name: ${projectName}
X Account: ${xAccount}
Contact Name: ${yourName}
Telegram Handle: @${telegramHandle.replace('@', '')}
Budget Range: ${budget}

${projectDescription ? `Project Description:\n${projectDescription}` : ''}

Received at: ${new Date().toLocaleString()}
        `
    };

    try {
        console.log('Attempting to send email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        
        res.status(200).json({ 
            success: true,
            message: 'Application submitted successfully! We will contact you soon.',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to submit application. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Newsletter subscription endpoint
app.post('/newsletter', async (req, res) => {
    const { email } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please enter a valid email address' 
        });
    }

    // Kiểm tra environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        return res.status(500).json({ 
            success: false,
            message: 'Newsletter service not configured. Please contact admin.',
            error: 'Missing Gmail credentials in environment variables'
        });
    }

    // Cấu hình SMTP Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    // Email gửi cho admin (notification)
    const adminNotification = {
        from: process.env.GMAIL_USER,
        to: 'titanworkcm@gmail.com',
        subject: '📧 New Newsletter Subscription - Deltora Labs',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7c3aed; text-align: center;">New Newsletter Subscription</h2>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Subscriber Details:</h3>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 10px; font-weight: bold; width: 30%;">Email:</td>
                            <td style="padding: 10px;">${email}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 10px; font-weight: bold;">Subscribed At:</td>
                            <td style="padding: 10px;">${new Date().toLocaleString()}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 10px; font-weight: bold;">Source:</td>
                            <td style="padding: 10px;">Website Footer - Deltora Labs</td>
                        </tr>
                    </table>
                </div>

                <div style="text-align: center; margin: 30px 0; padding: 20px; background: #7c3aed; color: white; border-radius: 10px;">
                    <p style="margin: 0;">📧 Newsletter subscription from Deltora Labs</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Remember to add this email to your mailing list!</p>
                </div>
            </div>
        `,
        text: `
New Newsletter Subscription - Deltora Labs

Email: ${email}
Subscribed At: ${new Date().toLocaleString()}
Source: Website Footer

Remember to add this email to your mailing list!
        `
    };

    // Email welcome gửi cho subscriber
    const welcomeEmail = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: '🚀 Welcome to Deltora Labs Newsletter!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; border-radius: 15px 15px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">Welcome to Deltora Labs!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for subscribing to our newsletter</p>
                </div>

                <div style="padding: 30px 20px; background: #f8f9fa; border-radius: 0 0 15px 15px;">
                    <h2 style="color: #333; margin-top: 0;">🎉 You're all set!</h2>
                    
                    <p style="color: #555; line-height: 1.6;">
                        Welcome to the Deltora Labs community! You'll now receive:
                    </p>

                    <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
                        <li><strong>Latest Web3 marketing insights</strong> and trends</li>
                        <li><strong>Exclusive tips</strong> for blockchain project growth</li>
                        <li><strong>Case studies</strong> from successful campaigns</li>
                        <li><strong>Early access</strong> to new services and tools</li>
                        <li><strong>Industry updates</strong> and partnership news</li>
                    </ul>

                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #7c3aed;">
                        <h3 style="color: #333; margin-top: 0;">🚀 Ready to grow your Web3 project?</h3>
                        <p style="color: #555; margin-bottom: 15px;">If you have a blockchain project and need marketing support, don't hesitate to reach out!</p>
                        <a href="mailto:titanworkcm@gmail.com" style="color: #7c3aed; text-decoration: none; font-weight: bold;">✉️ Contact us: titanworkcm@gmail.com</a><br>
                        <a href="#" style="color: #7c3aed; text-decoration: none; font-weight: bold; margin-top: 5px; display: inline-block;">💬 Telegram: @DeltoraLabs</a>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #888; font-size: 14px; margin: 0;">
                            Follow us on social media for real-time updates!
                        </p>
                        <div style="margin-top: 15px;">
                            <a href="#" style="color: #7c3aed; text-decoration: none; margin: 0 10px;">Twitter</a>
                            <a href="#" style="color: #7c3aed; text-decoration: none; margin: 0 10px;">Telegram</a>
                            <a href="#" style="color: #7c3aed; text-decoration: none; margin: 0 10px;">Discord</a>
                            <a href="#" style="color: #7c3aed; text-decoration: none; margin: 0 10px;">LinkedIn</a>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
                    <p style="margin: 0;">© 2025 Deltora Labs. All rights reserved.</p>
                    <p style="margin: 5px 0 0 0;">You received this email because you subscribed to our newsletter.</p>
                </div>
            </div>
        `,
        text: `
Welcome to Deltora Labs Newsletter!

Thank you for subscribing! You'll now receive:
- Latest Web3 marketing insights and trends
- Exclusive tips for blockchain project growth  
- Case studies from successful campaigns
- Early access to new services and tools
- Industry updates and partnership news

Ready to grow your Web3 project?
Contact us: titanworkcm@gmail.com
Telegram: @DeltoraLabs

© 2025 Deltora Labs. All rights reserved.
        `
    };

    try {
        console.log('Sending newsletter subscription emails...');
        
        // Gửi cả 2 email parallel
        await Promise.all([
            transporter.sendMail(adminNotification),
            transporter.sendMail(welcomeEmail)
        ]);
        
        console.log('Newsletter emails sent successfully');
        
        res.status(200).json({ 
            success: true,
            message: 'Successfully subscribed! Check your email for a welcome message.',
        });
    } catch (error) {
        console.error('Error sending newsletter emails:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to subscribe. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Deltora Labs Contact API'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📧 Email service ready`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; 