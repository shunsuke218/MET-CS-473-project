const express = require('express');
const router = express.Router();

router.post('/test', async (req, res) => {

    try {
        return res.status(200).json({
            message: "success"
        });
    } catch (errObj) {
        console.log(errObj);
        res.status(400).json({error: errObj.message});
    }

});



module.exports = router;
