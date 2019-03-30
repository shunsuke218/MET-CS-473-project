var nodes = [
    { id: 0, label: "My name", spread: 0, depth: 0, dob: "1999/1/1", isMarried: false, hasChild: false, desc: "this is testing script" },

]

var links = [
]


initSvgTree(nodes, links, (newNodes, newLinks) => {
    // console.log('changed');

    // console.log(newNodes);
    // console.log(newLinks);
});
