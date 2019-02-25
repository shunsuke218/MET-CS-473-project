/*
      give this: http://localhost:5005/#/family-tree
      return this: http://localhost:5005/
      */
function getSiteRootFromUrl(url) {
    var parser = document.createElement('a');
    parser.href = url;
    let siteRoot = parser.protocol + "//" + parser.host;
    return siteRoot;
}

// cannot do this
// var lock = new Auth0Lock(
//     'vFJIRuqMjrla9QBtHjvLGFeWz4gENqZi',
//     'cs473familytree.auth0.com'
// );

function getAuth0Lock() {

    var lock = new Auth0Lock(
        'vFJIRuqMjrla9QBtHjvLGFeWz4gENqZi',
        'cs473familytree.auth0.com'
    );

    return lock;
}

function isAuthenticated() {
    // Check whether the current time is past the
    // Access Token's expiry time
    let expiresAt = localStorage.getItem("expiresAt");
    // console.log(expiresAt);
    var expiration = parseInt(expiresAt) || 0;
    // console.log(expiresAt);
    return localStorage.getItem('isLoggedIn') === 'true' && new Date().getTime() < expiration;
}

async function localLoginSuccess(authResult, cb) {
    localStorage.setItem('isLoggedIn', 'true');
    let expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
    // console.log(expiresAt);
    localStorage.setItem('expiresAt', expiresAt);
    localStorage.setItem('accessToken', authResult.accessToken);
    cb();
}

function loginSuccess(token) {
    localStorage.setItem('accessToken', token);
}

function isAuthenticatedSimple() {
    let token = localStorage.getItem('accessToken');
    if (token) return true;
    else return false;

    // // Check whether the current time is past the
    // // Access Token's expiry time
    // let expiresAt = localStorage.getItem("expiresAt");
    // // console.log(expiresAt);
    // var expiration = parseInt(expiresAt) || 0;
    // // console.log(expiresAt);
    // return localStorage.getItem('isLoggedIn') === 'true' && new Date().getTime() < expiration;
}

function renewTokens(lock, successCb, errorCb) {
    lock.checkSession({}, async (err, authResult) => {
        console.log(err);
        console.log(authResult);

        if (authResult && authResult.accessToken) {
            localLoginSuccess(authResult, async () => {
                await successCb();
            });
        } else if (err) {
            console.log(err);
            await errorCb();
        }
    });
}

function getUserEmailWithAccessToken(lock, token) {
    return new Promise((resolve, reject) => {
        // Use the token in authResult to getUserInfo() and save it to localStorage
        lock.getUserInfo(token, function (error, profile) {
            if (error) { reject(); }
            // store user's identify
            let email = profile.email;
            resolve(email);
        });
    })
}

async function getUserEmail() {
    let lock = await getAuth0Lock();
    let token = localStorage.getItem("accessToken");
    // console.log(token);
    let email = await getUserEmailWithAccessToken(lock, token);
    return email;
}


function logout(lock, cb) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('accessToken');

    cb();

    let returnTo = getSiteRootFromUrl(window.location.href);

    lock.logout({
        returnTo
    });
}

function logoutSimple(lock, cb) {
    localStorage.removeItem('accessToken');

    cb();

    let returnTo = getSiteRootFromUrl(window.location.href);

    lock.logout({
        returnTo
    });
}

function parseRequestURL() {

    let url = location.hash.slice(1).toLowerCase() || '/';
    let r = url.split("/")
    let request = {
        resource: null,
        id: null,
        verb: null
    }
    request.resource = r[1]
    request.id = r[2]
    request.verb = r[3]

    return request
}

export {
    getSiteRootFromUrl,
    getUserEmailWithAccessToken,
    isAuthenticated,
    localLoginSuccess,
    renewTokens,
    logout,
    loginSuccess,
    isAuthenticatedSimple,
    logoutSimple,
    parseRequestURL,
    getAuth0Lock,
    getUserEmail
}