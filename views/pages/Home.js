let Home = {
   render : async () => {
       let view =  /*html*/`
           <section class="section">
               <h1>Home</h1>
               <p>Welcome to family tree application!</p>
               <a href="/#/family-tree">View a demo tree</a>
           </section>
       `
       return view
   }
   , after_render: async () => {
   }

}

export default Home;