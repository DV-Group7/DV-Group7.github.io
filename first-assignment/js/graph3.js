const minWidth = 200;

const object = {
    rawData: [],
    getSubgroups: function () {
        return object.rawData.columns.slice(1);
    },
    drawChart: function (selector, category, full) {
        const subgroups = this.getSubgroups();

        // Filter data by neighborhood
        let data = [];
        this.rawData.forEach((row, index) => {
            data[index] = { 'Name': row.Neighborhood };
            Object.keys(row).forEach(d => {
                if (d === category) {
                    data[index].Abundance = +row[d];
                }
            });
        });

        // Sort data
        data.sort((a, b) => a.Name > b.Name ? -1 : 1);

        // Set chart dimensions
        const height = getHorizontalChartHeight(data);
        let width = getElementWidth(selector) / (subgroups.length + 3);

        if (width < minWidth) {
            width = minWidth;
        }

        // Wrap selector in a div
        selector = d3.select(selector)
            .append('div')
            .attr('class', 'container')
            .node();

        // Add tooltip
        const tooltip = d3.select(selector)
            .append('div')
            .attr('class', 'tooltip')
            .style('display', 'none');

        // Add chart svg
        const chart = d3.select(selector)
            .append('svg')
            .attr('class', 'bar-chart');

        // Add title
        const title = chart.append('g')
            .attr('class', 'title')
            .attr('font-size', '15');

        title.append('text')
            .text(category);

        // Add Y axis
        const y = d3.scaleBand()
            .domain(data.map(d => d.Name))
            .range([height, 0])
            .padding([0.1]);

        const yAxis = chart.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y).tickSizeOuter(0));

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.Abundance)])
            .range([0, width]);

        const xAxis = chart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0).ticks(3));

        // Color palette
        const color = getTreeColors(subgroups);

        // Tooltip timeout
        let timeout = null;

        // Clear tooltip timeout
        const removeTimeout = () => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        };

        const mouseover = (event, d) => {
            removeTimeout();

            // Show tooltip
            tooltip.html(`Abundance: ${d.Abundance}`)
                .style('display', 'block');
        };

        const mousemove = (event, d) => {
            // Move tooltip near mouse pointer
            tooltip.style('left', `${event.x}px`)
                .style('top', `${event.y - (parseFloat(tooltip.style('height')) * 2)}px`);
        };

        const mouseleave = (event, d) => {
            removeTimeout();

            // Add Tooltip timeout
            timeout = setTimeout(() => {
                tooltip.style('display', 'none');
            }, 150);
        };

        // Show the bars
        chart.append('g')
            .attr('class', 'bars')
            .selectAll('g')
            .data(data)
            .join('rect')
            .attr('fill', d => color(category))
            .attr('x', d => x(0))
            .attr('y', d => y(d.Name))
            .attr('height', d => y.bandwidth())
            .attr('stroke', 'black')
            .attr('stroke-width', '.5')
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);

        // Remove Y axis
        if (!full) {
            yAxis.selectAll('g')
                .remove();
        }
        else {
            width = width + getSVGWidth(yAxis);
        }

        // Animation
        chart.selectAll('rect')
            .transition()
            .duration(1000)
            .attr('width', d => x(d.Abundance))
            .delay((d, i) => i * 75);

        // Fix title position
        title.attr('transform', `translate(${(getSVGWidth(xAxis) - getSVGWidth(title)) / 2},${-10})`);

        // Set chart dimension
        chart.attr('width', width)
            .attr('height', height);

        // Set chart viewBox
        setViewBoxAttr(chart);
    }
};

$(document).ready(async function () {
    object.rawData = await d3.csv('/first-assignment/csv/geo_data_trees_neighborhoods.csv');

    $(window).resize(function () {
        if (currentWidth !== window.innerWidth) {
            currentWidth = window.innerWidth;
            $(multiContainer).html('');
            object.getSubgroups().forEach(function (category, i) {
                object.drawChart(multiContainer, category, i === 0);
            });
        }
    });

    $(window).resize();
});
