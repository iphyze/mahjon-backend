export const createPayment = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { 
            userId, email, dollar_amount, rate, amount, payment_type, phoneNumber, 
            paymentDuration, transactionId, fullname, paymentMethod, transactionReference, 
            currency, paymentStatus 
        } = req.body;

        const sanitizedEmail = email.trim().toLowerCase();
        const paymentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const createdBy = sanitizedEmail;
        const updatedBy = sanitizedEmail;

        // Check if user exists and get their push token
        const checkUserQuery = 'SELECT id, expoPushToken FROM users WHERE id = ? AND email = ?';
        db.query(checkUserQuery, [userId, sanitizedEmail], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            if (results.length === 0) return res.status(400).json({ message: 'User not found' });

            const expoPushToken = results[0].expoPushToken;

            // Generate notification content based on payment type and status
            const notificationTitle = paymentStatus === 'successful' ? 
                `${payment_type} Completed!` : `${payment_type} Status Update`;
                
            const notificationMessage = paymentStatus === 'successful' ?
                `🎉 Payment of ${currency}${amount} received for ${payment_type}. Transaction ID: ${transactionId}` :
                `Your ${payment_type} status has been updated to ${paymentStatus}`;

            // Insert payment details
            const insertPaymentQuery = `INSERT INTO user_payment 
                (userId, email, dollar_amount, rate, amount, payment_type, paymentStatus, paymentDuration, 
                paymentDate, phoneNumber, transactionId, fullname, createdBy, updatedBy, paymentMethod, 
                transactionReference, currency) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            db.query(
                insertPaymentQuery,
                [userId, sanitizedEmail, dollar_amount, rate, amount, payment_type, paymentStatus, 
                paymentDuration, paymentDate, phoneNumber, transactionId, fullname, createdBy, 
                updatedBy, paymentMethod, transactionReference, currency],
                async (err, result) => {
                    if (err) return res.status(500).json({ message: 'Error creating payment', error: err });

                    // Send push notification
                    if (expoPushToken) {
                        await sendPushNotification(expoPushToken, notificationTitle, notificationMessage);
                    }

                    // Store notification in database
                    await insertNotification(userId, notificationTitle, notificationMessage, sanitizedEmail);

                    // Send payment confirmation email
                    const emailSent = await sendPaymentEmail(
                        sanitizedEmail, dollar_amount, rate, amount, payment_type, paymentStatus,
                        paymentDuration, paymentDate, phoneNumber, transactionId, fullname
                    );

                    res.status(200).json({
                        message: emailSent ? 
                            'Payment recorded and notifications sent successfully!' :
                            'Payment recorded but email notification failed',
                        data: {
                            paymentId: result.insertId,
                            userId, email: sanitizedEmail, dollar_amount, rate, amount,
                            payment_type, paymentStatus, paymentDuration, paymentDate,
                            phoneNumber, transactionId, fullname, createdBy, updatedBy,
                            paymentMethod, transactionReference, currency,
                            notificationSent: !!expoPushToken
                        }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};