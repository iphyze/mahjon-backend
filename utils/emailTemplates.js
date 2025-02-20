// emailTemplates.js

/**
 * Email template for password reset notifications
 * @param {string} firstName - User's first name
 * @param {string} newPassword - Generated temporary password
 * @returns {string} HTML email template
 */
export const passwordResetTemplate = (firstName, newPassword) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .email-container {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        .email-header {
            background-color: #4A90E2;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .email-body {
            padding: 30px;
            background-color: #ffffff;
        }
        .password-container {
            background-color: #f5f5f5;
            border: 1px dashed #cccccc;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
            font-size: 18px;
        }
        .warning {
            color: #e74c3c;
            font-weight: bold;
        }
        .action-needed {
            background-color: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777777;
        }
        h1 {
            margin-top: 0;
            color: #ffffff;
        }
        .logo {
            margin-bottom: 10px;
            font-size: 24px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <div class="logo">Your App Name</div>
            <h1>Password Reset Complete</h1>
        </div>
        <div class="email-body">
            <p>Hi ${firstName},</p>
            
            <p>We've reset your password as requested. You can now log in using the temporary password below:</p>
            
            <div class="password-container">
                <strong>${newPassword}</strong>
            </div>
            
            <div class="action-needed">
                <p><strong>📢 Important Security Action Required:</strong></p>
                <p>For your security, please follow these steps:</p>
                <ol>
                    <li>Log in with the temporary password above</li>
                    <li>Go to <strong>Account Settings > Security</strong></li>
                    <li>Select <strong>"Change Password"</strong></li>
                    <li>Create a strong, unique password that you don't use elsewhere</li>
                </ol>
            </div>
            
            <p>This temporary password will expire in 24 hours for security reasons.</p>
            
            <p class="warning">⚠️ If you didn't request this password reset, please contact our support team immediately as your account may be at risk.</p>
            
            <p>Thank you for using our service.</p>
            
            <p>Best regards,<br>The Your App Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply directly to this email.</p>
            <p>© 2025 Your App Name. All rights reserved.</p>
            <p>123 App Street, Tech City, TC 12345</p>
        </div>
    </div>
</body>
</html>
  `;
};



/**
 * Email template for email verification
 * @param {string} firstName - User's first name
 * @param {string} emailCode - Verification code
 * @param {Date} expiresAt - Expiration date
 * @returns {string} HTML email template
 */
export const emailVerificationTemplate = (firstName, emailCode, expiresAt) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet"/>
    <title>New User Email</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            background-color: #fffcfd;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            justify-content: center;
            align-items: center;
            display: flex;
            flex-direction: column;
        }
        .mail-container {
            width: 26rem;
            background-color: white;
            box-shadow: 0 0px 10px rgba(0, 0, 0, 0.02);
            padding: 50px 20px;
            text-align: center;
        }
        .logo-img{
            position: relative;
            width: 200px;
            height: auto;
            margin: 20px auto;
            margin-bottom: 20px;
            display: block;
        }
        .hi-user{
            position: relative;
            width: 100%;
            margin-bottom: 5px;
            text-align: center;
            font-size: 20px;
            color: #621d1f !important;
        }
        .hi-user-span{
            font-weight: 700;
        }
        .hi-user{
            position: relative;
            width: 100%;
            text-align: center;
            font-size: 20px;
        }
        .hi-user-subtext{
            position: relative;
            width: 100%;
            text-align: center;
            font-size: 20px;
            margin-bottom: 20px;
            color: #621d1f !important;
        }
        .welcome-img{
            position: relative;
            width: 180px;
            height: auto;
            margin: 10px auto;
            display: block;
        }
        .code-text{
            position: relative;
            width: 100%;
            text-align: center;
            margin-bottom: 20px;
            color: rgb(86, 86, 86) !important;
            font-size: 16px;
        }
        .code-number{
            position: relative;
            width: 50%;
            margin: 20px auto;
            background-color:#fbf3f4 !important;
            color: #ac1d21 !important;
            text-align: center;
            padding: 10px;
            border-radius: 3px;
            margin-bottom: 20px;
            font-size: 28px;
            font-weight: 600;
            border: 1px solid #ac1d21 !important;
        }
        .code-expiry{
            position: relative;
            width: 100%;
            text-align: center;
            margin-bottom: 20px;
            color: rgb(86, 86, 86) !important;
            font-size: 12px;
        }
        .mail-container-two{
            width: 26rem;
            position: relative;
            background-color: #faf0f0 !important;
            box-shadow: 0 0px 10px rgba(0, 0, 0, 0.02) !important;
            padding: 50px 20px;
            text-align: center;
        }
        .mail-text{
            position: relative;
            width: 100%;
            text-align: center;
            font-size: 14px;
            margin-bottom: 5px;
            color: #ac1d21 !important;
        }
        .footer{
            width: 26rem;
            position: relative;
            text-align: center;
            background-color: #621d1f !important;
            padding: 50px 20px;
        }
        .footer p{
            position: relative;
            text-align: center;
            font-size: 14px;
            color: white;
        }
    </style>
</head>
<body>

    <img src="https://mahjon-db.goldenrootscollectionsltd.com/images/email-image.png" alt="img" class="welcome-img">
    
    <div class="hi-user">Congratulation <span class="hi-user-span">${firstName}</span>,</div>
    <div class="hi-user-subtext">Your Mahjong Clinic App profile has been created</div>
    
    <div class="mail-container">
        <img src="https://mahjon-db.goldenrootscollectionsltd.com/images/splash-logo.png" alt="logo-img" class="logo-img"/>
        
        <div class="code-text">
            Thank you for registering with us! To complete your account setup. please use the
            verification code below:
        </div>
        <div class="code-number">${emailCode}</div>
        <div class="code-expiry">
            This code will expire on ${new Date(expiresAt).toLocaleString()}, please ensure to
            verify your email before the time of expiration.
        </div>
    </div>

    <div class="mail-container-two">
        <div class="mail-text">If you did not create an account with us, please ignore this email.</div>
        <div class="mail-text">Thank you for choosing our service.</div>
        <div class="mail-text">Best regards,</div>
        <div class="mail-text">Mahjong Clinic App Team</div>
    </div>

    <div class="footer">
        <p>This is an automated message, please do not reply directly to this email.</p>
        <p>© 2025 Mahjong Clinic Nigeria. All rights reserved.</p>
        <p>Developer | iphysdynamix</p>
    </div>
</body>
</html>`
};



/**
 * Email template for password reset notifications
 * @param {string} firstName - User's first name
 * @returns {string} HTML email template
 */
export const passwordVerifyTemplate = (firstName) => {
    return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification Successful</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .email-container {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        .email-header {
            background-color: #27ae60;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .email-body {
            padding: 30px;
            background-color: #ffffff;
        }
        .success-icon {
            text-align: center;
            margin: 20px 0;
            font-size: 48px;
        }
        .success-message {
            background-color: #e7f9ef;
            border-left: 4px solid #27ae60;
            padding: 15px;
            margin: 20px 0;
        }
        .cta-button {
            display: block;
            text-align: center;
            margin: 30px auto;
        }
        .cta-button a {
            background-color: #27ae60;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            display: inline-block;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777777;
        }
        h1 {
            margin-top: 0;
            color: #ffffff;
        }
        .logo {
            margin-bottom: 10px;
            font-size: 24px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <div class="logo">Your App Name</div>
            <h1>Email Verified!</h1>
        </div>
        <div class="email-body">
            <div class="success-icon">
                ✅
            </div>
            
            <p>Hi ${firstName},</p>
            
            <div class="success-message">
                <p><strong>Congratulations!</strong> Your email address has been successfully verified.</p>
            </div>
            
            <p>You now have full access to all features and benefits of your account. Here's what you can do now:</p>
            
            <ul>
                <li>Complete your profile information</li>
                <li>Explore all available features</li>
                <li>Connect with other users</li>
                <li>Customize your notification preferences</li>
            </ul>
            
            <p><small>If you did not verify this email address, please contact our support team immediately at <a href="mailto:support@yourapp.com">support@yourapp.com</a>.</small></p>
            
            <p>Thank you for choosing our service.</p>
            
            <p>Best regards,<br>The Your App Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply directly to this email.</p>
            <p>© 2025 Your App Name. All rights reserved.</p>
            <p>123 App Street, Tech City, TC 12345</p>
        </div>
    </div>
</body>
</html>
    `;
  };




  /**
  * Email template for email verification
  * @param {string} firstName - User's first name
  * @param {string} emailCode - Verification code
  * @param {Date} expiresAt - Expiration date
  * @returns {string} HTML email template
  */
 export const sendEmailVerificationTemplate = (firstName, emailCode, expiresAt) => {
   return `<!DOCTYPE html>
 <html lang="en">
 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet"/>
     <title>Verify Your Email</title>
     <style>
         body {
             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
             line-height: 1.6;
             background-color: #fffcfd;
             max-width: 600px;
             margin: 0 auto;
             padding: 40px 20px;
             justify-content: center;
             align-items: center;
             display: flex;
             flex-direction: column;
         }
         .mail-container {
             width: 26rem;
             background-color: white;
             box-shadow: 0 0px 10px rgba(0, 0, 0, 0.02);
             padding: 50px 20px;
             text-align: center;
         }
         .logo-img{
             position: relative;
             width: 200px;
             height: auto;
             margin: 20px auto;
             margin-bottom: 20px;
             display: block;
         }
         .hi-user{
             position: relative;
             width: 100%;
             margin-bottom: 5px;
             text-align: center;
             font-size: 20px;
             color: #621d1f !important;
         }
         .hi-user-span{
             font-weight: 700;
         }
         .hi-user{
             position: relative;
             width: 100%;
             text-align: center;
             font-size: 20px;
         }
         .hi-user-subtext{
             position: relative;
             width: 100%;
             text-align: center;
             font-size: 20px;
             margin-bottom: 20px;
             color: #621d1f !important;
         }
         .welcome-img{
             position: relative;
             width: 180px;
             height: auto;
             margin: 10px auto;
             display: block;
         }
         .code-text{
             position: relative;
             width: 100%;
             text-align: center;
             margin-bottom: 20px;
             color: rgb(86, 86, 86) !important;
             font-size: 16px;
         }
         .code-number{
             position: relative;
             width: 50%;
             margin: 20px auto;
             background-color:#fbf3f4 !important;
             color: #ac1d21 !important;
             text-align: center;
             padding: 10px;
             border-radius: 3px;
             margin-bottom: 20px;
             font-size: 28px;
             font-weight: 600;
             border: 1px solid #ac1d21 !important;
         }
         .code-expiry{
             position: relative;
             width: 100%;
             text-align: center;
             margin-bottom: 20px;
             color: rgb(86, 86, 86) !important;
             font-size: 12px;
         }
         .mail-container-two{
             width: 26rem;
             position: relative;
             background-color: #faf0f0 !important;
             box-shadow: 0 0px 10px rgba(0, 0, 0, 0.02) !important;
             padding: 50px 20px;
             text-align: center;
         }
         .mail-text{
             position: relative;
             width: 100%;
             text-align: center;
             font-size: 14px;
             margin-bottom: 5px;
             color: #ac1d21 !important;
         }
         .footer{
             width: 26rem;
             position: relative;
             text-align: center;
             background-color: #621d1f !important;
             padding: 50px 20px;
         }
         .footer p{
             position: relative;
             text-align: center;
             font-size: 14px;
             color: white;
         }
     </style>
 </head>
 <body>
 
     <img src="https://mahjon-db.goldenrootscollectionsltd.com/images/email-image.png" alt="img" class="welcome-img">
     
     <div class="hi-user">Hello <span class="hi-user-span">${firstName}</span>,</div>
     <div class="hi-user-subtext">Your email verification code</div>
     
     <div class="mail-container">
         <img src="https://mahjon-db.goldenrootscollectionsltd.com/images/splash-logo.png" alt="logo-img" class="logo-img"/>
         
         <div class="code-text">
             Thank you for registering with us! You requested for a code to be sent to you. please use the
             verification code below:
         </div>
         <div class="code-number">${emailCode}</div>
         <div class="code-expiry">
             This code will expire on ${new Date(expiresAt).toLocaleString()}, please ensure to
             verify your email before the time of expiration.
         </div>
     </div>
 
     <div class="mail-container-two">
         <div class="mail-text">If you did not send this email, please ignore this email.</div>
         <div class="mail-text">Thank you for choosing our service.</div>
         <div class="mail-text">Best regards,</div>
         <div class="mail-text">Mahjong Clinic App Team</div>
     </div>
 
     <div class="footer">
         <p>This is an automated message, please do not reply directly to this email.</p>
         <p>© 2025 Mahjong Clinic Nigeria. All rights reserved.</p>
         <p>Developer | iphysdynamix</p>
     </div>
 </body>
 </html>`
 };