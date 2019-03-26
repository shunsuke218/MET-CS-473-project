//         responseType: 'token',

// var options = {
//     auth: {

        
//         params: { scope: 'openid email profile', }
//     }
// };

var lock = new Auth0Lock(
    'vFJIRuqMjrla9QBtHjvLGFeWz4gENqZi',
    'cs473familytree.auth0.com',
    // options
);


lock.on("authenticated", async function (authResult) {
    console.log(authResult);
    // debugger;
    // await localLoginSuccessSimple(lock, authResult);
    // displayButtons();
});

var loginBtn = document.getElementById('btn-login');
loginBtn.style.display = 'none';
loginBtn.addEventListener('click', function () {
    lock.show();
});

var logoutBtn = document.getElementById('btn-logout');
logoutBtn.style.display = 'none';
logoutBtn.addEventListener('click', () => {
    logoutSimple(lock, displayButtons);
});


function displayButtons() {
    // console.log(isAuthenticated());
    if (isAuthenticatedSimple()) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

displayButtons();