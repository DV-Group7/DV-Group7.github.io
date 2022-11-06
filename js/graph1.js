let currentWidth = 0;

const margin = { top: 30, right: 30, bottom: 30, left: 200 };

const getHeight = (d) => parseFloat(d.length || d) * 30;
const getWidth = (e) => parseFloat(d3.select(e).style('width')) - margin.right - margin.left;

function DrawChartCategories(element) {
    d3.csv("/csv/geo_data_trees_categories.csv").then(data => {
        data.forEach((d) => {
            d.Abundance = parseInt(d.Abundance);
            d.Canopy = parseFloat(d.Canopy).toFixed(2);
        });

        // sort data
        data.sort((a, b) => b.Abundance - a.Abundance);

        // slice data
        data.length = 25

        // set chart dimensions
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
            .domain([0, d3.max(data, d => d.Abundance)])
            .range([0, width]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        // Add Y axis
        const y = d3.scaleBand()
            .domain(data.map(d => d.Name))
            .range([0, height])
            .padding([0.1]);

        svg.append("g")
            .call(d3.axisLeft(y).tickSizeOuter(0));

        const tooltip = d3.select(element)
            .append("div")
            .attr("class", "tooltip")
            .style("display", "none");

        const mouseover = function (event, d) {
            tooltip.html('Abundance: ' + d.Abundance + '<br>' + 'Canopy (avg.): ' + d.Canopy + ' m<sup>2</sup>')
                .style("display", "block");
        }

        const mousemove = function (event, d) {
            let height = parseFloat(tooltip.style('height'));
            tooltip
                .style("left", (event.x) + "px")
                .style("top", (event.y - (height * 3 / 2)) + "px")
        }

        const mouseleave = function (event, d) {
            tooltip.style("display", "none");
        }

        const myColor = d3.scaleSequential().domain([0, 100])
            .interpolator(d3.interpolateRainbow);

        // Show the bars
        svg.selectAll("mybar")
            .data(data)
            .join("rect")
            .attr("fill", d => myColor(Math.floor(d.Abundance) / 2329 * 100))
            .attr("x", d => x(0))
            .attr("y", d => y(d.Name))
            .attr("height", d => y.bandwidth())
            .attr("stroke", "black")
            .attr("stroke-width", ".5")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

        // Animation
        svg.selectAll("rect")
            .transition()
            .duration(1000)
            .attr("width", d => x(d.Abundance))
            .delay(function (d, i) {
                return (i * 75)
            })
    });
}

$(document).ready(function () {
    $(window).resize();
});

$(window).resize(function () {
    if (currentWidth !== window.innerWidth) {
        currentWidth = window.innerWidth;
        DrawChartCategories('.chart');
    }
});