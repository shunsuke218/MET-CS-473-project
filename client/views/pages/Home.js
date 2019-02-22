let Home = {
    render: async () => {
        let view =  /*html*/`
            <div id="home">
                <h1>Home</h1>
                <p>Welcome to family tree application!</p>
                <a href="/#/family-tree">View a demo tree</a>
            </div>
        
       `
        return view
    }, after_render: async () => {

    }

}

export default Home;