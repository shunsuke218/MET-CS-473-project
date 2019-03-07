
var lock = getAuth0Lock();

lock.on("authenticated", async function (authResult) {
    await localLoginSuccessSimple(lock, authResult);
    displayButtons();
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