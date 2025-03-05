// paymentEmailTemplates.js


  /**
  * Email template for email verification
  * @param {string} fullname - fullname
  * @param {string} dollar_amount - Dollar Amount
  * @param {string} rate - Rate
  * @param {string} amount - Amount
  * @param {string} payment_type - Payment Type
  * @param {string} paymentStatus - Payment Status
  * @param {string} paymentDuration - Payment Duration
  * @param {Date} paymentDate - Payment Date
  * @param {string} phoneNumber - Phone Number
  * @param {string} transactionId - Transaction ID
  * @returns {string} HTML email template
  */
 export const paymentConfirmationTemplate = (dollar_amount, rate, amount, payment_type, paymentStatus, paymentDuration, paymentDate, phoneNumber, transactionId, fullname) => {
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
        *{
            box-sizing: border-box;
        }
         .mail-container {
             width: 28rem;
             background-color: white;
             box-shadow: 0 0px 10px rgba(0, 0, 0, 0.02);
             padding: 50px 20px;
             text-align: center;
             margin: 0 auto;
         }
         .logo-img{
             position: relative;
             width: 180px;
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
             width: 150px;
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
         .code-number {
            position: relative;
            width: 50%;
            margin: 20px auto;
            text-align: center;
            padding: 10px;
            border-radius: 3px;
            margin-bottom: 20px;
            font-size: 28px;
            font-weight: 600;
            background-color: ${paymentStatus === 'Pending' ? '#fff3cd' : paymentStatus === 'successful' ? '#d4edda' : '#f8d7da'};
            color: ${paymentStatus === 'Pending' ? '#856404' : paymentStatus === 'successful' ? '#155724' : '#721c24'};
            border: 1px solid ${paymentStatus === 'Pending' ? '#856404' : paymentStatus === 'successful' ? '#155724' : '#721c24'} !important;
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
             width: 28rem;
             position: relative;
             background-color: #faf0f0 !important;
             box-shadow: 0 0px 10px rgba(0, 0, 0, 0.02) !important;
             padding: 50px 20px;
             text-align: center;
             margin: 0 auto;
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
             width: 28rem;
             position: relative;
             text-align: center;
             background-color: #621d1f !important;
             padding: 50px 20px;
             margin: 0 auto;
         }
         .footer p{
             position: relative;
             text-align: center;
             font-size: 14px;
             color: white;
         }
        .list-box{
            position: relative;
            width: 100%;
            padding: 20px 20px;
            background-color: #ffffff !important;
            border-radius: 5px;
        }
        .list-flexbox{
            position: relative;
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            margin-bottom: 15px;
        }
        .list-icon{
            position: relative;
            width: 40%;
            font-size: 14px;
            color: #ac1d21;
            text-align: left;
        }
        .list-text{
            position: relative;
            width: 55%;
            text-align: left;
            font-size: 14px;
            color:#621d1f;
            margin-left: 10px;
        }
     </style>
 </head>
 <body>
 
     <img src="https://mahjon-db.goldenrootscollectionsltd.com/images/email-image.png" alt="img" class="welcome-img">
     
     <div class="hi-user">Hello <span class="hi-user-span">${fullname}</span>,</div>
     <div class="hi-user-subtext">Payment Notice</div>
     
     <div class="mail-container">
         <img src="https://mahjon-db.goldenrootscollectionsltd.com/images/splash-logo.png" alt="logo-img" class="logo-img"/>
         
         <div class="code-text">
             Your payment has been processed successfully, please see below your transaction details:
         </div>
         <div class="code-number">${paymentStatus}</div>
         <div class="list-box">
            <div class="list-flexbox">
                <div class="list-icon">Amount (USD)</div>
                <div class="list-text">$${Number(dollar_amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div class="list-flexbox">
                <div class="list-icon">Rate</div>
                <div class="list-text">₦${Number(rate).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div class="list-flexbox">
                <div class="list-icon">Amount (NGN)</div>
                <div class="list-text">₦${Number(amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div class="list-flexbox">
                <div class="list-icon">Payment Date</div>
                <div class="list-text">${new Date(paymentDate).toLocaleString()}</div>
            </div>
            <div class="list-flexbox">
                <div class="list-icon">Payment Type</div>
                <div class="list-text">${payment_type}</div>
            </div>
            <div class="list-flexbox">
                <div class="list-icon">Payment Duration</div>
                <div class="list-text">${paymentDuration}</div>
            </div>
            <div class="list-flexbox">
                <div class="list-icon">Phone Number</div>
                <div class="list-text">${phoneNumber}</div>
            </div>
            <div class="list-flexbox">
                <div class="list-icon">Transaction ID</div>
                <div class="list-text">${transactionId}</div>
            </div>
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