let currentWidth = 0;

const margin = { top: 40, right: 30, bottom: 30, left: 180 };

const getHeight = (d) => parseFloat(d.length || d) * 30;
const getWidth = (e) => parseFloat(d3.select(e).style('width')) - margin.right - margin.left;

const sanitizeString = (s) => s.replace(/([^a-z0-9]+)/gi, '-').toLowerCase();

const waffleObject = {
    rawData: [],
    getCategories: function () {
        return waffleObject.rawData.columns.slice(1);
    },
    drawChart: function (selector, category, labels) {
        let data = []
        this.rawData.forEach((row, index) => {
            data[index] = { 'Name': row.Neighborhood };
            Object.keys(row).forEach((d) => {
                if (d == category) {
                    data[index]['Abundance'] = +row[d];
                }
            });
        });

        let newMargin = margin;

        if (!labels) {
            newMargin.left = newMargin.right;
        }

        // set chart dimensions
        const height = getHeight(data);
        const width = getWidth(selector) / (this.getCategories().length + 3);

        // append the svg object to the body of the page
        const element = d3.select(selector)
            .append("svg")
            .attr("width", width + newMargin.left + newMargin.right)
            .attr("height", height + newMargin.top + newMargin.bottom);

        const svg = element.append("g")
            .attr("transform", `translate(${newMargin.left},${newMargin.top})`);

        const title = svg.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .attr("text-anchor", "left")
            .text(category);

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.Abundance)])
            .range([0, width]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0).ticks(3));

        // Add Y axis
        const y = d3.scaleBand()
            .domain(data.map(d => d.Name))
            .range([0, height])
            .padding([0.1]);

        svg.append("g")
            .call(d3.axisLeft(y).tickSizeOuter(0))
            .selectAll('g')
            .style('display', labels ? 'block' : 'none');

        // Color palette = one color per subgroup
        const color = d3.scaleOrdinal()
            .domain(this.getCategories())
            .range(['#A63CB3', '#FD4B84', '#FA9832', '#31EE82', '#28A2DC', '#5366D7']);

        const tooltip = d3.select(selector)
            .append("div")
            .attr("class", "tooltip")
            .style("display", "none");

        const mouseover = function (event, d) {
            tooltip.html('Abundance: ' + d.Abundance)
                .style("display", "block");
        }

        const mousemove = function (event, d) {
            let height = parseFloat(tooltip.style('height'));
            tooltip
                .style("left", (event.x) + "px")
                .style("top", (event.y - (height * 2)) + "px")
        }

        const mouseleave = function (event, d) {
            tooltip.style("display", "none");
        }

        // Show the bars
        svg.selectAll("mybar")
            .data(data)
            .join("rect")
            .attr("fill", d => color(category))
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
    }
};

$(document).ready(async function () {
    waffleObject.rawData = await d3.csv("/csv/geo_data_trees_neighborhoods.csv");

    $(window).resize(function () {
        if (currentWidth !== window.innerWidth) {
            currentWidth = window.innerWidth;
            $('.all-charts').html('');
            waffleObject.getCategories().forEach(function (category, i) {
                waffleObject.drawChart('.all-charts', category, i === 0);
            });
        }
    });

    $(window).resize();
});
