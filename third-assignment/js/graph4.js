$(document).ready(function () {
    // Create svg
    const svg = d3.select(singleContainer)
        .append("svg")
        .attr("width", 1000)
        .attr("height", 800);
    let width = +svg.attr("width");
    let height = +svg.attr("height");

    // Variable for coordinates of each tree
    let points = [];

    // Load data
    d3.json("../json/geo_data_trees.geojson").then(function (rawData) {
        for (let i = 0; i < 12512; i++) {
            points[i] = { long: parseFloat(rawData.features[i].geometry.coordinates[0]), lat: parseFloat(rawData.features[i].geometry.coordinates[1]) }
        }
        d3.json("../json/circoscrizioni.json").then(function (data) {

            // Choose projection
            const projection = d3.geoIdentity().reflectY(true)
                .fitSize([width, height], data);

            // Draw the map
            svg.append("g")
                .selectAll("path")
                .data(data.features)
                .join("path")
                .attr("fill", "#C1C1C1")
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .style("stroke", "#ffff")

            //Draw the dot
            svg
                .selectAll("myCircles")
                .data(points)
                .join("circle")
                .attr("cx", d => projection([d.long, d.lat])[0])
                .attr("cy", d => projection([d.long, d.lat])[1])
                .attr("r", 0.4)
                .style("fill", "#46975B")
                .attr("fill-opacity", 1)
            svg.style("transform", "scale(0.7,1)")

        })
    })
});
