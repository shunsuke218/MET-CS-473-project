const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

router.post('/', async (req, res, next) => {
    try {

        let {name, email, description, country} = req.body;
        console.log(req.body);

        let emailBody = `${name}: ${description} from ${country}`

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: 'cs473project.test@gmail.com',
            from: email,
            subject: 'Cs473 project contact form',
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
