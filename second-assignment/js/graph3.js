const object = {
    rawData: [],
    getCategories: function () {
        let categories = [];

        this.rawData.forEach(function (row) {
            // Copio i dati
            let obj = { 'Name': row.Name, 'Abundance': 1 };

            // Cerco nei dati se esiste già quella specie di albero
            let element = categories.find((e) => e.Name === obj.Name);

            if (element) {
                element.Abundance++;
            }
            else {
                // Aggiungo il nuovo elemento
                categories.push(obj);
            }
        });

        return categories.sort((a, b) => a.Abundance > b.Abundance ? -1 : 1).map(d => d.Name);
    },
    drawChart: function (selector) {
        const dotSize = 3, dotSelectedSize = 7;

        const subgroups = this.getCategories();

        // Copio i dati
        let data = [];
        this.rawData.forEach((row, index) => {
            data[index] = { ...row };
        });

        // Set chart dimensions
        const height = 600;
        const width = getElementWidth(selector);

        // Add tooltip
        const tooltip = d3.select(selector)
            .append('div')
            .attr('class', 'tooltip')
            .style('display', 'none');

        // Add chart svg
        const chart = d3.select(selector)
            .append('svg')
            .attr('class', 'scatterplot-chart');

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d.Carbon)])
            .range([height, 0]);

        const yAxis = chart.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y).tickSizeOuter(0));

        // Add Y label
        const yLabel = chart.append('g')
            .attr('class', 'y-label')
            .attr('font-size', '15');

        yLabel.append('text')
            .text('Carbon storage [kg]');

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d.Height)])
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
            .text('Height [m]');

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

            // Set opacity to other circle
            d3.selectAll('.myDot')
                .style('opacity', 0.2)
                .attr("r", dotSize);

            // Show 'subgroupName' circle
            d3.selectAll(`.${sanitizeString(d.Name)}`)
                .style('opacity', 1)
                .attr("r", dotSelectedSize);

            // Show tooltip
            tooltip.html("Tree: " + d.Name + "<br> Carbon storage (kg): " + d.Carbon)
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
                // Show all rect
                d3.selectAll('.myDot')
                    .style('opacity', 1)
                    .attr("r", dotSize);

                tooltip.style('display', 'none');
            }, 150);
        };

        // Color palette
        const color = function (d) {
            return d3.interpolateWarm(subgroups.indexOf(d.Name) / subgroups.length);
        };

        // Show the dots
        chart.append('g')
            .attr('class', 'dots')
            .selectAll('g')
            .data(data)
            .join('circle')
            .attr('class', d => `myDot ${sanitizeString(d.Name)}`)
            .attr('cx', d => x(d.Height))
            .attr('cy', d => y(d.Carbon))
            .attr('r', dotSelectedSize)
            .attr('fill', d => color(d))
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);

        // Fix labels position
        yLabel.attr('transform', `translate(${-getSVGWidth(yAxis) - 10},${(getSVGHeight(yAxis) + getSVGWidth(yLabel)) / 2}) rotate(-90)`);
        xLabel.attr('transform', `translate(${(getSVGWidth(xAxis) - getSVGWidth(xLabel)) / 2},${getSVGHeight(yAxis) + getSVGHeight(xLabel) + 10})`);

        // Set chart dimension
        chart.attr('width', width)
            .attr('height', height);

        // Set chart viewBox
        setViewBoxAttr(chart);

        // Set correct dots size
        chart.selectAll('.myDot')
            .attr('r', dotSize);
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
