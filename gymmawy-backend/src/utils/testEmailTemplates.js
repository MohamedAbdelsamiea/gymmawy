import { 
  getEmailVerificationTemplate, 
  getPasswordResetTemplate, 
  getEmailChangeVerificationTemplate,
  validateTemplateVariables 
} from './emailTemplates.js';

/**
 * Test email template functionality
 */
function testEmailTemplates() {
  console.log('🧪 Testing Gymmawy Email Templates...\n');
  
  // Test data
  const testData = {
    firstName: 'أحمد محمد',
    email: 'ahmed@gymmawy.com',
    newEmail: 'ahmed.new@gymmawy.com',
    verificationLink: 'https://gymmawy.com/auth/verify-email?token=abc123&email=ahmed@gymmawy.com',
    resetLink: 'https://gymmawy.com/auth/reset-password?token=xyz789&email=ahmed@gymmawy.com'
  };
  
  // Test 1: Email Verification (English)
  console.log('1️⃣ Testing Email Verification (English)...');
  try {
    const enVerification = getEmailVerificationTemplate(testData, 'en');
    console.log('   ✅ English verification template generated successfully');
    console.log(`   📏 Template length: ${enVerification.length} characters`);
    console.log(`   🔗 Contains verification link: ${enVerification.includes(testData.verificationLink) ? 'Yes' : 'No'}`);
  } catch (error) {
    console.log('   ❌ Error generating English verification template:', error.message);
  }
  
  // Test 2: Email Verification (Arabic)
  console.log('\n2️⃣ Testing Email Verification (Arabic)...');
  try {
    const arVerification = getEmailVerificationTemplate(testData, 'ar');
    console.log('   ✅ Arabic verification template generated successfully');
    console.log(`   📏 Template length: ${arVerification.length} characters`);
    console.log(`   🔗 Contains verification link: ${arVerification.includes(testData.verificationLink) ? 'Yes' : 'No'}`);
    console.log(`   🌐 Contains Arabic text: ${arVerification.includes('مرحباً') ? 'Yes' : 'No'}`);
  } catch (error) {
    console.log('   ❌ Error generating Arabic verification template:', error.message);
  }
  
  // Test 3: Password Reset (English)
  console.log('\n3️⃣ Testing Password Reset (English)...');
  try {
    const enPasswordReset = getPasswordResetTemplate(testData, 'en');
    console.log('   ✅ English password reset template generated successfully');
    console.log(`   📏 Template length: ${enPasswordReset.length} characters`);
    console.log(`   🔗 Contains reset link: ${enPasswordReset.includes(testData.resetLink) ? 'Yes' : 'No'}`);
    console.log(`   ⏰ Contains expiry notice: ${enPasswordReset.includes('30 minutes') ? 'Yes' : 'No'}`);
  } catch (error) {
    console.log('   ❌ Error generating English password reset template:', error.message);
  }
  
  // Test 4: Password Reset (Arabic)
  console.log('\n4️⃣ Testing Password Reset (Arabic)...');
  try {
    const arPasswordReset = getPasswordResetTemplate(testData, 'ar');
    console.log('   ✅ Arabic password reset template generated successfully');
    console.log(`   📏 Template length: ${arPasswordReset.length} characters`);
    console.log(`   🔗 Contains reset link: ${arPasswordReset.includes(testData.resetLink) ? 'Yes' : 'No'}`);
    console.log(`   ⏰ Contains expiry notice: ${arPasswordReset.includes('30 دقيقة') ? 'Yes' : 'No'}`);
  } catch (error) {
    console.log('   ❌ Error generating Arabic password reset template:', error.message);
  }
  
  // Test 5: Email Change Verification
  console.log('\n5️⃣ Testing Email Change Verification...');
  try {
    const enEmailChange = getEmailChangeVerificationTemplate(testData, 'en');
    console.log('   ✅ Email change template generated successfully');
    console.log(`   📏 Template length: ${enEmailChange.length} characters`);
    console.log(`   🔗 Contains verification link: ${enEmailChange.includes(testData.verificationLink) ? 'Yes' : 'No'}`);
    console.log(`   📧 Contains new email: ${enEmailChange.includes(testData.newEmail) ? 'Yes' : 'No'}`);
  } catch (error) {
    console.log('   ❌ Error generating email change template:', error.message);
  }
  
  // Test 6: Template Validation
  console.log('\n6️⃣ Testing Template Validation...');
  try {
    const verificationValidation = validateTemplateVariables('email-verification', testData);
    console.log(`   ✅ Email verification validation: ${verificationValidation.isValid ? 'Valid' : 'Invalid'}`);
    if (!verificationValidation.isValid) {
      console.log(`   ⚠️  Missing variables: ${verificationValidation.missing.join(', ')}`);
    }
    
    const resetValidation = validateTemplateVariables('password-reset', testData);
    console.log(`   ✅ Password reset validation: ${resetValidation.isValid ? 'Valid' : 'Invalid'}`);
    if (!resetValidation.isValid) {
      console.log(`   ⚠️  Missing variables: ${resetValidation.missing.join(', ')}`);
    }
  } catch (error) {
    console.log('   ❌ Error validating templates:', error.message);
  }
  
  // Test 7: Missing Variables
  console.log('\n7️⃣ Testing Missing Variables...');
  try {
    const incompleteData = { firstName: 'Test' }; // Missing required variables
    const validation = validateTemplateVariables('email-verification', incompleteData);
    console.log(`   ✅ Validation correctly identified missing variables: ${validation.isValid ? 'No' : 'Yes'}`);
    console.log(`   📝 Missing: ${validation.missing.join(', ')}`);
  } catch (error) {
    console.log('   ❌ Error testing missing variables:', error.message);
  }
  
  console.log('\n🎉 Email template testing completed!');
  console.log('\n📁 Preview files generated in: src/previews/');
  console.log('🌐 Open src/previews/index.html in your browser to view the templates');
}

// Run tests
testEmailTemplates();
