let Navbar = {
    render: async () => {
        let view =  /*html*/`
             <nav class="navbar">
                <div>Family Tree</div>
                <div id="login"><a href="#" id="btn-login">Login</a></div>
                <div id="logout"><a href="#" id="btn-logout">Log out</div>
            </nav>
        `
        return view
    },
    after_render: async () => {

        var idToken;
        var accessToken;
        var expiresAt;

        var webAuth = new auth0.WebAuth({
            domain: 'cs473familytree.auth0.com',
            clientID: 'vFJIRuqMjrla9QBtHjvLGFeWz4gENqZi',
            responseType: 'token id_token',
            scope: 'openid',
            redirectUri: window.location.href
        });

        var loginBtn = document.getElementById('btn-login');

        loginBtn.addEventListener('click', function (e) {
            e.preventDefault();
            webAuth.authorize();
        });

        var logoutBtn = document.getElementById('btn-logout');
        logoutBtn.addEventListener('click', logout);

        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'none';

        function handleAuthentication() {
            webAuth.parseHash(function (err, authResult) {
                if (authResult && authResult.accessToken && authResult.idToken) {
                    window.location.hash = '/family-tree';
                    localLogin(authResult);
                    loginBtn.style.display = 'none';
                    // homeView.style.display = 'inline-block';
                } else if (err) {
                    // homeView.style.display = 'inline-block';
                    console.log(err);
                    alert(
                        'Error: ' + err.error + '. Check the console for further details.'
                    );
                }
                displayButtons();
            });
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

            // let res = await fetch("https://cs473familytree.auth0.com/v2/logout");
            // let json = await res.json();
            // console.log(json);

            window.location = "https://cs473familytree.auth0.com/v2/logout?returnTo=http%3A%2F%2Flocalhost:5000"
            //https://cs473familytree.auth0.com/v2/logout
        }

        function renewTokens() {
            webAuth.checkSession({}, (err, authResult) => {
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
        } else {
            handleAuthentication();
        }
    }

}

export default Navbar;