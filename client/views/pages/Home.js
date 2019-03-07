let Home = {
    render: async () => {
        let view =  /*html*/`
            <div id="home">
           
           
                <h1>Home</h1>
                <p>Welcome to family tree application!</p>
                <a href="/#/family-tree">View your tree</a>
                <a href="/#/family-tree-dev">Shun's working tree</a>
                
            </div>

       `
        return view
    }, after_render: async () => {

    //    let toggleNavStatus = false;

    //    let toggleNav = function(){

    //     let getSideBar = document.querySelector(".nav-sidebar");
    //     let getSideBarUl = document.querySelector(".nav-sidebar ul");
    //     let getSidebarLinks = document.querySelectorAll(".nav-sidebar a");

    //     if(toggleNavStatus=== false)
    //     {
    //        getSideBarUl.style.visibility="visible";
    //        getSideBar.style.width="272px";

    //        let arrayLength= getSidebarLinks.length;
    //        for( let i =0; i<arrayLength; i++)
    //        {
    //         getSidebarLinks[i].style.opacity="1";
    //        }
    //            toggleNavStatus= true; 
    //     }

    //     else if (toggleNavStatus === true)
    //     {
    //     //    getSideBarUl.style.visibility="visible";
    //        getSideBar.style.width="50px";

    //        let arrayLength= getSidebarLinks.length;
    //        for( let i =0; i<arrayLength; i++)
    //        {
    //         getSidebarLinks[i].style.opacity="0";
    //        }
    //        getSideBarUl.style.visibility="hidden";
    //            toggleNavStatus= false; 
    //     }
        

       }
    
      




    }



export default Home;