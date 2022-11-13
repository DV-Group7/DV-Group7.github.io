const object = {
    rawData: [],
    drawChart: function (selector) {
        // Copy data and fix it
        let data = [];
        this.rawData.forEach((row, index) => {
            data[index] = { ...row };
            data[index].Abundance = parseInt(data[index].Abundance);
            data[index].Canopy = parseFloat(data[index].Canopy).toFixed(2);
        });

        // Sort data
        data.sort((a, b) => b.Abundance - a.Abundance);

        // Slice data
        data.length = 25;

        // Set chart dimensions
        const height = getHorizontalChartHeight(data);
        const width = getElementWidth(selector);

        // Add tooltip
        const tooltip = d3.select(selector)
            .append('div')
            .attr('class', 'tooltip')
            .style('display', 'none');

        // Add chart svg
        const chart = d3.select(selector)
            .append('svg')
            .attr('class', 'bar-chart');

        // Add Y axis
        const y = d3.scaleBand()
            .domain(data.map(d => d.Name))
            .range([0, height])
            .padding([0.1]);

        const yAxis = chart.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y).tickSizeOuter(0));

        // Add Y label
        const yLabel = chart.append('g')
            .attr('class', 'y-label')
            .attr('font-size', '15');

        yLabel.append('text')
            .text('Tree');

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.Abundance)])
            .range([0, width]);

        const xAxis = chart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        // Add X label
        const xLabel = chart.append('g')
            .attr('class', 'x-label')
            .attr('font-size', '15');

        xLabel.append('text')
            .text('Abundance [unit]');

        // Color palette
        const color = d3.scaleSequential()
            .domain([0, 100])
            .interpolator(d3.interpolateRainbow);

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
            tooltip.html(`Abundance: ${d.Abundance}<br>Canopy (avg.): ${d.Canopy} m<sup>2</sup>`)
                .style('display', 'block');
        };

        const mousemove = (event, d) => {
            // Move tooltip near mouse pointer
            tooltip.style('left', `${event.x}px`)
                .style('top', `${event.y - (parseFloat(tooltip.style('height')) * 3 / 2)}px`);
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
            .attr('fill', d => color(Math.floor(d.Abundance) / d3.max(data, d => d.Abundance) * 100))
            .attr('x', d => x(0))
            .attr('y', d => y(d.Name))
            .attr('height', d => y.bandwidth())
            .attr('stroke', 'black')
            .attr('stroke-width', '.5')
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);

        // Animation
        chart.selectAll('rect')
            .transition()
            .duration(1000)
            .attr('width', d => x(d.Abundance))
            .delay((d, i) => i * 75);

        // Fix labels position
        yLabel.attr('transform', `translate(${-getSVGWidth(yAxis) - 10},${(getSVGHeight(yAxis) + getSVGWidth(yLabel)) / 2}) rotate(-90)`);
        xLabel.attr('transform', `translate(${(getSVGWidth(xAxis) - getSVGWidth(xLabel)) / 2},${getSVGHeight(yAxis) + getSVGHeight(xLabel) + 10})`);

        // Set chart dimension
        chart.attr('width', width)
            .attr('height', height);

        // Set chart viewBox
        setViewBoxAttr(chart);
    }
};

$(document).ready(async function () {
    object.rawData = await d3.csv('/first-assignment/csv/geo_data_trees_categories.csv');

    $(window).resize(function () {
        if (currentWidth !== window.innerWidth) {
            currentWidth = window.innerWidth;
            $(singleContainer).html('');
            object.drawChart(singleContainer);
        }
    });

    $(window).resize();
});
