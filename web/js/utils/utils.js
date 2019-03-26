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

function onLoginSuccess(authResult, cb = () => {}) {
    localStorage.setItem('isLoggedIn', 'true');
    let expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
    localStorage.setItem('expiresAt', expiresAt);
    localStorage.setItem('accessToken', authResult.accessToken);
    localStorage.setItem('idToken', authResult.idToken);
}

async function localLoginSuccessSimple(lock, authResult) {
    localStorage.setItem('accessToken', authResult.accessToken);
    let profile = await getUserInfoFromAuth0(lock, authResult.accessToken);
    localStorage.setItem("profile", JSON.stringify(profile));
    return profile;
}

function getUserInfoFromAuth0(lock, accessToken) {
    return new Promise((resolve, reject) => {
        lock.getUserInfo(accessToken, function (error, profile) {
            if (!error) {
                resolve(profile);
            } else {
                reject();
            }
        });
    })
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

function renewTokens(onError, onSuccess) {
    webAuth.checkSession({}, (err, authResult) => {
        if (err) {
            // console.log('review token error');
            // console.log(err);
            // todo: logout
            onError(err)
            return
        }
        onLoginSuccess(authResult, onSuccess);
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
    let email = await getUserEmailWithAccessToken(lock, token);
    return email;
}

function getUserProfile() {
    let profileStr = localStorage.getItem("profile");
    let profileObj = JSON.parse(profileStr);
    return profileObj;
}

function auth0Logout(cb) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    cb()
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

// export {
//     getSiteRootFromUrl,
//     getUserEmailWithAccessToken,
//     isAuthenticated,
//     localLoginSuccess,
//     renewTokens,
//     logout,
//     localLoginSuccessSimple,
//     isAuthenticatedSimple,
//     logoutSimple,
//     parseRequestURL,
//     getAuth0Lock,
//     getUserEmail,
//     getUserProfile
// }