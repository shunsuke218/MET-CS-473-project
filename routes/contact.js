const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

router.post('/', async (req, res, next) => {
    try {

        let {name, email, subject, country} = req.body;
        // console.log(req.body);

        let emailBody = `${name}: ${subject} from ${country}`

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: 'steve.mu.dev@gmail.com',
            from: email,
            subject: 'Customer email from Cs473 project',
            text: emailBody,
            html: emailBody,
        };
        sgMail.send(msg, () => {
            console.log('sent');
            res.status(200).redirect("/");

        });


    } catch (err) {
        console.log(err);
        return res.status(404).json({});
    }

});


module.exports = router;
