const express = require('express');
const router = express.Router();

router.get('/', authCheck, async (req, res) => {


});

router.post("/", authCheck, async (req, res) => {

   
});

module.exports = router;
