"use strict";

let CLIENT_ID = "vFJIRuqMjrla9QBtHjvLGFeWz4gENqZi";

window.addEventListener('load', function () {

    var webAuth = new auth0.WebAuth({
        domain: 'cs473familytree.auth0.com',
        clientID: CLIENT_ID,
        responseType: 'token id_token',
        scope: 'openid profile read:tree write:tree',
        redirectUri: "http://localhost:5005",

        // redirectUri: getSiteRootFromUrl(window.location.href) + "/tree",
        audience: 'bucs473familytreeapi',
    });

    if (!isAuthenticated()) {

        // attempt to renew token every time page refreshes
        webAuth.checkSession({}, (err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                // console.log(authResult);
                onLoginSuccess(authResult)
                displayButtons(isAuthenticated())
                location.reload() // reload so that the page can redirect to tree page
            } else if (err) {
                console.log(err);
            }

        });
    }


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

            window.location.hash = '';
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
        onLogout(webAuth)
        displayButtons(isAuthenticated());

    });

    // check should display login or logout button
    function displayButtons(isAuthenticated) {
        document.getElementById('nav-buttons').style.display = "block";
        if (isAuthenticated) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
        } else {
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    }

    displayButtons(isAuthenticated());


})
