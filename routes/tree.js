const express = require('express');
const router = express.Router();

router.post('/getRecord', async (req, res) => {
    let db = req.db;
    let { email } = req.body;
    const collection = db.collection('records');

    let record = await collection.findOne({ email: "a" });

    // not found
    if (record == null) {
        // send default tree

        var nodes = [
            { id: 0, label: "Shun", spread: 0, depth: 0, dob: "1999/1/1", isMarried: true, hasChild: true, desc: "this is testing script" },
            { id: 1, label: "Wife", spread: 2, depth: 0, dob: "1999/1/1", isMarried: true, hasChild: true },
            { id: 2, label: "MeWife", spread: 1, depth: 0, connection: true, child: [3, 4] },
            { id: 3, label: "Son", spread: 1, depth: 1, dob: "2019/1/1", hasSibling: true },
            { id: 4, label: "Daughter", spread: 1, depth: 1, dob: "2019/1/1", hasSibling: true },
            { id: 5, label: "Dad", spread: -1, depth: -1, dob: "1969/1/1", hasChild: true, isMarried: true },
            { id: 6, label: "Mom", spread: 1, depth: -1, hasChild: true, isMarried: true },
            { id: 7, label: "DadMom", spread: 0, depth: -1, connection: true, hasChild: true, child: [0] },
            { id: 8, label: "Grandpa", spread: -1, depth: -2, dob: "1939/1/1", hasChild: true }
        ]

        var links = [
            { id: 0, source: 0, target: 2 },
            { id: 1, source: 1, target: 2 },
            { id: 2, source: 2, target: 3 },
            { id: 3, source: 2, target: 4 },
            { id: 4, source: 5, target: 7 },
            { id: 5, source: 6, target: 7 },
            { id: 6, source: 7, target: 0 },
            { id: 7, source: 8, target: 5 },
        ]

        record = {
            nodes, links
        }

    }
    // console.log(record);
    res.status(200).json({ record });

});

router.post("/updateRecord", async (req, res) => {
    let db = req.db;
    let record = req.body;
    let { email } = record;

    // find all record pertain to this email
    const collection = db.collection('records');

    let records = await collection.find({ email }).toArray();

    // if found
    if (records.length !== 0) {
        // update
        await collection.updateOne({ email }, { $set: record });
    } else {
        // if not found
        // insert
        await collection.insertMany([record]);
    }

    res.status(200).json({ status: "success" });
});

module.exports = router;
