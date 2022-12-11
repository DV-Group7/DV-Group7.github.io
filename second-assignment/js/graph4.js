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

        return categories.sort((a, b) => a.Abundance > b.Abundance ? -1 : 1).slice(0, 6).map(d => d.Name);
    },
    drawChart: function (selector, category) {
        const subgroups = this.getCategories();

        let data = [];
        this.rawData.forEach(function (row) {
            if (row.Name === category) {
                data.push(row);
            }
        });

        // Set chart dimensions
        const height = 400;
        const width = 400;

        // Add tooltip
        const tooltip = d3.select(selector)
            .append('div')
            .attr('class', 'tooltip')
            .style('display', 'none');

        // Add chart svg
        const chart = d3.select(selector)
            .append('svg')
            .attr('class', 'scatterplot-chart');

        // Add title
        const title = chart.append('g')
            .attr('class', 'title')
            .attr('font-size', '15');

        title.append('text')
            .text(category);

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, 8000])
            .range([height, 0]);

        const yAxis = chart.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y).tickSizeOuter(0));

        // Add Y label
        const yLabel = chart.append('g')
            .attr('class', 'y-label')
            .attr('font-size', '15');

        yLabel.append('text')
            .text('Carbon storage [kg]')
            .attr("y", -20);;

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, 40])
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
            .text('Height [m]')
            .attr("y", 20);;

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
            tooltip.html(`Carbon storage (kg): ${d.Carbon}<br/>Height (m): ${d.Height}`)
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

        // Set fixed order to keep same colors on each iteration
        const color = getTreeColors(subgroups);

        // Show the dots
        chart.append('g')
            .attr('class', 'dots')
            .selectAll('g')
            .data(data)
            .join('circle')
            .attr('cx', d => x(d.Height))
            .attr('cy', d => y(d.Carbon))
            .attr('r', 3)
            .attr('fill', color(category))
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);

        // Fix title position
        title.attr('transform', `translate(${(getSVGWidth(xAxis) - getSVGWidth(title)) / 2},${-10})`);

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
    object.rawData = await d3.csv('../csv/geo_data_trees_list.csv');

    $(window).resize(function () {
        if (currentWidth !== window.innerWidth) {
            currentWidth = window.innerWidth;
            $(multiContainer).html('');
            object.getCategories().forEach(function (category) {
                object.drawChart(multiContainer, category);
            });
        }
    });

    $(window).resize();
});
