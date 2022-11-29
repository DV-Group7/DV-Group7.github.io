const object = {
    rawData: [],
    getSubgroups: function () {
        return object.rawData.columns.slice(1);
    },
    drawChart: function (selector, nBin) {
        // Copy data
        let data = [];
        this.rawData.forEach((row, index) => {
            data[index] = { ...row };
        });

        // Set chart dimensions
        const height = 600;
        const width = getElementWidth(selector);

        // Fix the number of bins
        if (nBin < 1) {
            nBin = 1;
        }
        else if (nBin > data.length) {
            nBin = data.length;
        }

        const element = d3.select(selector);

        let chart = null;
        let yAxis = null;
        let yLabel = null;
        let xAxis = null;
        let xLabel = null;
        let bars = null;

        const update = !element.select('svg').empty();

        if (!update) {
            // Add chart svg
            chart = element
                .append('svg')
                .attr('class', 'histogram-chart');

            yAxis = chart.append('g')
                .attr('class', 'y-axis');

            // Add Y label
            yLabel = chart.append('g')
                .attr('class', 'y-label')
                .attr('font-size', '15');

            yLabel.append('text')
                .text('Abundance [unit]')
                .attr("y", -30);;

            xAxis = chart.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0,${height})`);

            // Add X label
            xLabel = chart.append('g')
                .attr('class', 'x-label')
                .attr('font-size', '15');

            xLabel.append('text')
                .text('Height [m]')
                .attr("y", 30);;

            bars = chart.append('g')
                .attr('class', 'bars');
        }
        else {
            chart = element.select('svg');
            yAxis = chart.select('.y-axis');
            yLabel = chart.select('.y-label');
            xAxis = chart.select('.x-axis');
            xLabel = chart.select('.x-label');
            bars = chart.select('.bars');
        }

        // Add Y axis
        const y = d3.scaleLinear()
            .range([height, 0]);

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d.Height)])
            .range([0, width]);

        // Set the parameters for the histogram
        const histogram = d3.bin()
            .value(d => d.Height)
            .domain(x.domain())
            .thresholds(x.ticks(nBin));

        const bins = histogram(data);

        // Update Y domain
        y.domain([0, d3.max(bins, d => d.length)]);

        // Draw axis
        yAxis.call(d3.axisLeft(y).tickSizeOuter(0));
        xAxis.call(d3.axisBottom(x).tickSizeOuter(0));

        // Show the bars
        bars.selectAll('rect')
            .data(bins)
            .join('rect')
            .attr('fill', '#69b3a2')
            .attr('y', d => height)
            .attr('height', d => 0)
            .attr('x', d => x(d.x0))
            .attr('width', d => x(d.x1) - x(d.x0) - 1);

        // Animation
        bars.selectAll('rect')
            .transition()
            .duration(1000)
            .attr('y', d => y(d.length))
            .attr('height', d => height - y(d.length))
            .delay((d, i) => i * 10);

        if (!update) {
            // Fix labels position
            yLabel.attr('transform', `translate(${-getSVGWidth(yAxis) - 10},${(getSVGHeight(yAxis) + getSVGWidth(yLabel)) / 2}) rotate(-90)`);
            xLabel.attr('transform', `translate(${(getSVGWidth(xAxis) - getSVGWidth(xLabel)) / 2},${getSVGHeight(yAxis) + getSVGHeight(xLabel) + 10})`);

            // Set chart dimension
            chart.attr('width', width)
                .attr('height', height);
        }

        // Set chart viewBox
        setViewBoxAttr(chart);
    }
};

$(document).ready(async function () {
    const nBinInput = $('#nBin');

    object.rawData = await d3.csv('../csv/geo_data_trees_list.csv');

    $(window).resize(function () {
        if (currentWidth !== window.innerWidth) {
            currentWidth = window.innerWidth;
            $(singleContainer).html('');
            nBinInput.trigger('change');
        }
    });

    nBinInput.attr('max', object.rawData.length)
        .attr('value', 20)
        .on('change', (e) => {
            object.drawChart(singleContainer, nBinInput.val());
        });

    $(window).resize();
});
