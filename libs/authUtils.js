var jwt = require('express-jwt');
var jwks = require('jwks-rsa');
var rp = require('request-promise');

var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://cs473familytree.auth0.com/.well-known/jwks.json'
    }),
    audience: 'bucs473familytreeapi',
    issuer: 'https://cs473familytree.auth0.com/',
    algorithms: ['RS256']
});

async function getUserProfile(req, res, next) {
    try {
        let accessToken = req.headers.authorization.substring(7)

        let tokenPayload = req.user
        req.tokenPayload = tokenPayload
        req.scope = tokenPayload.scope

        // get user profile with access token
        // request https://cs473familytree.auth0.com/userinfo
        // with the access token

        let options = {
            uri: "https://cs473familytree.auth0.com/userinfo",
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        let userInfo = await rp(options)
        req.userInfo = JSON.parse(userInfo)

        next()
    } catch (err) {
        console.log('err in getUserProfile in authUtils.js');
        return res.status(401).json({ error: "error in authentication" })
        // console.error(err);
    }


}

function userHasScopes(useScopesStr, requiredScopes) {
    if (!useScopesStr) return false;
    var grantedScopes = useScopesStr.split(' ');
    for (var i = 0; i < requiredScopes.length; i++) {
        if (grantedScopes.indexOf(requiredScopes[i]) < 0) {
            return false;
        }
    }
    return true;
}

module.exports = {
    jwtCheck,
    getUserProfile,
    userHasScopes
}