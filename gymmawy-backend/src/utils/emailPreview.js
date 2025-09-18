import { 
  getEmailVerificationTemplate, 
  getPasswordResetTemplate, 
  getEmailChangeVerificationTemplate 
} from './emailTemplates.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate preview files for email templates
 * This is useful for testing and design review
 */
export function generateEmailPreviews() {
  const previewDir = path.join(__dirname, '../previews');
  
  // Create previews directory if it doesn't exist
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }
  
  // Sample data for previews
  const sampleData = {
    firstName: 'أحمد محمد',
    email: 'ahmed@gymmawy.com',
    newEmail: 'ahmed.new@gymmawy.com',
    verificationLink: 'https://gymmawy.com/auth/verify-email?token=abc123&email=ahmed@gymmawy.com',
    resetLink: 'https://gymmawy.com/auth/reset-password?token=xyz789&email=ahmed@gymmawy.com'
  };
  
  // Generate English templates
  const enVerification = getEmailVerificationTemplate(sampleData, 'en');
  const enPasswordReset = getPasswordResetTemplate(sampleData, 'en');
  const enEmailChange = getEmailChangeVerificationTemplate(sampleData, 'en');
  
  // Generate Arabic templates
  const arVerification = getEmailVerificationTemplate(sampleData, 'ar');
  const arPasswordReset = getPasswordResetTemplate(sampleData, 'ar');
  const arEmailChange = getEmailChangeVerificationTemplate(sampleData, 'ar');
  
  // Write preview files
  const previews = [
    { name: 'email-verification-en.html', content: enVerification },
    { name: 'email-verification-ar.html', content: arVerification },
    { name: 'password-reset-en.html', content: enPasswordReset },
    { name: 'password-reset-ar.html', content: arPasswordReset },
    { name: 'email-change-en.html', content: enEmailChange },
    { name: 'email-change-ar.html', content: arEmailChange }
  ];
  
  previews.forEach(({ name, content }) => {
    const filePath = path.join(previewDir, name);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Generated preview: ${name}`);
  });
  
  // Generate index file for easy viewing
  const indexContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gymmawy Email Templates Preview</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            color: #3F0071;
            margin-bottom: 30px;
        }
        .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .template-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .template-card h3 {
            margin-top: 0;
            color: #1F1F1F;
        }
        .template-card p {
            color: #6B7280;
            margin-bottom: 15px;
        }
        .template-card a {
            display: inline-block;
            background: #3F0071;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
        }
        .template-card a:hover {
            background: #8B5CF6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Gymmawy Email Templates Preview</h1>
        <div class="template-grid">
            <div class="template-card">
                <h3>Email Verification (English)</h3>
                <p>Welcome email for new users with email verification link.</p>
                <a href="email-verification-en.html" target="_blank">View Template</a>
            </div>
            <div class="template-card">
                <h3>Email Verification (Arabic)</h3>
                <p>مرحباً بك في جيماوي - بريد ترحيبي للمستخدمين الجدد مع رابط تأكيد البريد الإلكتروني.</p>
                <a href="email-verification-ar.html" target="_blank">عرض القالب</a>
            </div>
            <div class="template-card">
                <h3>Password Reset (English)</h3>
                <p>Password reset email with secure reset link and instructions.</p>
                <a href="password-reset-en.html" target="_blank">View Template</a>
            </div>
            <div class="template-card">
                <h3>Password Reset (Arabic)</h3>
                <p>بريد إعادة تعيين كلمة المرور مع رابط آمن وتعليمات مفصلة.</p>
                <a href="password-reset-ar.html" target="_blank">عرض القالب</a>
            </div>
            <div class="template-card">
                <h3>Email Change (English)</h3>
                <p>Email change verification for users updating their email address.</p>
                <a href="email-change-en.html" target="_blank">View Template</a>
            </div>
            <div class="template-card">
                <h3>Email Change (Arabic)</h3>
                <p>تأكيد تغيير البريد الإلكتروني للمستخدمين الذين يحدثون عنوان بريدهم الإلكتروني.</p>
                <a href="email-change-ar.html" target="_blank">عرض القالب</a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(previewDir, 'index.html'), indexContent, 'utf8');
  console.log('Generated preview index: index.html');
  
  return previewDir;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateEmailPreviews();
}
