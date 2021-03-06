import { initSvgTree } from './d3Utils.js';

let FamilyTree = {
    render: async () => {
        let view =  /*html*/`
        <div id="family-tree">
            <h1>Demo Family Tree here</h1>
            <svg width="700" height="900">
                <g class="objects">
                    <g class="link"></g>
                    <g class="node"></g>
                </g>
            </svg>
        </div>
        `
        return view
    },

    after_render: async () => {

        var nodes = [
            { id: 0, label: "Shun", spread: 0, depth: 0, dob: "1999/1/1", isMarried: true, hasChild: true, desc: "this is testing script" },
            { id: 1, label: "Wife", spread: 2, depth: 0, dob: "1999/1/1", isMarried: true, hasChild: true },
            { id: 2, label: "MeWife", spread: 1, depth: 0, connection: true, child: [3, 4] },
            { id: 3, label: "Son", spread: 1, depth: 1, dob: "2019/1/1", hasSibling: true },
            { id: 4, label: "Daughter", spread: 1, depth: 1, dob: "2019/1/1", hasSibling: true },
            { id: 5, label: "Dad", spread: -1, depth: -1, dob: "1969/1/1", hasChild: true, isMarried: true },
            { id: 6, label: "Mom", spread: 1, depth: -1, hasChild: true, isMarried: true },
            { id: 7, label: "DadMom", spread: 0, depth: -1, connection: true, hasChild: true, child: [0] },
            { id: 8, label: "Grandpa", spread: -1, depth: -2, dob: "1939/1/1", hasChild: true }
        ]

        var links = [
            { id: 0, source: 0, target: 2 },
            { id: 1, source: 1, target: 2 },
            { id: 2, source: 2, target: 3 },
            { id: 3, source: 2, target: 4 },
            { id: 4, source: 5, target: 7 },
            { id: 5, source: 6, target: 7 },
            { id: 6, source: 7, target: 0 },
            { id: 7, source: 8, target: 5 },
        ]
    

        initSvgTree(nodes, links, (newNodes, newLinks) => {
            console.log('changed');

            console.log(newNodes);
            console.log(newLinks);
        });

        
    }
}

export default FamilyTree;