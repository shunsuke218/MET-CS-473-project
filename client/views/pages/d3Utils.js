let initSvgTree = (nodes, links, changeCb) => {
    var width, height;
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
	var wrapperDiv = document.getElementById("wrapper");

	// Monitor window size changes
	d3.select(window).on('resize', resize);

	function resize() {
		// update width
		width = parseInt(d3.select(svgFamilyTree).style('width'), 10);
		height = parseInt(d3.select(svgFamilyTree).style('height'), 10);
	}

	// Initialize canvas
    var svg = d3.select(wrapperDiv)
		.classed("svg-container", true)
	// Add svg
        .append("svg")
		.attr("id", "svg-family-tree")
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 600 400")
	    //class to make it responsive
		.classed("svg-content-responsive", true)
	// Add object group
		.append("g").attr("class","objects")
		.attr("id", "tree")
	// Add link group
	svg.append("g").attr("class", "link");
	// Add node group
	svg.append("g").attr("class", "node");

	var svgFamilyTree = document.getElementById("svg-family-tree");
	resize();
    svg = d3.select("body")
        .select("svg")
        //.attr("width", width).attr("height", height)
        .select(".objects");


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
            .x(function (d) { return (width / spread) * (spread + d.spread) - width; })
            //.strength(1)
        )
        .force('y', d3.forceY()
            .y(function (d) { return (height / depth) * (depth + d.depth) - height; })
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

	// Save function
	
	d3.select('#saveButton').on('click', function(){
		//saveSvgAsPng(document.getElementById("tree"), "diagram.png", {scale: 5});
		saveSvgAsPng(document.getElementById("svg-family-tree"), "diagram.png", {scale: 5});
	});


    //////////////////////////////////////////////////
    // Methods
    //////////////////////////////////////////////////

    // Handy functions
	function removeArr(arr, elem) {
		return arr.filter(function(e){
			return e !== elem;
		})
	}
	


    // Find xor of three variables
    function xor(a, b, c) { return (a ^ b ^ c) && !(a && b && c); }
    // Print node information on console
    function printNodes(d) {
        console.log("This node: ", d.id, d.label);
        console.log("Child: ", d.child);
        console.log("Married: ", d.married);
        console.log("Sibling: ", d.sibling);
        console.log("Parent: ", d.parent);
		console.log("Spread: ", d.spread);
		console.log("Depth: ", d.depth);
        let thislink = findlinks(d);
        let thisnode = findnodes(thislink);
        thisnode.forEach(function (e) {
            console.log("    Connected to: ", e.id, e.label);
            console.log("    child: ", e.child);
            console.log("    married: ", e.married);
            console.log("    sibling: ", e.sibling);
            console.log("    parent: ", e.parent);
			console.log("    Spread: ", d.spread);
			console.log("    Depth: ", d.depth);
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

		// Set child information
		child.married = [];
		child.child = [];
		child.sibling = d.child.slice();
		child.parent = [d.id];

		// Edit children's sibling
		nodes.forEach(function(e){
			if (!!~directchild.indexOf(e.id)){
				let sibling = e.sibling||[];
				sibling.push(child.id);
				e.sibling = sibling;
			}
		})

        // Edit this child
        directchild.push(child.id);
        d.child = directchild;

        restart();
    }

    // Add spouse to node
    function addMarriage(d, s = 1) {
        // Add connection to node
        let connection = addNode(d, d.depth, d.spread + s, true);
        // Add spouse to the connection node
        let spouse = addNode(connection, connection.depth, connection.spread + s);

        // Change tag of self and spouse
		d.married = d.married||[];
		d.married.push(spouse.id);
		d.married.push(connection.id); //should I add connection in married arr?
		
		spouse.married = spouse.married||[];
		spouse.married.push(d.id);
		spouse.married.push(connection.id); //should I add connection in married arr?
		
        restart();
    }
    function addParent(d, s = 1) {
        // Add connection to node
        let connection = addNode(d, d.depth - 1, d.spread, true);
        // Add parents to the connection node
        let mom = addNode(connection, connection.depth, connection.spread + s);
        let dad = addNode(connection, connection.depth, connection.spread - s);

        // Change tag of self and spouse
		mom.married = [connection.id, dad.id]; //should I add connection in married arr?
		dad.married = [connection.id, mom.id]; //should I add connection in married arr?

		mom.child = [d.id];
		dad.child = [d.id];
		d.parent = [connection.id];
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
            "spread": spread, "depth": depth,
			"child":[], "married":[], "sibling":[], "parent":[]
        };
        // For connection node, needs connection
        if (connection) tmpnode["connection"] = true;

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
		// (3.) Me (the origin) cannot be deleted

        // Find the link
        let connectedlink = findlinks(d);
		let hasChild = (d.child == null) ? false : !!(d.child.length);
		let isMarried = (d.married == null) ? false : !!(d.married.length);
		let hasSibling = (d.sibling == null) ? false : !!(d.sibling.length);

        if ((connectedlink.size() == 1 && xor(hasChild, isMarried, hasSibling)) ||
            (connectedlink.size() == 1 && (!hasChild && !isMarried && !hasSibling)) ||
            (d.connection)
        ) {
            // The node can be deleted
            // Find the node that is connected
            let connectednode = findnodes(connectedlink);
			console.log("Deleting: ",d.label);

			console.log("hasChild: "  +  hasChild);
			console.log("isMarried: " +  isMarried);
			console.log("hasSibling: " +  hasSibling);
            if (hasChild) {
                console.log("hasChild");
                removeHasChild(d);
            } else if (isMarried) {
                console.log("isMarried");
                removeIsMarried(d, connectednode);
            } else if (hasSibling) {
                console.log("hasSibling");
                removeHasSibling(d, connectednode);
            } else {
                console.log("no child, not married, no sibling!");
                removeHasSibling(d);
            }
        } else {
            // The node cannot be deleted
            console.log("The node cannot be deleted!");
        }
		console.log("removed.");
        recalculate();
        restart();
    }

    function removeHasChild(d) {
        // Has child but nothing else
        // Remove this node and link and done
        links = removeLinks(links, d);
        nodes = removeNodes(nodes, d);

		// Remove this from child
		let thisid = d.id;
		let thischild = d.child;

		// Filter child
		let child = nodes.filter(function (e){
			return (!!~thischild.indexOf(e.id) );
		});

		let newparent = child.parent||[];
		child.parent = removeArr(newparent, thisid);
		
    }
    function removeIsMarried(d) {
        // Has spouse but nothing else

		// Filter Married
		let thismarried = d.married||[];
		let thisid = d.id;
		let married = nodes.filter(function (e){
			return (!!~thismarried.indexOf(e.id));
		})

		// Check if there is a child for this node
		let flag = false;
		married.forEach(function (e){
			if (!flag && e.connection && e.child.length > 0)
				flag = true;
		})

		if (flag) return;

		
        // Remove this node and link
        links = removeLinks(links, d);
        nodes = removeNodes(nodes, d);

		// Remove this from married connection
		let connection = null;
		married.forEach(function (e){
			console.log("    ", e.id, ": ", e.label);
			let newmarried = e.married||[];
			newmarried = removeArr(newmarried, thisid);
			thismarried.forEach(function(f){
				newmarried = removeArr(newmarried, f);
			})
			//e.married = newmarried.filter(x => !thismarried.includes(x));
			console.log("    married: ", e.married);
			e.married = newmarried;
		})
		married.forEach(function (e){
			if (e.connection) removeNode(e);
		})

    }

	function removeAloneNode(d) {
		links = removeLinks(links, d);
        nodes = removeNodes(nodes, d);

	}
	
    function removeHasSibling(d, connectednode) {
        // Has sibling(s) but nothing else

        // Remove this node and link
        links = removeLinks(links, d);
        nodes = removeNodes(nodes, d);

		// Remove this from sibling and parent(s)
		let thisid = d.id;
		let thissibling = d.sibling||[];
		let thisparent = d.parent||[];

		// Filter Sibling
		let sibling = nodes.filter(function (e){
			return (!!~thissibling.indexOf(e.id) );
		});

		// Removing this from sibling's sibling list
		sibling.forEach(function (e){
			let newsibling = e.sibling||[];
			e.sibling = removeArr(newsibling, thisid);
		})

		// Filter connection
		let parent = nodes.filter(function (e){
			return (!!~thisparent.indexOf(e.id));
		})

		let married = null;
		// Remove this from connection(s)
		parent.forEach(function (e){
			let newchild = e.child||[];
			married = e.married||[];
			e.child = removeArr(newchild, thisid);
		})

		// Filter connection's spouses
		parent = nodes.filter(function (e){
			return (!!~married.indexOf(e.id));
		})
		// Remove this from parent(s)
		parent.forEach(function(e){
			let newchild = e.child||[];
			e.child = removeArr(newchild, thisid);
		})
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


		let thismarried = d.married||[];
		let thischild = d.child||[];
		let thissibling = d.sibling||[];
		let thisparent = d.parent||[];

		let haschild = false;
		if (thismarried.length > 0){
			let married = nodes.filter(function (e){
				return (!!~thismarried.indexOf(e.id) && e.connection);
			})
			married.forEach(function (e){
				let connchild = e.child||[];
				if (!haschild && connchild.length > 0)
					haschild = true;
			})
		}


        // Show delete circle
        if (thismarried.length + thischild.length + thissibling.length + thisparent.length <= 2
			&& thismarried.length <= 2
			&& !haschild ) {
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
		if (links.length < 3) return;
        let spread_min = Math.min.apply(Math, nodes.map(function (o) { return o.spread })),
            spread_max = Math.max.apply(Math, nodes.map(function (o) { return o.spread })),
            depth_min = Math.min.apply(Math, nodes.map(function (o) { return o.depth })),
            depth_max = Math.max.apply(Math, nodes.map(function (o) { return o.depth }));
        let spread = Math.abs(spread_max - spread_min),
            depth = Math.abs(depth_max - depth_min);

        simulation
            .force('x', d3.forceX()
                .x(function (d) { return (width / spread) * (spread + d.spread) - width ; })
                .strength(1)
            )
            .force('y', d3.forceY()
                .y(function (d) { return (height / depth) * (depth + d.depth) - height ; })
                .strength(0.5)
            )
        return [spread, depth];
    }


    //////////////////////////////////////////////////
    // Special Methods
    //////////////////////////////////////////////////

    // Restart -- Add/Remove nodes and add to html
    function restart() {
        // Link objects
        link = svg.select(".link").attr("stroke-width", 6).selectAll('line')
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
					.on("mousedown", function (d) { printNodes(d);})
                    .call(drag_handler)
                    .attr("id", function (d) { return "node-" + d.id; })
                    .attr("width", nodewidth + "px")
                    .attr("height", nodeheight + divoffset + "px")
                    .attr("class", "node")
                    // HTML content wrapper (will expand on mouse hover)
                    .append("xhtml:div")
					.attr("xmlns", "http://www.w3.org/1999/xhtml")
                    .style("width", divwidth + "px")
                    .style("height", divheight - divoffset + "px")
                    .attr("class", "node-div")

                    .each(function (d) {
                        let div = d3.select(this);
                        div
                            // img
                            .append("xhtml:img")
							.attr("xmlns", "http://www.w3.org/1999/xhtml")
                            .attr("class", "profilepic")
                            //.attr("src", "./views/pages/image/profile.png")
                            .attr("src", "data:image/png;base64,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")
                            .attr("alt", "profile pic")
                        div
                            // h3 (name)
                            .append("xhtml:h3")
							.attr("xmlns", "http://www.w3.org/1999/xhtml")
                            .text(function (d) { return d.label; })
                        //div
                        //    // h2 (depth, spread)
                        //	.append("xhtml:h4")
                        //	.text(function(d){ return d.spread + ", " + d.depth; })
                        div
                            // h2 (dob)
                            .append("xhtml:h4")
							.attr("xmlns", "http://www.w3.org/1999/xhtml")
                            .text(function (d) { return d.dob; })
                        div
                            .append("xhtml:div")
							.attr("xmlns", "http://www.w3.org/1999/xhtml")
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

export { initSvgTree };
