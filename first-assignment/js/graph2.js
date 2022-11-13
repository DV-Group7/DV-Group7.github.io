const object = {
    rawData: [],
    getSubgroups: function () {
        return object.rawData.columns.slice(1);
    },
    drawChart: function (selector, percentage) {
        // Copy data
        let data = this.rawData.slice();

        const subgroups = this.getSubgroups();
        const groups = data.map(d => (d.Neighborhood));

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
            .domain(groups)
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
            .text('Neighborhood');

        // Calculate x max value
        const xMax = percentage ? 100 : d3.max(data, d => {
            let tot = 0;
            $(Object.values(d)).each(function (_, element) {
                tot += parseFloat(element) || 0;
            });
            return tot;
        });

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, xMax])
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
            .text(percentage ? 'Percentage' : 'Abundance [Unit]');

        // Color palette
        const color = getTreeColors(subgroups);

        if (percentage) {
            // Normalize the data
            $(data).each(function (_, d) {
                let tot = 0;
                for (let i in subgroups) {
                    let name = subgroups[i];
                    tot += +d[name];
                }
                // Now normalize
                for (let i in subgroups) {
                    let name = subgroups[i];
                    d[name] = d[name] / tot * 100;
                }
            });
        }

        // Stack per subgroup
        const stackedData = d3.stack()
            .keys(subgroups)
            (data);

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

            // Get tooltip data
            const target = d3.select(event.target).node().parentNode;
            const subgroupName = d3.select(target).datum().key;
            const subgroupValue = parseFloat(d.data[subgroupName]).toFixed(percentage ? 2 : 0);

            // Set opacity to other rects
            d3.selectAll('.myRect').style('opacity', 0.2);
            // Show 'subgroupName' rect
            d3.selectAll(`.${sanitizeString(subgroupName)}`).style('opacity', 1);

            // Show tooltip
            tooltip.html(`${subgroupName}: ${subgroupValue}${percentage ? '%' : ''}`)
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
                // Show all rect
                d3.selectAll('.myRect')
                    .style('opacity', 1);

                tooltip.style('display', 'none');
            }, 150);
        };

        // Show the bars
        chart.append('g')
            .attr('class', 'bars')
            .selectAll('g')
            .data(stackedData)
            .join('g')
            .attr('fill', d => color(d.key))
            .attr('class', d => `myRect ${sanitizeString(d.key)}`)
            .selectAll('rect')
            .data(d => d)
            .join('rect')
            .attr('x', d => x(d[0]))
            .attr('y', d => y(d.data.Neighborhood))
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
            .attr('width', d => x(d[1]) - x(d[0]))
            .delay((d, i) => i * 75);

        // Fix labels position
        yLabel.attr('transform', `translate(${-getSVGWidth(yAxis) - 10},${(getSVGHeight(yAxis) + getSVGWidth(yLabel)) / 2}) rotate(-90)`);
        xLabel.attr('transform', `translate(${(getSVGWidth(xAxis) - getSVGWidth(xLabel)) / 2},${getSVGHeight(yAxis) + getSVGHeight(xLabel) + 10})`);

        // Set chart dimension
        chart.attr('width', width)
            .attr('height', height);

        // Set chart viewBox
        setViewBoxAttr(chart);

        // Add legend svg
        const legend = d3.select(selector)
            .append('svg')
            .attr('class', d => 'legend');

        const rows = legend.selectAll('g')
            .data(subgroups)
            .join('g')
            .attr('transform', (d, i) => `translate(0,${i * 20})`);

        rows.append('rect')
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', (d, i) => color(i));

        rows.append('text')
            .attr('x', 25)
            .attr('y', 15)
            .text(d => d);

        // Set chart dimension
        legend.attr('width', width)
            .attr('height', getBBoxHeight(legend));

        // Set chart viewBox
        setViewBoxAttr(legend);
    }
};

$(document).ready(async function () {
    object.rawData = await d3.csv('/first-assignment/csv/geo_data_trees_neighborhoods.csv');

    $(window).resize(function () {
        if (currentWidth !== window.innerWidth) {
            currentWidth = window.innerWidth;
            $(singleContainer).html('');
            object.drawChart(singleContainer, $('.percentage').length);
        }
    });

    $(window).resize();
});
