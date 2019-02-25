import {
    getSiteRootFromUrl,
    getUserEmailWithAccessToken,
    isAuthenticatedSimple,
    isAuthenticated,
    localLoginSuccess,
    renewTokens,
    logoutSimple,
    logout,
    getAuth0Lock
} from '../../utils/utils.js';

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

        var lock = getAuth0Lock();

        lock.on("authenticated", function (authResult) {
            // debugger;
            // console.log(authResult);
            // loginBtn.style.display = 'none';
            localLoginSuccess(authResult, displayButtons);
        });

        var loginBtn = document.getElementById('btn-login');
        loginBtn.style.display = 'none';
        loginBtn.addEventListener('click', function () {
            lock.show();
        });

        var logoutBtn = document.getElementById('btn-logout');
        logoutBtn.style.display = 'none';
        logoutBtn.addEventListener('click', () => {
            logout(lock, displayButtons);
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

        lock.checkSession({}, async (err, authResult) => {
            console.log(err);
            // console.log(authResult);
            // debugger

        });

        // if (localStorage.getItem('isLoggedIn') === 'true') {
        //     renewTokens( // success
        //         lock,
        //         displayButtons,
        //         () => {
        //             debugger;
        //             logout(lock, displayButtons)
        //         }
        //     );
        // } else {
        //     // console.log('not logged in');
        //     displayButtons();
        // }


    }

}

export default Navbar;