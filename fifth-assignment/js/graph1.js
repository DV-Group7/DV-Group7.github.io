$(document).ready(function () {

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 10, bottom: 10, left: 10 },
        width = 1000 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;

    var legend = d3.select(singleContainer)
        .append("svg")
        .attr("width", 1000)
        .attr("height", 80);

    // append the svg object to the body of the page
    var svg = d3.select(singleContainer).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Color scale used
    var color = d3.scaleOrdinal(d3.schemeCategory20);

    // Inizitialization array all data links and aux variables
    let data = new Array();
    let a = 0;
    let start = {};
    let end = {};
    let startPoint = 0;

    // Struttura base ausiliaria per disegnare i links
    let textCordinates = ["dy", "source", "sy", "target", "ty", "value", "text"];
    let coordinates = ["dx", "dy", "x", "y"]
    for (var i = 0; i < 20; i++) {
        data[i] = {};
        data[i][textCordinates[0]] = 0;
        data[i][textCordinates[1]] = {};
        data[i][textCordinates[2]] = 0;
        data[i][textCordinates[3]] = {};
        data[i][textCordinates[4]] = 0;
        data[i][textCordinates[5]] = 2;
        data[i][textCordinates[6]] = "";

        for (var k = 0; k < 4; k++) {
            data[i][textCordinates[1]][coordinates[k]] = 0;
            data[i][textCordinates[3]][coordinates[k]] = 0;
        }
    }

    // Set the sankey diagram properties
    var sankey = d3.sankey()
        .nodeWidth(36)
        .nodePadding(20)
        .size([width, height]);

    // load the data
    d3.json("../data_sankey_per.json", function (error, graph) {

        // Constructs a new Sankey generator with the default settings.
        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(1);

        let c = (graph.links.length / 2) - 1;
        // add in the nodes
        var node = svg.append("g")
            .selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
            .call(d3.drag()
                .subject(function (d) { return d; })
                .on("start", function () { this.parentNode.appendChild(this); })
                .on("drag", dragmove));

        // add the rectangles for the nodes
        node
            .append("rect")
            .attr("height", function (d) {
                if (a == 0) {
                    start.dx = d.dx;
                    start.dy = d.dy;
                    start.x = d.x;
                    start.y = d.y;
                    startPoint = start.y;
                } else if (a != 0 && a != graph.nodes.length - 1) {

                    //CARBON
                    data[a - 1].source.dx = start.dx;
                    data[a - 1].source.dy = start.dy / 100 * (graph.links[a - 1].value2);
                    data[a - 1].source.x = start.x;
                    if (a == 1) {
                        data[a - 1].source.y = start.y;
                    } else {
                        data[a - 1].source.y = data[a - 2].source.y + data[a - 2].source.dy;
                    }
                    data[a - 1].text = "Carbon storage: " + graph.links[a - 1].value3 + " [kg/yr]"
                    data[a - 1].target.dx = d.dx;
                    data[a - 1].target.dy = d.dy;
                    data[a - 1].target.x = d.x;
                    data[a - 1].target.y = d.y;

                    //EURO
                    data[a + c].source.dx = d.dx;
                    data[a + c].source.dy = d.dy;
                    data[a + c].source.x = d.x;
                    data[a + c].source.y = d.y;
                    data[a + c].text = "Total annual benefit: " + graph.links[a + c].value3 + " [eur/yr]"

                } else if (a == graph.nodes.length - 1) {
                    end.dx = d.dx;
                    end.dy = d.dy;
                    end.x = d.x;
                    end.y = d.y;

                    //EURO
                    for (let i = 1; i < graph.nodes.length - 1; i++) {
                        data[i + c].target.dx = end.dx;
                        data[i + c].target.dy = end.dy / 100 * (graph.links[i + c].value2);
                        data[i + c].target.x = end.x;
                        if (i == 1) {
                            data[i + c].target.y = end.y;
                        }
                        else {
                            data[i + c].target.y = data[i + c - 1].target.y + data[i + c - 1].target.dy;
                        }
                    }
                }
                a++;
                { return d.dy; }
            })
            .attr("width", sankey.nodeWidth())
            .style("fill", function (d) { return d.color = color(d.name.replace(/ .*/, "")); })
            .style("stroke", "black")
            .style('stroke-opacity', '1')
            .style('stroke-width', '1')
            // Add hover text
            .append("title")
            .text(function (d) {
                if (d.name == "Carbon storage") { return "Total carbon storage:  " + d.Abundance + " (kg/yr)"; }
                if (d.name == "Total annual benefits") { return "Total benefits: " + d.Abundance + " (eur/yr)"; }
                else { return d.name + "\n" + "Abundance: " + d.Abundance + " unit" }
            });

        console.log(graph.links.length)
        console.log(graph.nodes.length)
        console.log(c)

        // add in the title for the nodes
        node
            .append("text")
            .attr("x", -6)
            .attr("y", function (d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function (d) { return d.name; })
            .filter(function (d) { return d.x < width / 2; })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        // the function for moving the nodes]]
        function dragmove(d) {
            d3.select(this)
                .attr("transform",
                    "translate("
                    + d.x + ","
                    + (d.y = Math.max(
                        0, Math.min(height - d.dy, d3.event.y))
                    ) + ")");

            sankey.relayout();
            link.attr("d", sankey.link());
        }

        legend.append("text")
            .attr("x", 385)
            .attr("y", 40)
            .text("Use tooltip for more details!")
            .style("font-size", "20px")
            .attr("alignment-baseline", "middle")

        svg.selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .style("stroke-width", "black")
            .attr("d", function (d) { return link(d) })
            .append("title")
            .text(function (d) {

                { return d.text }
            });

        //borrowed from sankey.js, draws one a line from top of source to top of target, top of target to bottom of target, bottom of target to bottom of source, bottom of source to top of source
        function link(d) {
            var curvature = .6;
            var x0 = d.source.x + d.source.dx,
                x1 = d.target.x,
                xi = d3.interpolateNumber(x0, x1),
                x2 = xi(curvature),
                x3 = xi(1 - curvature),
                y0 = d.source.y + d.sy + d.dy / 2,
                y1 = d.target.y + d.ty + d.dy / 2;
            return "M" + x0 + "," + y0
                + "C" + x2 + "," + y0
                + " " + x3 + "," + y1
                + " " + x1 + "," + y1
                + "L" + x1 + "," + (y1 + d.target.dy)
                + "C" + x3 + "," + (y1 + d.target.dy)
                + " " + x2 + "," + (y0 + d.source.dy)
                + " " + x0 + "," + (y0 + d.source.dy)
                + "L" + x0 + "," + y0;
        }
    });
})




