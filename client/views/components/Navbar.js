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
                <div>
                    <div id="login"><a href="#" id="btn-login">LogIn</a></div>
                    <div id="logout"><a href="#" id="btn-logout">Log out</a></div>
                </div>
             
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


        if (localStorage.getItem('isLoggedIn') === 'true') {
            // console.log('is logged in');
            renewTokens( // success
                lock,
                displayButtons,
                logout(lock, displayButtons));
        } else {
            // console.log('not logged in');
            displayButtons();
        }


    }

}

export default Navbar;