const object = {
    rawData: [],
    drawChart: function (selector) {
        // Copio i dati
        let data = [];
        this.rawData.forEach((row, index) => {
            data[index] = parseFloat(row.Height);
        });

        // Set chart dimensions
        const height = 600;
        const width = getElementWidth(selector);

        // Compute summary statistics used for the box:
        const dataSorted = data.sort(d3.ascending);
        const q1 = d3.quantile(dataSorted, .25);
        const median = d3.quantile(dataSorted, .5);
        const q3 = d3.quantile(dataSorted, .75);
        const interQuantileRange = q3 - q1;
        const min = q1 - 1.5 * interQuantileRange;
        const max = q1 + 1.5 * interQuantileRange;

        // Add chart svg
        const chart = d3.select(selector)
            .append('svg')
            .attr('class', 'boxplot-chart');

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([min * 1.75, max * 1.25])
            .range([height, 0]);

        const yAxis = chart.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y).tickSizeOuter(0));

        // Add Y label
        const yLabel = chart.append('g')
            .attr('class', 'y-label')
            .attr('font-size', '15');

        yLabel.append('text')
            .text('Height [m]');

        // a few features for the box
        const center = 200;
        const widthBox = 100;

        const box = chart.append('g');

        // Show the main vertical line
        box.append('line')
            .attr('x1', center)
            .attr('x2', center)
            .attr('y1', y(min))
            .attr('y2', y(max))
            .attr('stroke', 'black');

        // Show the box
        box.append('rect')
            .attr('x', center - widthBox / 2)
            .attr('y', y(q3))
            .attr('height', (y(q1) - y(q3)))
            .attr('width', widthBox)
            .attr('stroke', 'black')
            .style('fill', '#69b3a2');

        // Show median, min and max horizontal lines
        box.selectAll('g')
            .data([min, median, max])
            .join('line')
            .attr('x1', center - widthBox / 2)
            .attr('x2', center + widthBox / 2)
            .attr('y1', function (d) { return (y(d)); })
            .attr('y2', function (d) { return (y(d)); })
            .attr('stroke', 'black');

        // Fix labels position
        yLabel.attr('transform', `translate(${-getSVGWidth(yAxis) - 10},${(getSVGHeight(yAxis) + getSVGWidth(yLabel)) / 2}) rotate(-90)`);

        // Set chart dimension
        chart.attr('width', width)
            .attr('height', height);

        // Set chart viewBox
        setViewBoxAttr(chart);
    }
};

$(document).ready(async function () {
    object.rawData = await d3.csv('/second-assignment/csv/geo_data_trees_list.csv');

    $(window).resize(function () {
        if (currentWidth !== window.innerWidth) {
            currentWidth = window.innerWidth;
            $(singleContainer).html('');
            object.drawChart(singleContainer);
        }
    });

    $(window).resize();
});
