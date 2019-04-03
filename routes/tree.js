const express = require('express');
const router = express.Router();
const { jwtCheck, getUserProfile, userHasScopes } = require("../libs/authUtils")

/*
   * {
   *  userId: xxx,
   *  tree: {}
   * }
   */
router.get('/', jwtCheck, getUserProfile, async (req, res, next) => {

    // check authorization
    let scope = req.scope
    if (!userHasScopes(scope, ["read:tree"])) {
        return res.status(401).json({})
    }

    // get the user id
    let db = req.db;
    let userId = req.userInfo.sub

    try {
        let tree = await db.collection('trees').findOne({ userId });
        // not found
        if (tree == null) {
            // send default tree
            var nodes = [
                { id: 0, label: "My name", spread: 0, depth: 0, dob: "1999/1/1", isMarried: false, hasChild: false, desc: "this is testing script" }
            ]
            var links = [
            ]
            tree = {
                nodes, links
            }
            return res.status(200).json({ tree });
        } else {
            // found tree record
            return res.status(200).json({ tree: tree.tree });
        }


    } catch (err) {
        console.log(err);
        return res.status(404).json({});
    }

});

router.post("/", jwtCheck, getUserProfile, async (req, res) => {

    // check authorization
    let scope = req.scope
    if (!userHasScopes(scope, ["write:tree"])) {
        return res.status(401).json({})
    }

    // get the user id
    let db = req.db;
    let userId = req.userInfo.sub

    try {
        let db = req.db;
        let updatedTree = req.body.tree;

        // find all record pertain to this email
        const collection = db.collection('trees');
        let oldTree = await collection.findOne({ userId });

        // if found
        if (oldTree != null) {
            // update
            await collection.updateOne({ userId }, { $set: { userId, tree: updatedTree } });
        } else {
            // if not found
            // insert
            await collection.insertOne({ userId, tree: updatedTree });
        }

        return res.status(200).json({ status: "success" });
    } catch (err) {
        console.log(err);
        return res.status(404).json({});

    }


});

module.exports = router;
