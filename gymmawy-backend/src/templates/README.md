# Gymmawy Email Templates

This directory contains professional HTML email templates for the Gymmawy platform, designed to match the brand identity and provide a great user experience.

## 🎨 Brand Identity

The email templates follow Gymmawy's brand guidelines:

- **Primary Color**: #3F0071 (Dark Purple)
- **Secondary Color**: #8B5CF6 (Purple)
- **Accent Color**: #FF6B35 (Orange)
- **Dark Color**: #1F1F1F (Dark Gray)
- **Light Color**: #F8F9FA (Light Gray)
- **Fonts**: Inter (English), Noto Sans Arabic (Arabic)

## 📧 Available Templates

### 1. Email Verification (`email-verification.html` / `email-verification-ar.html`)
- **Purpose**: Welcome new users and verify email addresses
- **Features**: 
  - Gradient header with brand colors
  - Clear call-to-action button
  - Security notice
  - Social media links
  - Responsive design
- **Variables**: `firstName`, `email`, `verificationLink`

### 2. Password Reset (`password-reset.html` / `password-reset-ar.html`)
- **Purpose**: Help users reset their passwords securely
- **Features**:
  - Orange gradient header for urgency
  - Step-by-step instructions
  - Security warnings
  - Expiry notice (30 minutes)
- **Variables**: `firstName`, `email`, `resetLink`

### 3. Email Change Verification (`email-change-verification.html` / `email-change-ar.html`)
- **Purpose**: Verify new email addresses when users change their email
- **Features**:
  - Similar to email verification but with different messaging
  - Clear indication of email change
  - Security notice
- **Variables**: `firstName`, `email`, `newEmail`, `verificationLink`

## 🌐 Language Support

All templates are available in both English and Arabic:

- **English**: Left-to-right (LTR) layout with Inter font
- **Arabic**: Right-to-left (RTL) layout with Noto Sans Arabic font
- **Automatic Detection**: Templates automatically use the user's language preference

## 🛠️ Usage

### Using the Template Utility

```javascript
import { 
  getEmailVerificationTemplate, 
  getPasswordResetTemplate, 
  getEmailChangeVerificationTemplate 
} from '../utils/emailTemplates.js';

// Email verification
const html = getEmailVerificationTemplate({
  firstName: 'John Doe',
  email: 'john@example.com',
  verificationLink: 'https://gymmawy.com/verify?token=abc123'
}, 'en'); // or 'ar' for Arabic

// Password reset
const html = getPasswordResetTemplate({
  firstName: 'John Doe',
  email: 'john@example.com',
  resetLink: 'https://gymmawy.com/reset?token=xyz789'
}, 'en');

// Email change verification
const html = getEmailChangeVerificationTemplate({
  firstName: 'John Doe',
  email: 'john@example.com',
  newEmail: 'john.new@example.com',
  verificationLink: 'https://gymmawy.com/verify-email-change?token=def456'
}, 'en');
```

### Template Variables

Each template accepts specific variables that are replaced in the HTML:

| Variable | Description | Required |
|----------|-------------|----------|
| `firstName` | User's first name | Yes |
| `email` | User's email address | Yes |
| `verificationLink` | Link to verify email | Yes (verification templates) |
| `resetLink` | Link to reset password | Yes (reset template) |
| `newEmail` | New email address | Yes (email change template) |

## 📱 Responsive Design

All templates are fully responsive and optimized for:

- **Desktop**: Full-width layout with proper spacing
- **Tablet**: Adjusted padding and font sizes
- **Mobile**: Single-column layout with touch-friendly buttons

## 🔒 Security Features

- **Expiry Notices**: Clear indication of link expiration times
- **Security Warnings**: Instructions for users who didn't request the action
- **Alternative Links**: Fallback text links for accessibility
- **No External Resources**: All styling is inline for maximum compatibility

## 🎨 Design Features

- **Gradient Headers**: Eye-catching gradients using brand colors
- **Animated Buttons**: Hover effects with smooth transitions
- **Brand Logo**: Consistent branding throughout
- **Social Links**: Footer with social media integration
- **Professional Typography**: Clean, readable fonts
- **Consistent Spacing**: Proper margins and padding throughout

## 🧪 Testing

To generate preview files for testing:

```bash
node src/utils/emailPreview.js
```

This will create preview files in the `previews/` directory that you can open in a browser to see how the templates look.

## 📝 Customization

To customize the templates:

1. **Colors**: Update the CSS variables in the `<style>` section
2. **Content**: Modify the HTML content while keeping the variable placeholders
3. **Layout**: Adjust the CSS grid and flexbox layouts as needed
4. **Branding**: Update the logo, social links, and footer content

## 🔧 Technical Notes

- **Inline CSS**: All styles are inline for maximum email client compatibility
- **No JavaScript**: Pure HTML/CSS for security and compatibility
- **UTF-8 Encoding**: Proper support for Arabic and special characters
- **Email Client Testing**: Tested on major email clients (Gmail, Outlook, Apple Mail)

## 📊 Performance

- **File Size**: Optimized for fast loading
- **Images**: Minimal use of images, mostly CSS-based design
- **Compatibility**: Works across all major email clients
- **Accessibility**: Proper semantic HTML and alt text

## 🚀 Future Enhancements

- [ ] Dark mode support
- [ ] More template variations
- [ ] A/B testing capabilities
- [ ] Analytics integration
- [ ] Template editor interface
