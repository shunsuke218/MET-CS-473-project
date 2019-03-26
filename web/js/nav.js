//         responseType: 'token',

// var options = {
//     auth: {


//         params: { scope: 'openid email profile', }
//     }
// };

// var lock = new Auth0Lock(
//     'vFJIRuqMjrla9QBtHjvLGFeWz4gENqZi',
//     'cs473familytree.auth0.com',
//     // options
// );


// lock.on("authenticated", async function (authResult) {
//     console.log(authResult);
//     // debugger;
//     // await localLoginSuccessSimple(lock, authResult);
//     // displayButtons();
// });

var webAuth = new auth0.WebAuth({
    domain: 'cs473familytree.auth0.com',
    clientID: 'vFJIRuqMjrla9QBtHjvLGFeWz4gENqZi',
    responseType: 'token id_token',
    scope: 'openid profile read:tree write:tree',
    redirectUri: window.location.href,
    audience: 'http://localhost:5005/api',
});

function onLogin() {
    // on login
    webAuth.parseHash(function (err, authResult) {
        if (err) {
            // error
            console.log('error login');
            console.log(err);
            return
        }

        onLoginSuccess(authResult)
    })

}


// called on refresh
if (localStorage.getItem('isLoggedIn') === 'true') {
    renewTokens((err) => {
        //error
        console.log('error renew token');
        console.log(err);
    }, () => {
        // success
        console.log('renew token success');
        //todo: refresh button
    });
} else {
    // called when redirected back from auth0
    onLogin();
}

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
    if (isAuthenticatedSimple()) { // todo
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

displayButtons();