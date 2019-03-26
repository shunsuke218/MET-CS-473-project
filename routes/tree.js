const express = require('express');
const router = express.Router();
const { jwtCheck, getUserProfile, userHasScopes } = require("../libs/authUtils")


router.get('/getRecord', jwtCheck, getUserProfile, async (req, res, next) => {

    // check authorization
    let scope = req.scope
    if (!userHasScopes(scope, ["read:tree"])) {
        return res.status(401).json({})
    }

    // get the user id
    let db = req.db;
    let userId = req.userInfo.sub

    // record format in db
    /**
     * {
     *  userId: xxx,
     *  tree: {}
     * }
     * 
     * send only the tree
     */

    try {

        let tree = await db.collection('trees').findOne({ userId });

        // not found
        if (tree == null) {
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

            tree = {
                nodes, links
            }

        }

        return res.status(200).json({ tree });
    } catch (err) {
        console.log(err);
        return res.status(404).json({});
    }

});

router.post("/updateRecord", async (req, res) => {

    try {
        let db = req.db;
        let updatedRecord = req.body;
        let { email } = updatedRecord;

        // find all record pertain to this email
        const collection = db.collection('records');

        let oldRecord = await collection.findOne({ email });

        // if found
        if (oldRecord != null) {
            // update
            await collection.updateOne({ email }, { $set: updatedRecord });
        } else {
            // if not found
            // insert
            await collection.insertOne(updatedRecord);
        }

        return res.status(200).json({ status: "success" });
    } catch (err) {
        console.log(err);
        return res.status(404).json({});

    }


});

module.exports = router;
