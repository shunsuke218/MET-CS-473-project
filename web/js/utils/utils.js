"use strict";

function isAuthenticated() {
    // Check whether the current time is past the
    // Access Token's expiry time
    let expiresAt = localStorage.getItem("expiresAt");
    // console.log(expiresAt);
    var expiration = parseInt(expiresAt) || 0;
    // console.log(expiresAt);
    return localStorage.getItem('accessToken') && new Date().getTime() < expiration;
}

function onLoginSuccess(authResult) {
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

function renewTokens(webAuth, onError, onSuccess) {
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


function onLogout(webAuth) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    logOutOfAuth0(webAuth)
}

const logOutOfAuth0 = (webAuth) => {
    webAuth.logout({
        returnTo: window.location.href,
        client_id: CLIENT_ID
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