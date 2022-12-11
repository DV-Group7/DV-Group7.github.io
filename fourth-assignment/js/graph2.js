$(document).ready(function () {

    let features = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dic", "Jan"];
    let months = ["Year", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dic"];
    features.reverse()

    // Append years legend
    const legendColor = d3.select(singleContainer)
        .append("svg")
        .attr("width", 1400)
        .attr("height", 100)
        .attr("margin", 0);

    // Load data
    d3.csv("../graph_1.csv").then(function (data) {

        // Inizitialization array all data
        let values = new Array();

        // Inizialization auxiliaries variables 
        let k = 1;
        let a = 1993;

        for (var i = 0; i < 8; i++) {
            values[i] = {};
            values[i][months[0]] = a;
            a + 4;
        }

        let years = {
            '1993': 0,
            '1997': 1,
            '2001': 2,
            '2005': 3,
            '2009': 4,
            '2013': 5,
            '2017': 6,
            '2021': 7,
        };

        for (let i = 0; i < values.length * 12; i++) {
            values[years[data[i].yr]][months[k]] = data[i].avg
            k++;
            if (k == 13) k = 1;
        }

        // SVG
        let svg = d3.select("body").append("svg")
            .attr("width", 650)
            .attr("height", 600);

        let radialScale = d3.scaleLinear()
            .domain([0, 30])
            .range([0, 250]);

        let ticks = [5, 10, 15, 20, 25, 30];

        ticks.forEach(t =>
            svg.append("circle")
                .attr("cx", 300)
                .attr("cy", 300)
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("r", radialScale(t))
        );

        ticks.forEach(t =>
            svg.append("text")
                .attr("x", 305)
                .attr("y", 300 - radialScale(t))
                .text(t.toString())
        );

        function angleToCoordinate(angle, value) {
            let x = Math.cos(angle) * radialScale(value);
            let y = Math.sin(angle) * radialScale(value);
            return { "x": 300 + x, "y": 300 - y };
        }

        for (var i = 0; i < features.length; i++) {
            let ft_name = features[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
            let line_coordinate = angleToCoordinate(angle, 30);
            let label_coordinate = angleToCoordinate(angle, 32.5);

            // Draw axis line
            svg.append("line")
                .attr("x1", 300)
                .attr("y1", 300)
                .attr("x2", line_coordinate.x)
                .attr("y2", line_coordinate.y)
                .attr("stroke", "black");

            // Draw axis label
            svg.append("text")
                .attr("x", label_coordinate.x - 10)
                .attr("y", label_coordinate.y)
                .text(ft_name);
        }

        let line = d3.line()
            .x(d => d.x)
            .y(d => d.y);

        let colors = ['#FF8000', '#CD0000', '#CDAD00', '#FF1493', '#228B22', '#9B30FF', '#00FFFF', '#0000FF'];

        function getPathCoordinates(data_point) {
            let coordinates = [];
            for (var i = 0; i < features.length; i++) {
                let ft_name = features[i];
                let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
                coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
            }
            let angle = (Math.PI / 2) + (2 * Math.PI * 0 / features.length);
            coordinates.push(angleToCoordinate(angle, data_point[months[1]]));
            return coordinates;
        }

        const highlight = function (event, d) {

            d3.selectAll("path")
                .transition()
                .delay("100")
                .duration("10")
                .style("opacity", "0.1")
                .style("stroke-width", "1.3");

            const selection = d3.select(this).raise();
            selection
                .transition()
                .delay("100")
                .duration("10")
                .style("opacity", "1")
                .style("stroke-width", "4");
        }

        const doNotHighlight = function (event, d) {
            d3.selectAll("path")
                .transition()
                .delay("100")
                .duration("10")

                .style("opacity", "1")
                .style("stroke-width", "2.3");
        }

        for (var i = 0; i < values.length * 12; i++) {

            let coordinates = getPathCoordinates(values[i]);

            // Draw the path element
            svg.append("path")
                .datum(coordinates)
                .attr("d", line)
                .attr("stroke-width", 2.3)
                .attr("stroke", colors[i])
                .attr("fill", "none")
                .attr("opacity", 1)
                .on("mouseover", highlight)
                .on("mouseleave", doNotHighlight)

            //Bottom years legend
            if (i % 2 == 0) {
                legendColor.append("text").attr("x", 340 + i * 100).attr("y", 15).text(Object.keys(years)[i]).style("font-size", "20px").attr("alignment-baseline", "middle")
                legendColor.append('rect').attr('x', 300 + i * 100).attr('y', 12).attr('fill', colors[i]).attr('width', 30).attr('height', 6)
            }
            else {
                legendColor.append("text").attr("x", 340 + (i - 1) * 100).attr("y", 52).text(Object.keys(years)[i]).style("font-size", "20px").attr("alignment-baseline", "middle")
                legendColor.append('rect').attr('x', 300 + (i - 1) * 100).attr('y', 47).attr('fill', colors[i]).attr('width', 30).attr('height', 6)
            }
        }
    })
})