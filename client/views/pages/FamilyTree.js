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
        initSvgTree();
    }
}

export default FamilyTree;