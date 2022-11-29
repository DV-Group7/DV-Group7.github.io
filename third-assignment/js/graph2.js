$(document).ready(function () {

    const svg = d3.select(singleContainer)
        .append("svg")
        .attr("width", 700)
        .attr("height", 500);
    let width = +svg.attr("width");
    let height = +svg.attr("height");

    const legend = d3.select(singleContainer)
        .append("svg")
        .attr("width", 900)
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
        .domain([5e-04, 1e-03, 1.5e-03, 2e-03, 2.5e-03, 3e-03])

        .range(d3.schemeGreens[7]);

    Promise.all([
        d3.json("../json/circoscrizioni.json"),
        d3.csv("../csv/values.csv", function (d) {

            data.set(d.numero_cir, +d.density)
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
                .html(d.properties.nome + "<br>" + "Density: " + d.total.toFixed(5) + "<br>" + "Abundance: " + d.properties.treeAbundance + "<br>" + "Area: " + d.properties.area + " m<sup>2</sup>" + "<br>")
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

            Tooltip.style("opacity", 0)
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
            .style("stroke", "#000000")


            .attr("fill", function (d) {
                d.total = data.get(d.properties.numero_cir) || 0;
                return colorScale(d.total);
            })

            .attr("class", function (d) { return "Country" })
            .style("opacity", 1)
            .on("mouseover", mouseOver)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseLeave)
        svg.style("transform", "scale(0.7,1)")


        //Label
        legend.append("text").attr("x", 400).attr("y", 140).text("Density of trees [unit]").style("font-size", "15px").attr("alignment-baseline", "middle")

        //1° block
        legend.append("rect").attr("x", 30).attr("y", 70).attr('width', 120).attr('height', 25).style("fill", colorScale(0)).attr('stroke', 'black')
        legend.append("text").attr("x", 60).attr("y", 110).text("0-[5e-04]").style("font-size", "15px").attr("alignment-baseline", "middle")
        //2° block
        legend.append("rect").attr("x", 150).attr("y", 70).attr('width', 120).attr('height', 25).style("fill", colorScale(5e-04)).attr('stroke', 'black')
        legend.append("text").attr("x", 160).attr("y", 110).text("[5e-04]-[1e-03]").style("font-size", "15px").attr("alignment-baseline", "middle")
        //3° block
        legend.append("rect").attr("x", 270).attr("y", 70).attr('width', 120).attr('height', 25).style("fill", colorScale(1e-03)).attr('stroke', 'black')
        legend.append("text").attr("x", 275).attr("y", 110).text("[1e-03]-[1.5e-03]").style("font-size", "15px").attr("alignment-baseline", "middle")
        //4° block
        legend.append("rect").attr("x", 390).attr("y", 70).attr('width', 120).attr('height', 25).style("fill", colorScale(1.5e-03)).attr('stroke', 'black')
        legend.append("text").attr("x", 395).attr("y", 110).text("[1.5e-03]-[2e-03]").style("font-size", "15px").attr("alignment-baseline", "middle")
        //5° block
        legend.append("rect").attr("x", 510).attr("y", 70).attr('width', 120).attr('height', 25).style("fill", colorScale(2e-03)).attr('stroke', 'black')
        legend.append("text").attr("x", 515).attr("y", 110).text("[2e-03]-[2.5e-03]").style("font-size", "15px").attr("alignment-baseline", "middle")
        //6° block
        legend.append("rect").attr("x", 630).attr("y", 70).attr('width', 120).attr('height', 25).style("fill", colorScale(2.5e-03)).attr('stroke', 'black')
        legend.append("text").attr("x", 635).attr("y", 110).text("[2.5e-03]-[3e-03]").style("font-size", "15px").attr("alignment-baseline", "middle")
        //7° block
        legend.append("rect").attr("x", 750).attr("y", 70).attr('width', 120).attr('height', 25).style("fill", colorScale(3e-03)).attr('stroke', 'black')
        legend.append("text").attr("x", 780).attr("y", 110).text(">[3e-03]").style("font-size", "15px").attr("alignment-baseline", "middle")
    })
});
