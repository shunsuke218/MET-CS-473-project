# The Family Tree Graph
## MET-CS-473-project

This is a web application which creates a user interactive web application that replicates a family tree. Users will be able to freely add/remove individual family members with desired information (i.e. name, gender, description, and photo). The web application will reformat the tree according to the change in number of family members. The tree information can be exported in a picture format (PNG). The web application will also be available to the public.


## Getting Started

To begin, install git if you have not done doing so:
https://git-scm.com/downloads

Install Node.js:
https://nodejs.org/en/


clone this repository using Terminal or Command Prompt by
```
git clone https://github.com/shunsuke218/MET-CS-473-project/
```

Now the repository should be available in your home directory. 

You need to create an .env file in your project, and store the MONGO_URI and DB variable in it.

Now run,
```
cd MET-CS-473-project
npm i # this is to install the dependencies
# then, create an .env file in your project, for the file content, ask Steve
node server # it will run the server
```



Go to localhost:5005 in your browser. You should be able to see the website in action.

## Staging server

The staging server is located at https://cs473testing.stevemu.com

## Branching

dev is the main development branch. Code in this branch are deployed to the staging server.

master is the production branch. Code in this branch are deployed to production (don't exist yet)

## Development workflow

Create your own branch when working on a feature. When you done, create a pull request to be merged into dev branch.

Steve will handle the merge.

After the code is merged into dev, you can click "Finish" in Pivotal tracker. Then, after the code is deployed to staging server, you can click "Deliver".

Our tester Majda will test the feature after it is "delivered". If there are errors, she will "reject". Or "accept" if there are no errors.

## Style guide

* Use web folder, which contains the updated architecture
* Put reusable js modules in js folder
* Each page should has its own js, css and index.html. Use the tree folder for an example.
* Each html page should contains imports for common modules that should be on every page, and its own js file. Use tree/index.html and as example.
* Common css that applies to every pages should be written in styles.css (eg. home.css, tree.css)

## Built With

* [D3.js](https://d3.js.org/) - JavaScript library to visualize node/link data
* [Auth0](auth0.com) - 3rd party authentication service

## Versioning

* Version 
- No version available at this time.

For the versions available, see the [tags on this repository](https://github.com/shunsuke218/MET-CS-473-project/tags). 

## Authors

* **Shunsuke Haga** - *Front End* - [Repo](https://github.com/shunsuke218)
* **[Steve Mu](https://github.com/stevemu)**  - *Architector* 

## License

This project is licensed under the BSD License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

etc.

## database config:

