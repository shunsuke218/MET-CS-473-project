console.clear();
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.side-nav-links');
    const navLiens = document.querySelectorAll('.side-nav-links li');
    //Toggle nav 
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        //Animate links
        navLiens.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.5}s`;
                console.log(index / 5);
            }
        });
        //burger animation

        burger.classList.toggle('toggle');

    });

}

navSlide();
