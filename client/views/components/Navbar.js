import {
    isAuthenticatedSimple,
    localLoginSuccessSimple,
    getUserProfile,
    logoutSimple,
    getAuth0Lock
} from '../../utils/utils.js';

let Navbar = {
    render: async () => {
        let view =  /*html*/`
     <nav id="navbar">
             
              
        <div class="burger">
            <div class="line1"></div>
            <div class="line2"></div>
            <div class="line3"></div>
         </div>

            <ul class="nav-links">
            <li><a href="#" >Home</a></li>
            <li><a href="#" >Family Tree</a></li>
            <li><a href="#" >Search</a></li>
            </ul>
        <div>
            <div id="login"><a href="#" id="btn-login" class="btn">LogIn</a></div>
            <div id="logout"><a href="#" id="btn-logout" class="btn">Log out</a></div>
        </div>
            <div id="Creat-an-account"><a href="#" id="btn-Creat-an-account" class="btn">Creat an account</a></div>        
            
    </nav>
               
        `
        return view
    },
    after_render: async () => {

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

    }

}

const navSlide = () => {

    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksLi = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {

        nav.classList.toggle('nave-active');
    

        //Animate links
        navLiensLi.forEach((link, index) => {
            link.style.animation = 'navLinkFade 0.5s ease forwards ${index / 7}s';
            console.log(index / 3);
        });
        
        burger.classList.toggle('toggle');
        
    });

    navSlide();

}
    

export default Navbar;

    



