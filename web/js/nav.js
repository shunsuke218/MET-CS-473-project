"use strict";

window.addEventListener('load', function () {

    var webAuth = new auth0.WebAuth({
        domain: 'cs473familytree.auth0.com',
        clientID: 'vFJIRuqMjrla9QBtHjvLGFeWz4gENqZi',
        responseType: 'token id_token',
        scope: 'openid profile read:tree write:tree',
        redirectUri: window.location.href,
        audience: 'bucs473familytreeapi',
    });

    // will be successful after redirected from auth0
    function checkShouldHandleLogin() {
        // on login
        webAuth.parseHash(function (err, authResult) {
            if (err || !authResult) {
                // error
                // console.log('parseHash from url not successful');
                // console.log(err);
                return
            }

            onLoginSuccess(authResult)
            displayButtons()
        })

    }

    checkShouldHandleLogin();

    // todo: renew token if already logged
    // todo: renew token peridlally even without refresh

    // login button
    var loginBtn = document.getElementById('btn-login');
    loginBtn.style.display = 'none';
    loginBtn.addEventListener('click', function () {
        // lock.show();
        webAuth.authorize();
    });

    // logout button
    var logoutBtn = document.getElementById('btn-logout');
    logoutBtn.style.display = 'none';
    logoutBtn.addEventListener('click', () => {
        // logoutSimple(lock, displayButtons); todo
        auth0Logout(displayButtons)
    });

    // check should display login or logout button
    function displayButtons() {
        // console.log(isAuthenticated());
        if (isAuthenticated()) { // todo
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
        } else {
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    }

    displayButtons();


})
