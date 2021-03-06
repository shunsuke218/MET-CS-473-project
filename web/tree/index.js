let isAuthed = isAuthenticated();

// if user not logged, redirect to home page
if (!isAuthed) { // if not logged in
    // redirect user back to home page
    window.location.href = "/"
}

// code for local testing

// var nodes = [
//     { id: 0, label: "Shun", spread: 0, depth: 0, dob: "1999/1/1", isMarried: true, hasChild: true, desc: "this is testing script" },
//     { id: 1, label: "Wife", spread: 2, depth: 0, dob: "1999/1/1", isMarried: true, hasChild: true },
//     { id: 2, label: "MeWife", spread: 1, depth: 0, connection: true, child: [3, 4] },
//     { id: 3, label: "Son", spread: 1, depth: 1, dob: "2019/1/1", hasSibling: true },
//     { id: 4, label: "Daughter", spread: 1, depth: 1, dob: "2019/1/1", hasSibling: true },
//     { id: 5, label: "Dad", spread: -1, depth: -1, dob: "1969/1/1", hasChild: true, isMarried: true },
//     { id: 6, label: "Mom", spread: 1, depth: -1, hasChild: true, isMarried: true },
//     { id: 7, label: "DadMom", spread: 0, depth: -1, connection: true, hasChild: true, child: [0] },
//     { id: 8, label: "Grandpa", spread: -1, depth: -2, dob: "1939/1/1", hasChild: true }
// ]

// var links = [
//     { id: 0, source: 0, target: 2 },
//     { id: 1, source: 1, target: 2 },
//     { id: 2, source: 2, target: 3 },
//     { id: 3, source: 2, target: 4 },
//     { id: 4, source: 5, target: 7 },
//     { id: 5, source: 6, target: 7 },
//     { id: 6, source: 7, target: 0 },
//     { id: 7, source: 8, target: 5 },
// ]


// initSvgTree(nodes, links, (newNodes, newLinks) => {
//     console.log('changed');

//     console.log(newNodes);
//     console.log(newLinks);
// });

// code below for getting and putting data to db

async function getTreeFromApi() {
    let json = await getJSON('/api/tree/');
    return json.tree;
}

(async function () {
    let tree = await getTreeFromApi();
    let { nodes, links } = tree;

    initSvgTree(nodes, links, async (newNodes, newLinks) => {

        console.log(newNodes);
        console.log(newLinks);

        // convert new links to the following format:
        //{ source: 0, target: 2 },
        let normalizedLinks = newLinks.map((link) => {
            let id = link.id;
            let source = link.source.id;
            let target = link.target.id;
            return { id, source, target };
        })

        let tree = {
            nodes: newNodes,
            links: normalizedLinks
        }

        await postJSON('/api/tree/', {tree});

    });

})()

