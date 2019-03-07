"use strict";

import { parseRequestURL } from './utils/utils.js';

import Home from './views/pages/Home.js'
import FamilyTree from './views/pages/FamilyTree.js'
import FamilyTreeDev from './views/pages/FamilyTreeDev.js'
import Error404 from './views/pages/Error404.js'

import Navbar from './views/components/Navbar.js'
import Bottombar from './views/components/Bottombar.js'


// List of supported routes. Any url other than these routes will throw a 404 error
const routes = {
    '/': Home,
    '/family-tree': FamilyTree,
    '/family-tree-dev': FamilyTreeDev,
};


// The router code. Takes a URL, checks against the list of supported routes and then renders the corresponding content page.
const router = async () => {
    // console.log(window.location.href);
    // debugger;
    // look for access token and store it if found in url
    //http://localhost:5005/#access_token=123

    // let re = /#access_token=.*/;
    // let ma = window.location.href.match(re);
    // if (ma) {
    //     // found access token
    //     // console.log(ma[0]);
    //     let tokenWithPrefix = ma[0];
    //     let splits = tokenWithPrefix.split("=")
    //     let token = splits[1];
    //     loginSuccess(token);
    //     // console.log(loginSuccess);

    // }


    // Lazy load view element:
    const header = null || document.getElementById('header_container');
    const content = null || document.getElementById('page_container');
    const footer = null || document.getElementById('footer_container');

    // Render the Header and footer of the page
    header.innerHTML = await Navbar.render();
    await Navbar.after_render();
    footer.innerHTML = await Bottombar.render();
    await Bottombar.after_render();

    // Get the parsed URl from the addressbar
    let request = parseRequestURL()

    // Parse the URL and if it has an id part, change it with the string ":id"
    let parsedURL = (request.resource ? '/' + request.resource : '/') + (request.id ? '/:id' : '') + (request.verb ? '/' + request.verb : '')

    // Get the page from our hash of supported routes.
    // If the parsed URL is not in our list of supported routes, select the 404 page instead
    let page = routes[parsedURL] ? routes[parsedURL] : Error404
    content.innerHTML = await page.render();
    await page.after_render();

}

// Listen on hash change:
window.addEventListener('hashchange', router);

// Listen on page load:
window.addEventListener('load', router);