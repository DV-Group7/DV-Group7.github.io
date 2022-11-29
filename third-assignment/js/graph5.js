$(document).ready(function () {
    // The svg
    const svg = d3.select(singleContainer)
        .append("svg")
        .attr("width", 1200)
        .attr("height", 800);
    let width = +svg.attr("width");
    let height = +svg.attr("height");

    // Variable for coordinates of each tree
    let points = [];

    // Button defining
    const buttonCeltis = document.getElementById("Celtis")
    const buttonAesculus = document.getElementById("Aesculus")
    const buttonCarpinus = document.getElementById("Carpinus")
    const buttonCordata = document.getElementById("Cordata")
    const buttonPlatanus = document.getElementById("Platanus")
    const buttonEuropaea = document.getElementById("Europaea")
    const buttonAcer = document.getElementById("Acer")
    const buttonCupressus = document.getElementById("Cupressus")
    const buttonSophora = document.getElementById("Sophora")
    const buttonPrunus = document.getElementById("Prunus")
    const buttonOthers = document.getElementById("Others")

    // Auxiliary variable definition
    let a = 0;

    // Load data
    d3.json("../json/geo_data_trees.geojson").then(function (rawData) {
        d3.json("../json/circoscrizioni.json").then(function (data) {

            // Choose projection
            const projection = d3.geoIdentity().reflectY(true)
                .fitSize([width, height], data);

            // Draw empty map at each event click
            svg.append("g")
                .selectAll("path")
                .data(data.features)
                .join("path")
                .attr("fill", "#C1C1C1")
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .style("stroke", "#ffff")

            // When a click event occurs, it checks which checkbox is active and draws the 
            // points referring to that particular neighborhood

            addEventListener("click", function (e) {
                points
                svg.append("g")
                    .selectAll("path")
                    .data(data.features)
                    .join("path")
                    .attr("fill", "#C1C1C1")
                    .attr("d", d3.geoPath()
                        .projection(projection)
                    )
                    .style("stroke", "#ffff")

                //OTHERS
                if (buttonOthers.checked) {
                    for (let i = 0; i < 12512; i++) {
                        if (rawData.features[i].properties.Name !== "Celtis Australis" || "Aesculus hippocastanum" || "Carpinus betulus" || "Tilia cordata" || "Platanus x hispanica" || "Tilia x europaea" || "Acer campestre" || "Cupressus" || "Sophora japonica" || "Prunus cerasifera") {
                            points[a] = { long: parseFloat(rawData.features[i].geometry.coordinates[0]), lat: parseFloat(rawData.features[i].geometry.coordinates[1]) }
                            a = a + 1;
                        }
                    }
                    svg
                        .selectAll("myCircles")
                        .data(points)
                        .join("circle")
                        .attr("cx", d => projection([d.long, d.lat])[0])
                        .attr("cy", d => projection([d.long, d.lat])[1])
                        .attr("r", 0.5)
                        .style("fill", "#4363d8")
                        .attr("fill-opacity", 0.3)
                    points.length = 0;
                    a = 0;
                }

                //CELTIS
                if (buttonCeltis.checked) {
                    for (let i = 0; i < 12512; i++) {
                        if (rawData.features[i].properties.Name == "Celtis australis") {
                            points[a] = { long: parseFloat(rawData.features[i].geometry.coordinates[0]), lat: parseFloat(rawData.features[i].geometry.coordinates[1]) }
                            a = a + 1;
                        }
                    }
                    svg
                        .selectAll("myCircles")
                        .data(points)
                        .join("circle")
                        .attr("cx", d => projection([d.long, d.lat])[0])
                        .attr("cy", d => projection([d.long, d.lat])[1])
                        .attr("r", 0.5)
                        .style("fill", "#808000")
                    points.length = 0;
                    a = 0;
                }

                //AESCULUS
                if (buttonAesculus.checked) {
                    for (let i = 0; i < 12512; i++) {
                        if (rawData.features[i].properties.Name == "Aesculus hippocastanum") {
                            points[a] = { long: parseFloat(rawData.features[i].geometry.coordinates[0]), lat: parseFloat(rawData.features[i].geometry.coordinates[1]) }
                            a = a + 1;
                        }
                    }
                    svg
                        .selectAll("myCircles")
                        .data(points)
                        .join("circle")
                        .attr("cx", d => projection([d.long, d.lat])[0])
                        .attr("cy", d => projection([d.long, d.lat])[1])
                        .attr("r", 0.5)
                        .style("fill", "#9A6324")
                    points.length = 0;
                    a = 0;
                }

                //CARPINUS
                if (buttonCarpinus.checked) {
                    for (let i = 0; i < 12512; i++) {
                        if (rawData.features[i].properties.Name == "Carpinus betulus") {
                            points[a] = { long: parseFloat(rawData.features[i].geometry.coordinates[0]), lat: parseFloat(rawData.features[i].geometry.coordinates[1]) }
                            a = a + 1;
                        }
                    }
                    svg
                        .selectAll("myCircles")
                        .data(points)
                        .join("circle")
                        .attr("cx", d => projection([d.long, d.lat])[0])
                        .attr("cy", d => projection([d.long, d.lat])[1])
                        .attr("r", 0.5)
                        .style("fill", "#469990")
                    points.length = 0;
                    a = 0;
                }

                //CORDATA
                if (buttonCordata.checked) {
                    for (let i = 0; i < 12512; i++) {
                        if (rawData.features[i].properties.Name == "Tilia cordata") {
                            points[a] = { long: parseFloat(rawData.features[i].geometry.coordinates[0]), lat: parseFloat(rawData.features[i].geometry.coordinates[1]) }
                            a = a + 1;
                        }
                    }
                    svg
                        .selectAll("myCircles")
                        .data(points)
                        .join("circle")
                        .attr("cx", d => projection([d.long, d.lat])[0])
                        .attr("cy", d => projection([d.long, d.lat])[1])
                        .attr("r", 0.5)
                        .style("fill", "#000075")
                    points.length = 0;
                    a = 0;
                }

                //PLATANUS
                if (buttonPlatanus.checked) {
                    for (let i = 0; i < 12512; i++) {
                        if (rawData.features[i].properties.Name == "Platanus x hispanica") {
                            points[a] = { long: parseFloat(rawData.features[i].geometry.coordinates[0]), lat: parseFloat(rawData.features[i].geometry.coordinates[1]) }
                            a = a + 1;
                        }
                    }
                    svg
                        .selectAll("myCircles")
                        .data(points)
                        .join("circle")
                        .attr("cx", d => projection([d.long, d.lat])[0])
                        .attr("cy", d => projection([d.long, d.lat])[1])
                        .attr("r", 0.5)
                        .style("fill", "#e6194B")
                    points.length = 0;
                    a = 0;
                }
                //EUROPAEA
                if (buttonEuropaea.checked) {
                    for (let i = 0; i < 12512; i++) {
                        if (rawData.features[i].properties.Name == "Tilia x europaea") {
                            points[a] = { long: parseFloat(rawData.features[i].geometry.coordinates[0]), lat: parseFloat(rawData.features[i].geometry.coordinates[1]) }
                            a = a + 1;
                        }
                    }
                    svg
                        .selectAll("myCircles")
                        .data(points)
                        .join("circle")
                        .attr("cx", d => projection([d.long, d.lat])[0])
                        .attr("cy", d => projection([d.long, d.lat])[1])
                        .attr("r", 0.5)
                        .style("fill", "#f58231")
                    points.length = 0;
                    a = 0;
                }
                //ACER
                if (buttonAcer.checked) {
                    for (let i = 0; i < 12512; i++) {
                        if (rawData.features[i].properties.Name == "Acer campestre") {
                            points[a] = { long: parseFloat(rawData.features[i].geometry.coordinates[0]), lat: parseFloat(rawData.features[i].geometry.coordinates[1]) }
                            a = a + 1;
                        }
                    }
                    svg
                        .selectAll("myCircles")
                        .data(points)
                        .join("circle")
                        .attr("cx", d => projection([d.long, d.lat])[0])
                        .attr("cy", d => projection([d.long, d.lat])[1])
                        .attr("r", 0.5)
                        .style("fill", "#ffe119")
                    points.length = 0;
                    a = 0;
                }
                //CUPRESSUS
                if (buttonCupressus.checked) {
                    for (let i = 0; i < 12512; i++) {
                        if (rawData.features[i].properties.Name == "Cupressus") {
                            points[a] = { long: parseFloat(rawData.features[i].geometry.coordinates[0]), lat: parseFloat(rawData.features[i].geometry.coordinates[1]) }
                            a = a + 1;
                        }
                    }
                    svg
                        .selectAll("myCircles")
                        .data(points)
                        .join("circle")
                        .attr("cx", d => projection([d.long, d.lat])[0])
                        .attr("cy", d => projection([d.long, d.lat])[1])
                        .attr("r", 0.5)
                        .style("fill", "#911eb4")
                    points.length = 0;
                    a = 0;
                }
                //SOPHORA
                if (buttonSophora.checked) {
                    for (let i = 0; i < 12512; i++) {
                        if (rawData.features[i].properties.Name == "Sophora japonica") {
                            points[a] = { long: parseFloat(rawData.features[i].geometry.coordinates[0]), lat: parseFloat(rawData.features[i].geometry.coordinates[1]) }
                            a = a + 1;
                        }
                    }
                    svg
                        .selectAll("myCircles")
                        .data(points)
                        .join("circle")
                        .attr("cx", d => projection([d.long, d.lat])[0])
                        .attr("cy", d => projection([d.long, d.lat])[1])
                        .attr("r", 0.5)
                        .style("fill", "#3cb44b")
                    points.length = 0;
                    a = 0;
                }
                //PRUNUS
                if (buttonPrunus.checked) {
                    for (let i = 0; i < 12512; i++) {
                        if (rawData.features[i].properties.Name == "Prunus cerasifera") {
                            points[a] = { long: parseFloat(rawData.features[i].geometry.coordinates[0]), lat: parseFloat(rawData.features[i].geometry.coordinates[1]) }
                            a = a + 1;
                        }
                    }
                    svg
                        .selectAll("myCircles")
                        .data(points)
                        .join("circle")
                        .attr("cx", d => projection([d.long, d.lat])[0])
                        .attr("cy", d => projection([d.long, d.lat])[1])
                        .attr("r", 0.5)
                        .style("fill", "#42d4f4")
                    points.length = 0;
                    a = 0;
                }
            });
            svg.style("transform", "scale(0.7,1)")

        })
    })
});
