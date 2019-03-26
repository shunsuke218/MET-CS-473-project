function initSvgTree(nodes, links, changeCb) {
    const width = 600, height = 500;
    const nodewidth = 300, nodeheight = 200, nodeoffset = 30;
    const divwidth = 200, divheight = 150, divoffset = 54;
    // Don't forget to edit .node class of css!!

    var numNodes = 100;

    nodes.forEach(function (tmpnode) {
        tmpnode["width"] = nodewidth;
        tmpnode["height"] = nodeheight;
    });

    var numid = nodes.length;
    //var coord = recalculate();
    var depth = 4, spread = 3;

    //////////////////////////////////////////////////
    // Set up Layout
    //////////////////////////////////////////////////
    var svg = d3.select("body")
        .select("svg")
        .attr("width", document.getElementById("tree").offsetWidth)
        .attr("height", height)
        .select(".objects");

    // update tree div width on resize
    window.addEventListener("resize", (e) => {

        let newTreeDivWidth = document.getElementById("tree").offsetWidth;

        d3.select("body")
            .select("svg")
            .attr("width", newTreeDivWidth)
            .attr("height", height)

    })

    var node, link, circle, foreignobj;

    var simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody()
            .strength(100)
            .distanceMax(0)
            .distanceMin(0)
        )
        .force('link', d3.forceLink(links)
            .id(function (d) { return d.id; })
            .distance(0)
            .strength(0.1)
            //.iterations(1)
        )
        .force("xAxis", d3.forceX(width / 2).strength(0))
        .force("yAxis", d3.forceY(height / 2).strength(0))
        .force('x', d3.forceX()
            .x(function (d) { return (width / spread) * (spread + d.spread) - 350; })
            //.strength(1)
        )
        .force('y', d3.forceY()
            .y(function (d) { return (height / depth) * (depth + d.depth) - 350; })
            //.strength(1)
        )
        .force('collision', rectCollide().size(function (d) { return [d.width + 20, d.height + 20] }))
        .alphaTarget(1)
        .on('tick', ticked)

    //add drag capabilities 
    var drag_handler = d3.drag()
        .on("start", drag_start)
        .on("drag", drag_drag)
        .on("end", drag_end);

    //add zoom capabilities 
    var zoom_handler = d3.zoom()
        .on("zoom", zoom_actions);
    zoom_handler(d3.select("svg"));


    //////////////////////////////////////////////////
    // Methods
    //////////////////////////////////////////////////

    // Handy functions

    // Find xor of three variables
    function xor(a, b, c) { return (a ^ b ^ c) && !(a && b && c); }
    // Print node information on console
    function printNodes(d) {
        console.log("This node: ", d.id, d.label);
        console.log("This child: ", d.child);
        console.log("hasChild: ", d.hasChild);
        console.log("isMarried: ", d.isMarried);
        console.log("hasSibling: ", d.hasChild);
        let thislink = findlinks(d);
        let thisnode = findnodes(thislink);
        thisnode.forEach(function (e) {
            console.log("    Connected to: ", e.id, e.label);
            console.log("    hasChild: ", e.hasChild);
            console.log("    isMarried: ", e.isMarried);
            console.log("    hasSibling: ", e.hasSibling);
        })
    }
    // Return selector of links of given node d.	
    function findlinks(d) {
        return link.filter(function (e) {
            return (e.source.id === d.id) || (e.target.id === d.id);
        })
    }
    // Return selector of nodes of given link list.
    function findnodes(links) {
        return nodes.filter(function (e) {
            let nodetest = false;
            links.each(function (f) {
                if (!nodetest)
                    nodetest = (f.source.id === e.id || f.target.id === e.id);
            })
            return nodetest;
        });
    }
    // Check if array contains element.
    // Could be deleted as basic JS Array must support this feature by default
    function includes(array, elem) {
        return (array.filter(value => value == elem).length > 0);
    }

    /* not used
    // Return true if connected node is more than 2, or false
    function checkConnectionHasChild(d)	{
        return link.filter(e => (e.source.hasChild && e.source.id === d.id) || (e.target.hasChild && e.target.id === d.id)).size() > 2;
    };
    */

    // Magically calculates offset of four circles
    var halfW = (i, d) => Math.cos(i * Math.PI / 2) * (nodeoffset - d.width / 2) + d.width / 2,
        halfH = (i, d) => Math.cos((i + 1) * Math.PI / 2) * (nodeoffset - d.height / 2) + d.height / 2;

    ///-------------------------

    // Add node
    function mousedownCircleTop(d, i) { addParent(d); }
    function mousedownCircleRight(d, i) { addMarriage(d); }
    function mousedownCircleBottom(d, i) { addChild(d); }
    function mousedownCircleLeft(d, i) { addMarriage(d, -1); }

    // Add child to node
    function addChild(d) {
        // add child to node
        let child = addNode(d, d.depth + 1, d.spread);
        // # of children of this node
        let directchild = d.child || [];

        // Change tag if more than one siblings
        if (directchild.length > 0) child.hasSibling = true;

        // Record to the node that child has been added
        directchild.push(child.id);
        d.child = directchild;

        // Change tag of self/neighbors
        if ((directchild.length == 2) ||
            (directchild.length == 1 && d.connection)) {
            // Find parents from this connection node
            let thislink = findlinks(d);
            let thisnode = findnodes(thislink);
            if (directchild.length == 2) {
                // If exactly 2 children,
                // the first child's .hasSibling must be true
                thisnode.forEach(function (e) {
                    if (directchild.includes(e.id))
                        e.hasSibling = true;
                })
            } else if (d.connection) {
                // As for the connection node,
                // parents .hasChild must be true.
                thisnode.forEach(function (e) {
                    if (!directchild.includes(e.id))
                        e.hasChild = true;
                })
            }
        }
        if (!d.connection) d.hasChild = true;
        restart();
    }

    // Add spouse to node
    function addMarriage(d, s = 1) {
        // Add connection to node
        let connection = addNode(d, d.depth, d.spread + s, true);
        // Add spouse to the connection node
        let spouse = addNode(connection, connection.depth, connection.spread + s);

        // Change tag of self and spouse
        d.isMarried = true; spouse.isMarried = true;

        restart();
    }
    function addParent(d, s = 1) {
        // Add connection to node
        let connection = addNode(d, d.depth - 1, d.spread, true);
        // Add parents to the connection node
        let mom = addNode(connection, connection.depth, connection.spread + s);
        let dad = addNode(connection, connection.depth, connection.spread - s);

        // Change tag of self and spouse
        mom.isMarried = true; mom.hasChild = true;
        dad.isMarried = true; dad.hasChild = true;


        restart();
    }

    // add Node to the graph
    function addNode(d, depth, spread, connection = false) {
        // Name of the new node
        let name = connection ? "connection" : "node"
        // New node's info
        var tmpnode = {
            id: numid, label: name,
            "height": nodeheight, "width": nodewidth,
            "spread": spread, "depth": depth
        };
        // For connection node, needs connection and child fields
        if (connection) {
            tmpnode["connection"] = true;
            tmpnode["child"] = [];
        }

        // New link's info
        let tmplink = { id: numid, source: d, target: numid };

        // Push node and links to the data
        nodes.push(tmpnode); links.push(tmplink);

        // Increment counter
        numid++;

        // Recalculate coordinate
        recalculate();

        // Return added node
        return tmpnode;
    }


    function removeNode(d) {
        // For the node to be deleted, it must
        // (1.) Link must be 1
        // (2-a.) one of isMarried, hasChild, or hasSibling must be true. 
        // (2-b.) none of isMarried, hasChild, or hasSibling is true. (child of couple)

        // Find the link
        let connectedlink = findlinks(d);
        if ((connectedlink.size() == 1 && xor(d.hasChild, d.isMarried, d.hasSibling)) ||
            (connectedlink.size() == 1 && (!d.hasChild && !d.isMarried && !d.hasSibling)) ||
            (d.connection)
        ) {
            // The node can be deleted
            // Find the node that is connected
            let connectednode = findnodes(connectedlink);

            if (d.hasChild) {
                console.log("hasChild");
                removeHasChild(d);
            } else if (d.isMarried) {
                console.log("isMarried");
                removeIsMarried(d, connectednode);
            } else if (d.hasSibling) {
                console.log("hasSibling");
                removeHasSibling(d, connectednode);
            } else {
                console.log("no child, not married, no sibling!");
                removeHasSibling(d, connectednode);
            }
        } else {
            // The node cannot be deleted
            console.log("The node cannot be deleted!");
        }
        recalculate();
        restart();
    }

    function removeHasChild(d) {
        // Has child but nothing else
        // Remove this node and link and done
        links = removeLinks(links, d);
        nodes = removeNodes(nodes, d);
    }
    function removeIsMarried(d, connectednode) {
        // Has spouse but nothing else
        // Remove this node and link
        links = removeLinks(links, d);
        nodes = removeNodes(nodes, d);

        // Find nodes of connection node
        let connection, connectionlink, connectionnode;
        connectednode.forEach(function (nd) {
            connection = nd.connection ? nd : connection;
        })
        connectionlink = findlinks(connection);
        connectionnode = findnodes(connectionlink);
        // Set spouse.isMarried to false
        connectionnode.forEach(function (e) {
            e.isMarried = false;
        })
        // Remove connection node
        removeNode(connection);
    }

    function removeHasSibling(d, connectednode) {
        // Has sibling(s) but nothing else
        // Remove this node and link
        let thisid = d.id;
        links = removeLinks(links, d);
        nodes = removeNodes(nodes, d);

        // Find nodes of connection node
        let connection, connectionlink, connectionnode;
        connectednode.forEach(function (nd) {
            // This allows direct child from a node
            // connection = nd.connection ? nd : connection;
            connection = nd;
        })
        printNodes(connection);
        connectionlink = findlinks(connection);
        connectionnode = findnodes(connectionlink);

        // Remove d from connectednode's children list
        let siblings = false;
        connectednode.forEach(function (nd) {
            if (!siblings) siblings = nd.child;
        })
        let index = siblings.indexOf(thisid);
        console.log(siblings)
        if (index !== -1) siblings.splice(index, 1);
        console.log(siblings)
        connectednode.child = siblings

        if (siblings.length == 1) {
            // If there is no more child left,
            // change parents' hasChild.false
            console.log("one more child!");
            connectionnode.forEach(function (e) {
                if (e.id === siblings.length[0])
                    e.hasSibling = false;
            })
        } else if (siblings.length == 0) {
            // If there is one more child left,
            // change sibling's hasSibling.false
            console.log("no more child!");
            connectionnode.forEach(function (e) {
                e.hasChild = false;
            })
        };
    }

    function removeNodes(array, elem) {
        if (array instanceof Array)
            return array.filter(el => (el.id !== elem.id));
        return array;
    };
    function removeLinks(array, elem) {
        return array.filter(el => (el.source.id != elem.id) && (el.target.id != elem.id));
    };
    ///-------------------------
    // Mouse over action
    function mouseoverNode(d, i) {
        simulation.alpha(0.1);

        let connectedlink = link.filter(function (e) {
            return (e.source.id === d.id) || (e.target.id === d.id);
        });

        // Expand foreignObject
        let fo = d3.select(this).select("foreignObject")
            .transition().duration(250)
            // width
            .attrTween("width", function (d) {
                let i = d3.interpolate(d.width, nodewidth * 1);
                return function (t) {
                    d.width = i(t);
                    return i(t);
                }
            })
            // height
            .attrTween("height", function (d) {
                let i = d3.interpolate(d.height, nodeheight * 2);
                return function (t) {
                    d.height = i(t);
                    // Recalculate collision box
                    simulation.force('collision', rectCollide()
                        .size(function (d) { return [d.width + 10, d.height + 10] }));
                    return i(t);
                }
            })
        // Expand HTML wrapper (div)
        let div = fo.select("div")
            .style("width", divwidth * 1 + "px")
            .style("height", divheight * 2 + "px")

        let desc = div.select("div")
            .style("display", "block")
            .style("opacity", 1);

        // Show delete circle
        if (connectedlink.size() == 1) {
            d3.select(this).select(".deletecircle")
                .style("display", "block")
                .transition().duration(250)
                .attr("r", 15)
                .style("opacity", 1);
        }

        // Show add node circle
        let circles = d3.select(this).select(".addnode-circle").selectAll("circle")
            .style("display", "block")
            .transition().duration(250)
            .attr("r", 15)
            .style("opacity", 1);
    }
    // Mouse out action
    function mouseoutNode(d, i) {
        simulation.alpha(0.1);

        // Shrink foreignObject size back to normal
        let fo = d3.select(this).select("foreignObject")
            .transition().duration(250)
            // width
            .attrTween("width", function (d) {
                let i = d3.interpolate(d.width, nodewidth);
                return function (t) {
                    d.width = i(t);
                    return i(t);
                };
            })
            // height
            .attrTween("height", function (d) {
                let i = d3.interpolate(d.height, nodeheight);
                return function (t) {
                    d.height = i(t);
                    // Recalculate collision box
                    simulation.force('collision', rectCollide()
                        .size(function (d) { return [d.width + 10, d.height + 10] }))
                    return i(t);
                };
            });
        // Shring HTML wrapper (div)
        let div = fo.select("div")
            .style("width", divwidth + "px")
            .style("height", divheight - divoffset + "px")

        let desc = div.select("div")
            .style("display", "none")
            .style("opacity", 0);

        // Diappear delete circle
        let circles = d3.select(this).select(".deletecircle")
            .transition().duration(250)
            .attr("r", 0)
            .style("opacity", 0)
            .on("end", function () {
                d3.select(this).style("display", "none")
            });
        ;

        // Disappear add node circle
        circles = d3.select(this).select(".addnode-circle").selectAll("circle")
            .transition().duration(250)
            .attr("r", 0)
            .style("opacity", 0)
            .on("end", function () {
                d3.select(this).style("display", "none")
            });
        ;
    }

    // Drag functions 
    function drag_start(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
    }
    function drag_drag(d) {
        d.fx = d3.event.x; d.fy = d3.event.y;
    }
    function drag_end(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
    }

    // Zoom functions 
    function zoom_actions() { d3.select(".objects").attr("transform", d3.event.transform) }

    // Recalculate coordinate
    function recalculate() {
        let spread_min = Math.min.apply(Math, nodes.map(function (o) { return o.spread })),
            spread_max = Math.max.apply(Math, nodes.map(function (o) { return o.spread })),
            depth_min = Math.min.apply(Math, nodes.map(function (o) { return o.depth })),
            depth_max = Math.max.apply(Math, nodes.map(function (o) { return o.depth }));
        let spread = Math.abs(spread_max - spread_min),
            depth = Math.abs(depth_max - depth_min);

        simulation
            .force('x', d3.forceX()
                .x(function (d) { return (width / spread) * (spread + d.spread) - 350; })
                .strength(0.5)
            )
            .force('y', d3.forceY()
                .y(function (d) { return (height / depth) * (depth + d.depth) - 350; })
                .strength(1)
            )

        return [spread, depth];
    }


    //////////////////////////////////////////////////
    // Special Methods
    //////////////////////////////////////////////////

    // Restart -- Add/Remove nodes and add to html
    function restart() {
        // Link objects
        link = svg.select(".link").attr("stroke-width", 1.5).selectAll('line')
            .data(links, function (d) { return d.target.id; });
        //    Removed links
        var linkExit = link.exit().remove();
        //    Added links
        var linkEnter = link.enter()
            .append("line")
        link = linkEnter.merge(link);

        // Node objects
        node = svg.select(".node").selectAll("g:not(.addnode-circle)")
            .data(nodes, function (d) { return d.id; });

        //  Remove deleted nodes
        var nodeExit = node.exit().transition().style("opacity", 0).remove();

        //  Add node
        var nodeEnter = node.enter()
            .append("g")
            .on("mouseover", mouseoverNode)
            .on("mouseout", mouseoutNode)
            .attr("class", function (d) { return (d.connection) ? "node-connection" : "node"; });

        nodeEnter
            .each(function (d) {
                // console.log(this);
                let group = d3.select(this);
                // console.log(group);
                // add add-node circle only for connection-node
                if (group.classed("node-connection")) {
                    group
                        .append("circle")
                        .attr("class", "addsiblingscircle")
                        .attr("r", 20).attr("fill", "orange")
                        .on("mousedown", addChild)
                        .call(drag_handler)
                    return;
                }

                // Add object to a regular node
                group
                    // ForeignObject (the HTML on top of svg)
                    .append("foreignObject")
                    .call(drag_handler)
                    .attr("id", function (d) { return "node-" + d.id; })
                    .attr("width", nodewidth + "px")
                    .attr("height", nodeheight + divoffset + "px")
                    .attr("class", "node")
                    // HTML content wrapper (will expand on mouse hover)
                    .append("xhtml:div")
                    .style("width", divwidth + "px")
                    .style("height", divheight - divoffset + "px")
                    .attr("class", "node-div")
                    .each(function (d) {
                        let div = d3.select(this);
                        div
                            // img
                            .append("xhtml:img")
                            .attr("class", "profilepic")
                            .attr("src", "../../images/profile.png")
                            .attr("alt", "profile pic")
                        div
                            // h3 (name)
                            .append("xhtml:h3")
                            .text(function (d) { return d.label; })
                        //div
                        //    // h2 (depth, spread)
                        //	.append("xhtml:h4")
                        //	.text(function(d){ return d.spread + ", " + d.depth; })
                        div
                            // h2 (dob)
                            .append("xhtml:h4")
                            .text(function (d) { return d.dob; })
                        div
                            .append("xhtml:div")
                            .attr("class", "description")
                            .text(function (d) { return d.desc; })
                            .attr("display", "none").style("opacity", 0)
                    })

                // Four circles on sides
                group
                    .append("g")
                    .classed("addnode-circle", true)
                    .each(function (d) {
                        // console.log(this);
                        let circlegroup = d3.select(this);
                        // console.log(circlegroup);
                        for (let i = 0; i < 4; i++)
                            circlegroup
                                .append("circle")
                                .attr("class", "node-circle-" + i)
                                .attr("r", 20).attr("fill", "pink")
                                .style("display", "none").style("opacity", 0);
                        // Apply click methods
                        circlegroup.select(".node-circle-0")
                            .on("mousedown", mousedownCircleLeft);
                        circlegroup.select(".node-circle-1")
                            .on("mousedown", mousedownCircleBottom);
                        circlegroup.select(".node-circle-2")
                            .on("mousedown", mousedownCircleRight);
                        circlegroup.select(".node-circle-3")
                            .on("mousedown", mousedownCircleTop);
                    })

                // Delete circle
                group
                    .append("circle")
                    .attr("class", "deletecircle")
                    .attr("r", 20).attr("fill", "red")
                    .style("display", "none").style("opacity", 0)
                    .on("mousedown", removeNode)

            })
        node = nodeEnter.merge(node);

        // Add nodes & links in layout
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        recalculate();
        simulation.alpha(1).restart();

        changeCb(nodes, links);
    }


    // Tick function -- executed whenever there is an action
    function ticked() {
        // foreignObject
        node.select("foreignObject")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
        for (var i = 0; i < 4; i++) {
            // four circles on sides
            node.select(".node-circle-" + i)
                .attr("cx", function (d) { return d.x + halfW(i, d); })
                .attr("cy", function (d) { return d.y + halfH(i, d) })
        }
        // red circle to delete node
        node.select(".deletecircle")
            .attr("cx", function (d) { return d.x + d.width - divoffset; })
            .attr("cy", function (d) { return d.y + divoffset })
        // siblings circle on connection-node
        node.select(".addsiblingscircle")
            .attr("cx", function (d) { return d.x + d.width / 2; })
            .attr("cy", function (d) { return d.y + d.height / 2 })

        // lines
        link
            .attr('x1', function (d) { return d.source.x + d.source.width / 2 })
            .attr('y1', function (d) { return d.source.y + d.source.height / 2 })
            .attr('x2', function (d) { return d.target.x + d.target.width / 2 })
            .attr('y2', function (d) { return d.target.y + d.target.height / 2 })
            ;
    }

    restart(); // I moved restart here
}

// export { initSvgTree };