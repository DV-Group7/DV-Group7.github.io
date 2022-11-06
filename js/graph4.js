let currentWidth = 0;

const margin = { top: 30, right: 30, bottom: 30, left: 200 };

const getHeight = (d) => parseFloat(d.length || d) * 30;
const getWidth = (e) => parseFloat(d3.select(e).style('width')) - margin.right - margin.left;

const sanitizeString = (s) => s.replace(/([^a-z0-9]+)/gi, '-').toLowerCase();

function DrawChartNeighborhoodsPercentage(element) {
    d3.csv("/csv/geo_data_trees_neighborhoods.csv").then(data => {
        // List of subgroups = header of the csv files = soil condition here
        const subgroups = data.columns.slice(1)

        // List of groups = species here = value of the first column called group -> I show them on the X axis
        const groups = data.map(d => (d.Neighborhood))
        const height = getHeight(data);
        const width = getWidth(element);

        // append the svg object to the body of the page
        const svg = d3.select(element)
            .html('')
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X axis
        const x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, width])

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        // Add Y axis
        const y = d3.scaleBand()
            .domain(groups)
            .range([height, 0])
            .padding([0.1]);

        svg.append("g")
            .call(d3.axisLeft(y).tickSizeOuter(0));

        // color palette = one color per subgroup
        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#A63CB3', '#FD4B84', '#FA9832', '#31EE82', '#28A2DC', '#5366D7']);

        // Normalize the data -> sum of each group must be 100!
        let normalizedData = data.slice();
        $(normalizedData).each(function (_, d) {
            let tot = 0
            for (let i in subgroups) {
                let name = subgroups[i];
                tot += +d[name]
            }
            // Now normalize
            for (let i in subgroups) {
                let name = subgroups[i];
                d[name] = d[name] / tot * 100
            }
        })

        //stack the data? --> stack per subgroup
        const stackedData = d3.stack()
            .keys(subgroups)
            (normalizedData)

        const tooltip = d3.select(element)
            .append("div")
            .attr("class", "tooltip")
            .style("display", "none");

        const mouseover = function (event, d) {
            const subgroupName = d3.select(this.parentNode).datum().key;
            const subgroupValue = parseFloat(d.data[subgroupName]).toFixed(2);

            d3.selectAll(".myRect").style("opacity", 0.2)

            d3.selectAll("." + sanitizeString(subgroupName)).style("opacity", 1)

            tooltip.html(subgroupName + ": " + subgroupValue)
                .style("display", "block");
        }

        const mousemove = function (event, d) {
            let height = parseFloat(tooltip.style('height'));

            tooltip
                .style("left", (event.x) + "px")
                .style("top", (event.y - (height * 2)) + "px")
        }

        const mouseleave = function (event, d) {
            d3.selectAll(".myRect")
                .style("opacity", 1)

            tooltip.style("display", "none");
        }

        // Show the bars
        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .join("g")
            .attr("fill", d => color(d.key))
            .attr("class", d => "myRect " + sanitizeString(d.key))
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", d => x(d[0]))
            .attr("y", d => y(d.data.Neighborhood))
            .attr("height", y.bandwidth())
            .attr("stroke", "black")
            .attr("stroke-width", ".5")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

        // Animation
        svg.selectAll("rect")
            .transition()
            .duration(750)
            .attr("width", d => x(d[1]) - x(d[0]))
            .delay(function (d, i) {
                return (i * 75)
            })

        const legend = d3.select(element)
            .append("svg")
            .style('padding-top', '2rem')
            .attr('width', 270)
            .attr('height', 100)
            .append('g')
            .selectAll("div")
            .data(subgroups)
            .enter()
            .append("g")
            .attr('transform', (d, i) => "translate(0," + i * 20 + ")");

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", (d, i) => color(i));

        legend.append("text")
            .attr("x", 25)
            .attr("y", 13)
            .text(d => d);
    });
}

$(document).ready(function () {
    $(window).resize();
});

$(window).resize(function () {
    if (currentWidth !== window.innerWidth) {
        currentWidth = window.innerWidth;
        DrawChartNeighborhoodsPercentage('.chart');
    }
});