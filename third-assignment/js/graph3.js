$(document).ready(function () {

    const svg = d3.select(singleContainer)
        .append("svg")
        .attr("width", 700)
        .attr("height", 500);

    let width = +svg.attr("width");
    let height = +svg.attr("height");

    const legend = d3.select(singleContainer)
        .append("svg")
        .attr("width", 1000)
        .attr("height", 150);

    const Tooltip = d3.select(singleContainer)
        .append("div")
        .attr("class", "Tooltip")
        .attr('style', 'position: absolute; opacity: 0;')
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    let data = new Map()

    const colorScale = d3.scaleThreshold()
        .domain([10000, 20000, 30000, 40000, 50000])
        .range(d3.schemeBlues[7]);

    Promise.all([
        d3.json("../json/circoscrizioni.json"),
        d3.csv("../csv/values.csv", function (d) {
            data.set(d.numero_cir, +d.oxygen)
        })
    ]).then(function (loadData) {

        let topo = loadData[0]

        let mouseOver = function (d) {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .1)
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
            Tooltip.style('opacity', 1)
        }

        var mousemove = function (event, d) {
            Tooltip
                .html(d.properties.nome + "<br>" + "Oxygen: " + d.total.toFixed() + " kg/yr" + "<br>" + "Abundance: " + d.properties.treeAbundance + "<br>" + "Area: " + d.properties.area + " m<sup>2</sup>" + "<br>")
                .style("left", (event.x) / 1.3 + "px")
                .style("top", (event.y) / 1.3 + "px")
        }

        let mouseLeave = function (d) {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", 1)
            d3.select(this)
                .transition()
                .duration(200)
            Tooltip.style('opacity', 0)
        }

        const projection = d3.geoIdentity().reflectY(true)
            .fitSize([width, height], topo);

        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .join("path")
            .attr("fill", "#69b3a2")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .style("stroke", "#000")

            .attr("fill", function (d, i) {
                d.total = data.get(d.properties.numero_cir) || 0;
                return colorScale(d.total);
            })
            .attr("class", function (d) { return "Country" })
            .style("opacity", 1)
            .on("mouseover", mouseOver)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseLeave)
        svg.style("transform", "scale(0.7,1)")

        legend.append("text").attr("x", 430).attr("y", 140).text("Oxygen Production [kg/yr]").style("font-size", "15px").attr("alignment-baseline", "middle")

        legend.append("rect").attr("x", 50).attr("y", 70).attr('width', 150).attr('height', 30).style("fill", colorScale(0)).attr('stroke', 'black')
        legend.append("text").attr("x", 110).attr("y", 115).text("0-10k").style("font-size", "15px").attr("alignment-baseline", "middle")

        legend.append("rect").attr("x", 200).attr("y", 70).attr('width', 150).attr('height', 30).style("fill", colorScale(10000)).attr('stroke', 'black')
        legend.append("text").attr("x", 255).attr("y", 115).text("10k-20k").style("font-size", "15px").attr("alignment-baseline", "middle")

        legend.append("rect").attr("x", 350).attr("y", 70).attr('width', 150).attr('height', 30).style("fill", colorScale(20000)).attr('stroke', 'black')
        legend.append("text").attr("x", 405).attr("y", 115).text("20k-30k").style("font-size", "15px").attr("alignment-baseline", "middle")

        legend.append("rect").attr("x", 350 + 150).attr("y", 70).attr('width', 150).attr('height', 30).style("fill", colorScale(30000)).attr('stroke', 'black')
        legend.append("text").attr("x", 550).attr("y", 115).text("30k-40k").style("font-size", "15px").attr("alignment-baseline", "middle")

        legend.append("rect").attr("x", 350 + 300).attr("y", 70).attr('width', 150).attr('height', 30).style("fill", colorScale(40000)).attr('stroke', 'black')
        legend.append("text").attr("x", 700).attr("y", 115).text("40k-50k").style("font-size", "15px").attr("alignment-baseline", "middle")

        legend.append("rect").attr("x", 350 + 450).attr("y", 70).attr('width', 150).attr('height', 30).style("fill", colorScale(50000)).attr('stroke', 'black')
        legend.append("text").attr("x", 860).attr("y", 115).text("> 50k").style("font-size", "15px").attr("alignment-baseline", "middle")
    })
});