import { getSiteRootFromUrl } from '../../utils/utils.js';

let Navbar = {
    render: async () => {
        let view =  /*html*/`
             <nav id="navbar">
                <div>Family Tree</div>
                <div id="login"><a href="#" id="btn-login">Login</a></div>
                <div id="logout"><a href="#" id="btn-logout">Log out</div>
            </nav>
        `
        return view
    },
    after_render: async () => {

        var lock = new Auth0Lock(
            'vFJIRuqMjrla9QBtHjvLGFeWz4gENqZi',
            'cs473familytree.auth0.com'
        );

        var idToken;
        var accessToken;
        var expiresAt;

        var loginBtn = document.getElementById('btn-login');

        loginBtn.addEventListener('click', function (e) {
            e.preventDefault();
            // webAuth.authorize();
            lock.show();
        });

        var logoutBtn = document.getElementById('btn-logout');
        logoutBtn.addEventListener('click', logout);

        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'none';

        lock.on("authenticated", function (authResult) {
            localLogin(authResult);
            loginBtn.style.display = 'none';

            // Use the token in authResult to getUserInfo() and save it to localStorage
            lock.getUserInfo(authResult.accessToken, function (error, profile) {
                if (error) {
                    // Handle error
                    return;
                }

                localStorage.setItem('accessToken', authResult.accessToken);
                displayButtons();

            });
        });



        function handleAuthentication() {



        }

        function localLogin(authResult) {
            // Set isLoggedIn flag in localStorage
            localStorage.setItem('isLoggedIn', 'true');
            // Set the time that the access token will expire at
            expiresAt = JSON.stringify(
                authResult.expiresIn * 1000 + new Date().getTime()
            );
            accessToken = authResult.accessToken;
            idToken = authResult.idToken;
        }

        async function logout() {
            // Remove isLoggedIn flag from localStorage
            localStorage.removeItem('isLoggedIn');
            // Remove tokens and expiry time
            accessToken = '';
            idToken = '';
            expiresAt = 0;
            displayButtons();

            // console.log(window.location.href);
            let returnTo = getSiteRootFromUrl(window.location.href);

            // todo
            lock.logout({
                returnTo
            });

        }


        function renewTokens() {
            lock.checkSession({}, (err, authResult) => {
                if (authResult && authResult.accessToken && authResult.idToken) {
                    localLogin(authResult);
                } else if (err) {
                    alert(
                        'Could not get a new token ' + err.error + ':' + err.error_description + '.'
                    );
                    logout();
                }
                displayButtons();
            });
        }

        function isAuthenticated() {
            // Check whether the current time is past the
            // Access Token's expiry time
            var expiration = parseInt(expiresAt) || 0;
            return localStorage.getItem('isLoggedIn') === 'true' && new Date().getTime() < expiration;
        }

        function displayButtons() {
            // console.log(isAuthenticated());
            if (isAuthenticated()) {
                loginBtn.style.display = 'none';
                logoutBtn.style.display = 'block';
            } else {
                loginBtn.style.display = 'block';
                logoutBtn.style.display = 'none';
            }
        }

        if (localStorage.getItem('isLoggedIn') === 'true') {
            renewTokens();
        } 

        displayButtons();
    }

}

export default Navbar;