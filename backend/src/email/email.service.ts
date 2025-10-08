import * as nodemailer from "nodemailer";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// src/email/email.service.ts

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: parseInt(this.configService.get<string>('SMTP_PORT') || '587'),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(email: string, firstName: string, verificationToken: string) {
    const verificationUrl = `${this.configService.get<string>('VERIFICATION_URL')}?token=${verificationToken}`;
    
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: '🌱 Welcome to RootRise - Verify Your Email',
      html: this.getVerificationEmailTemplate(firstName, verificationUrl),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${email}: ${result.messageId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string, role: string) {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: '🎉 Welcome to RootRise - Your Account is Ready!',
      html: this.getWelcomeEmailTemplate(firstName, role),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${email}: ${result.messageId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      throw error;
    }
  }

  private getVerificationEmailTemplate(firstName: string, verificationUrl: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2E7D32, #4CAF50); padding: 30px; text-align: center; }
        .logo { color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; }
        .tagline { color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0; }
        .content { padding: 30px; }
        .btn { display: inline-block; background: #4CAF50; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .btn:hover { background: #45a049; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        .link { color: #4CAF50; word-break: break-all; font-size: 13px; }
        h1 { color: #2E7D32; margin: 0 0 20px; font-size: 28px; }
        h2 { color: #2E7D32; margin: 20px 0 10px; }
        p { margin: 12px 0; }
        ul { margin: 12px 0; padding-left: 20px; }
        li { margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌱 RootRise</div>
          <div class="tagline">Empowering Rwanda's Agricultural Future</div>
          <h1 style="color: white; margin: 15px 0 0;">Verify Your Email Address</h1>
        </div>
        
        <div class="content">
          <h2>Muraho ${firstName}!</h2>
          <p>Welcome to RootRise, Rwanda's revolutionary blockchain-based agricultural crowdfunding platform!</p>
          
          <p>To complete your registration and start your journey with us, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${verificationUrl}" class="btn">Verify My Email</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p class="link">${verificationUrl}</p>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>✅ Access your personalized dashboard</li>
            <li>🌾 Connect with Rwanda's farming community</li>
            <li>💰 Start investing in agricultural projects</li>
            <li>🤝 Build transparent, blockchain-secured partnerships</li>
          </ul>
          
          <p>This verification link will expire in 24 hours for security reasons.</p>
          
          <p>If you didn't create this account, please ignore this email.</p>
          
          <p>Murakoze cyane!<br><strong>The RootRise Team</strong></p>
        </div>
        
        <div class="footer">
          <p>RootRise - Blockchain Agricultural Crowdfunding Platform for Rwanda</p>
          <p>Building bridges between farmers, investors, and sustainable agriculture</p>
          <br>
          <a href="https://rootrise.rw" style="color: #4CAF50; text-decoration: none;">RootRise Platform</a> | 
          Blockchain Agricultural Crowdfunding for Rwanda
        </div>
      </div>
    </body>
    </html>
    `;
  }
  
  private getWelcomeEmailTemplate(firstName: string, role: string): string {
    const roleMessages: Record<string, string> = {
      FARMER: "You're now ready to create funding projects for your agricultural ventures!",
      INVESTOR: "You can now explore and invest in promising agricultural projects across Rwanda!",
      GOVERNMENT_OFFICIAL: "You have access to oversight tools to support Rwanda's agricultural development!",
      ADMIN: "You have full access to the RootRise platform administration!"
    };
  
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2E7D32, #4CAF50); padding: 30px; text-align: center; }
        .logo { color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; }
        .tagline { color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0; }
        .content { padding: 30px; }
        .btn { display: inline-block; background: #4CAF50; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .btn:hover { background: #45a049; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        h1 { color: #2E7D32; margin: 0 0 20px; font-size: 28px; }
        h2 { color: #2E7D32; margin: 20px 0 10px; }
        h3 { color: #2E7D32; margin: 20px 0 10px; }
        p { margin: 12px 0; }
        .role-badge { background: #4CAF50; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        ul { margin: 12px 0; padding-left: 20px; }
        li { margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌱 RootRise</div>
          <div class="tagline">Empowering Rwanda's Agricultural Future</div>
          <h1 style="color: white; margin: 15px 0 0;">Welcome Aboard!</h1>
        </div>
        
        <div class="content">
          <div class="success-icon">🎉</div>
          
          <h2>Congratulations ${firstName}!</h2>
          
          <p>Your email has been successfully verified and your RootRise account is now active!</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span class="role-badge">${role.replace('_', ' ')}</span>
          </div>
          
          <p>${roleMessages[role] || "Welcome to the RootRise community!"}</p>
          
          <h3>🌟 Your RootRise Journey Starts Now:</h3>
          <ul>
            <li>📊 Explore your personalized dashboard</li>
            <li>🤝 Connect with Rwanda's agricultural community</li>
            <li>🔗 Experience transparent blockchain technology</li>
            <li>📈 Track real-time project progress and impact</li>
          </ul>
          
          <h3>🛡️ Security & Trust:</h3>
          <ul>
            <li>✅ Blockchain-verified transactions</li>
            <li>🔒 Bank-level security protocols</li>
            <li>👁️ Complete transparency in fund usage</li>
            <li>🏛️ Government oversight and approval</li>
          </ul>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://app.rootrise.rw/dashboard" class="btn">Access Your Dashboard</a>
          </div>
          
          <p>Ready to make a difference in Rwanda's agricultural sector? Log in to your account and start exploring!</p>
          
          <p>Murakoze cyane for joining our mission to transform agriculture in Rwanda!</p>
          
          <p>Best regards,<br><strong>The RootRise Team</strong></p>
        </div>
        
        <div class="footer">
          <p>RootRise - Blockchain Agricultural Crowdfunding Platform</p>
          <p>Connecting farmers, investors, and sustainable development in Rwanda</p>
          <p>🌍 Building a more prosperous agricultural future, one project at a time</p>
          <br>
          <a href="https://rootrise.rw" style="color: #4CAF50; text-decoration: none;">Visit Website</a> | 
          <a href="https://app.rootrise.rw" style="color: #4CAF50; text-decoration: none;">Login</a> | 
          <a href="https://support.rootrise.rw" style="color: #4CAF50; text-decoration: none;">Support</a>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}