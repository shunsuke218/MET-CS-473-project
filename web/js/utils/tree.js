function initSvgTree(nodes, links, changeCb) {
    var width, height;
    const nodewidth = 300, nodeheight = 300, nodeoffset = 20;
    const nodewidthexp = 400, nodeheightexp = 500, divoffset = 54;


    nodes.forEach(function (tmpnode) {
        tmpnode["width"] = nodewidth;
        tmpnode["height"] = nodeheight;
    });

    var numNodes = 100;
    var numid = nodes.length;
    var depth = 1, spread = 1;

    //////////////////////////////////////////////////
    // Set up Layout
    //////////////////////////////////////////////////
	var wrapperDiv = document.getElementById("wrapper");


	// Add export button
	d3.select("#page_container")
	    // div element
		.insert("div", "#family-tree")
		.attr("id", "button")
		.attr("class", "exportbutton")
		.on("mousedown", function(){
			saveSvgAsPng(document.getElementById("svg-family-tree"), "diagram.png", {scale: 5});
		})
        // img element
	    .append("img")
        .attr("src", "../../images/download.svg")
        .attr("alt", "profile pic")
	;

	// Initialize canvas
    var svg = d3.select(wrapperDiv)
		.classed("svg-container", true)
	     // Add svg
        .append("svg")
		.attr("id", "svg-family-tree")
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 600 400")
		.classed("svg-content-responsive", true)
	     // Add object group
		.append("g")
		.attr("class","objects")
		.attr("id", "tree")
	// Add link group
	svg.append("g").attr("class", "link");
	// Add node group
	svg.append("g").attr("class", "node");

	// Monitor window size
	d3.select(window).on('resize', resize);
	var svgFamilyTree = document.getElementById("svg-family-tree");
	function resize() {
		// update width, height
		width = parseInt(d3.select(svgFamilyTree).style('width'), 10);
		height = parseInt(d3.select(svgFamilyTree).style('height'), 10);
	}

	resize();

    //////////////////////////////////////////////////
    // Set up Tree
    //////////////////////////////////////////////////
	
    var node, link, circle, foreignobj;

    var simulation = d3.forceSimulation(nodes)
     	// Charge - How strongly nodes repels
        .force('charge', d3.forceManyBody()
            .strength(100)
            .distanceMax(0)
            .distanceMin(0)
        )
     	// Link - The lines between nodes
        .force('link', d3.forceLink(links)
            .id(function (d) { return d.id; })
            .distance(0)
            .strength(0.1)
            .iterations(1)
        )
     	// xAxis - x Coordinate of nodes (spread)
        .force("xAxis", d3.forceX(width / 2).strength(0))
        .force('x', d3.forceX()
            .x(function (d) { return (width / spread) * (spread + d.spread) - width; })
            .strength(1)
        )
     	// yAxis - y Coordinate of nodes (depth)
        .force("yAxis", d3.forceY(height / 2).strength(0))
        .force('y', d3.forceY()
            .y(function (d) { return (height / depth) * (depth + d.depth) - height; })
            .strength(1)
        )
        // Collision - Set up the collision box for nodes
        .force('collision', rectCollide().size(function (d) { return [d.width + 20, d.height + 20] }))
        .alphaTarget(1)
        // Tick - Set up the tick function
        .on('tick', ticked)

    // Add drag capabilities 
    var drag_handler = d3.drag()
        .on("start", drag_start)
        .on("drag", drag_drag)
        .on("end", drag_end);

    // Add zoom capabilities 
    var zoom_handler = d3.zoom()
        .on("zoom", zoom_actions)
    zoom_handler(d3.select("svg"));
	d3.select("svg").on("dblclick.zoom", null);

	// Export to PNG function
	d3.select('#saveButton').on('click', function(){
		saveSvgAsPng(document.getElementById("svg-family-tree"), "diagram.png", {scale: 5});
	});


    //////////////////////////////////////////////////
    // Methods
    //////////////////////////////////////////////////

    // Handy functions

	// Remove element from array
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
		console.log("---");
        console.log("Child: ", d.child);
        console.log("Married: ", d.married);
        console.log("Sibling: ", d.sibling);
        console.log("Parent: ", d.parent);
		console.log("---");
		console.log("Spread: ", d.spread);
		console.log("Depth: ", d.depth);
		console.log("---");
		console.log("Dob: ", d.dob);
		console.log("Description: ", d.desc);
        let thislink = findlinks(d);
        let thisnode = findnodes(thislink);
        thisnode.forEach(function (e) {
            console.log("    Connected to: ", e.id, e.label);
			console.log("    ---");
            console.log("    child: ", e.child);
            console.log("    married: ", e.married);
            console.log("    sibling: ", e.sibling);
            console.log("    parent: ", e.parent);
			console.log("    ---");
			console.log("    Spread: ", e.spread);
			console.log("    Depth: ", e.depth);
			console.log("    ---");
			console.log("    Dob: ", e.dob);
			console.log("    Description: ", e.desc);
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


    // Magically calculates offset of four circles
    var halfW = (i, d) => Math.cos(i * Math.PI / 2) * (nodeoffset - d.width / 2) + d.width / 2,
        halfH = (i, d) => Math.cos((i + 1) * Math.PI / 2) * (nodeoffset - d.height / 2) + d.height / 2;

    ///-------------------------

    // Add node
    // add Node to the graph
    function addNode(d, depth, spread, connection = false) {
		// Cannot add more than numNodes
		if (numid > numNodes) return;

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
        if (connection)
			tmpnode["connection"] = true;
		else {
			tmpnode["dob"] = "2000/01/01";
			tmpnode["desc"] = "Added Node";
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
		child.sibling = directchild.slice();
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



    function removeNode(d) {
        // For the node to be deleted, it must
        // (1.) Link must be 1
        // (2-a.) one of isMarried, hasChild, or hasSibling must be true. 
        // (2-b.) none of isMarried, hasChild, or hasSibling is true. (child of couple)

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

		numid--;
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
	// Edit the node

	function editNodeContent(d){
		let id = this.id;
		let parent = this.parentNode;
		let thisNode = d3.select(this);
		let parentNode = d3.select(parent);

		let thissize = thisNode.node().getBoundingClientRect()
		let thiswidth  = thissize.width;
		let thisheight  = thissize.height;
		console.log(this);
		console.log("width: ", thiswidth);
		console.log("height: ", thisheight);

		let input = d3.select(parent)
      		// Add form
			.insert("xhtml:form", "#" + id + " + *")
			.append("input")
			.attr("id", id + "-form")
			.attr("style", "width: " + thiswidth + "px;")
			.attr("style", "height: " + thisheight + "px;")
		    // Initiate form
			.attr("value", function(){
				thisNode.style("display", "none");
				this.focus();
			})
		    // Form out of focus
			.on("blur", function() {
				updateD(updateThis());
				console.log(d);
				parentNode.select("form").remove();
            })
		    // Form edited
            .on("keypress", function() {
                // IE fix
                if (!d3.event) d3.event = window.event;
                var event = d3.event;
				// Enter is pressed
                if (event.keyCode == 13) {
                    if (typeof(event.cancelBubble) !== 'undefined') // IE
                        event.cancelBubble = true;
                    if (event.stopPropagation) event.stopPropagation();
                    event.preventDefault();
					updateD(updateThis());
					console.log(d);
					parentNode.select("form").remove();
                }
            })
		restart();
		
		function updateThis() {
			let txt = input.node().value;
			if (txt.match(/^[-0-9a-zA-Z() !?_\./,]+$/g)) 
				thisNode.text(function(d) { return txt; });
			else
				txt = null;

			thisNode.style("display", "block")
			return txt;
        }
		function updateD(newinput){
			console.log(newinput);
			if (newinput == null) {
				return;
			} else if (id === "node-name") {
				d.label = newinput;
			} else if (id === "node-dob") {
				d.dob = newinput;
			} else if (id === "node-desc") {
				d.desc = newinput;
			}
		}
	}

	// Add picture to the node
	function editNodeAddPicture(d){
		var thisinfo = this;
		var input = document.createElement('input');
		input.type = "file"; input.id = "test-input";
		input.onchange = function(){
			const file = input.files[0];
			if(!file.type.match(/^image\/(png|jpg|jpeg|gif)$/)) return;

			new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = (event) => {
					
					resolve(event.target.result);
				}
				reader.readAsDataURL(file);
				
			}).then((result) => {
				d3.select(thisinfo).attr("src", result);
				input.remove();
				restart();
			})
		}
		input.click();
	}
	
    ///-------------------------
    // Mouse over action
    function mouseoverNode(d, i) {
        simulation.alpha(0.1);

        // Expand foreignObject
        let fo = d3.select(this).select("foreignObject")
            .transition().duration(250)
            // width
            .attrTween("width", function (d) {
                let i = d3.interpolate(d.width, nodewidthexp);
                return function (t) {
                    d.width = i(t); return i(t);
                }
            })
            // height
            .attrTween("height", function (d) {
                let i = d3.interpolate(d.height, nodeheightexp);
                return function (t) {
                    d.height = i(t);
                    // Recalculate collision box
                    simulation.force('collision', rectCollide()
                        .size(function (d) { return [d.width + 10, d.height + 10] }));
                    return i(t);
                }
            });
		let div = fo.select("div");


		let divinside = div.select("#node-div-inside")
			//.style("float", "left");
		let img = div.select("#node-div-img")
			//.style("float", "left")
        let desc = divinside.select("#node-desc")
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
		let linknum = thismarried.length + thischild.length + thissibling.length + thisparent.length;
        if (linknum <= 2 && linknum > 0
			&& thismarried.length <= 2
			&& !haschild ) {
            d3.select(this).select(".deletecircle")
                .style("display", "block")
                .transition().duration(250)
                .attr("r", 20)
                .style("opacity", 1);
        }

        // Show add node circle
        let circles = d3.select(this).select(".addnode-circle").selectAll("circle")
            .style("display", "block")
            .transition().duration(250)
            .attr("r", 20)
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
        let div = fo.select("div");

		let img = div.select("#node-div-img")
			//.style("float", null)
		let divinside = div.select("#node-div-inside")
			//.style("float", null);
        let desc = divinside.select("#node-desc")
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
    function zoom_actions() {
		d3.select(".objects")
			.attr("transform", d3.event.transform) }

    // Recalculate coordinate
    function recalculate() {
		let spread_min = 0,spread_max = 0,
			depth_min = 0,depth_max = 0;
		let spread, depth
		let abs = (a,b) => Math.abs(a - b);

		if (links.length > 3) {
			spread_min = Math.min.apply(Math, nodes.map(function (o) { return o.spread }));
            spread_max = Math.max.apply(Math, nodes.map(function (o) { return o.spread }));
            depth_min = Math.min.apply(Math, nodes.map(function (o) { return o.depth }));
            depth_max = Math.max.apply(Math, nodes.map(function (o) { return o.depth }));

			spread = abs(spread_max,spread_min);
			depth = abs(depth_max,depth_min);

			simulation
				.force('x', d3.forceX()
					   .x(function (d) { return (width / spread) * (spread + d.spread) - width ; })
					   .strength(0.75)
					  )
				.force('y', d3.forceY()
					   .y(function (d) { return (height / depth) * (depth + d.depth) - height ; })
					   .strength(0.5)
					  )
		} else {
			spread = abs(spread_max,spread_min);
			depth = abs(depth_max,depth_min);
		}

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
                let group = d3.select(this);
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
                let fo = group
                    // ForeignObject (the HTML on top of svg)
                    .append("foreignObject")
					.on("mousedown", function (d) { printNodes(d);})
                    .call(drag_handler)
                    .attr("width", nodewidth + "px")
                    .attr("height", nodeheight + divoffset + "px")
                    .attr("class", "node");
                    // HTML content wrapper (will expand on mouse hover)
				fo
                    .append("xhtml:div")
                    .attr("class", "node-div")
				
                    .each(function (d) {
                        let thisdiv = d3.select(this);
                        let div = thisdiv
							.append("div")
							.attr("id", "node-div-img")
							.classed("node-div-img", true)
							.style("text-align", "-webkit-center");
						div
						    // image
                            .append("xhtml:img")
                            .attr("id", "node-profilepic")
                            .classed("node-profilepic", true)
                            .attr("src", "../../images/profile.png")
                            .attr("alt", "profile pic")
							.on("dblclick", editNodeAddPicture)

						div = thisdiv
							.append("div")
							.attr("id", "node-div-inside")
							.classed("node-div-inside", true)
                        div
                            // h1 (name)
                            .append("xhtml:h1")
							.attr("id", "node-name")
							.classed("node-name", true)
                            .text(function (d) { return d.label; })
							.on("dblclick", editNodeContent);
                        div
                            // h2 (dob)
                            .append("xhtml:h2")
							.attr("id", "node-dob")
							.classed("node-dob", true)
                            .text(function (d) { return d.dob; })
							.on("dblclick", editNodeContent);
						div
                            .append("xhtml:h3")
							.attr("id", "node-desc")
                            .attr("class", "node-desc")
                            .text(function (d) { return d.desc; })
							.on("dblclick", editNodeContent)
                            .attr("display", "none").style("opacity", 0);
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

		changeCb();
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

    restart();
}

// export { initSvgTree };
