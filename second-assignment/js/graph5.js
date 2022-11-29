const object = {
    rawData: [],
    getCategories: function () {
        return this.rawData.sort((a, b) => +a.Abundance > +b.Abundance ? -1 : 1).map(d => d.Name);
    },
    drawChart: function (selector, nTree) {
        const subgroups = this.getCategories();

        // Copio i dati
        let data = [];
        this.rawData.forEach(row => {
            let obj = { ...row };
            // Converti i valori numerici
            Object.keys(row).forEach((key) => {
                let value = parseFloat(obj[key]);
                if (!isNaN(value)) {
                    obj[key] = value;
                }
            });
            // Inserisco l'oggetto nella lista
            data.push(obj);
        });

        // Riordino i dati in base alla quantità
        data.sort((a, b) => (b.Abundance - a.Abundance ? -1 : 1));

        // Set chart dimensions
        const height = 600;
        const width = getElementWidth(selector);

        // Fix the number of trees
        if (nTree < 1) {
            nTree = 1;
        }
        else if (nTree > data.length) {
            nTree = data.length;
        }

        // Taglio e tengo solo i primi nTrees alberi
        let newData = data.slice(0, nTree);

        // Valore massimo scala delle X
        const xMax = d3.max(newData, d => d.Height);
        // Valore massimo scala delle Y
        const yMax = d3.max(newData, d => d.Carbon);
        // Valore massimo scala delle Z
        const zMax = d3.max(newData, d => d.Canopy);

        const element = d3.select(selector);

        let tooltip = null;
        let chart = null;
        let yAxis = null;
        let yLabel = null;
        let xAxis = null;
        let xLabel = null;
        let dots = null;

        const update = !element.select('svg').empty();

        if (!update) {
            // Add tooltip
            tooltip = d3.select(selector)
                .append('div')
                .attr('class', 'tooltip')
                .style('display', 'none');

            // Add chart svg
            chart = element
                .append('svg')
                .attr('class', 'bubble-chart');

            yAxis = chart.append('g')
                .attr('class', 'y-axis');

            // Add Y label
            yLabel = chart.append('g')
                .attr('class', 'y-label')
                .attr('font-size', '15');

            yLabel.append('text')
                .text('Carbon storage [kg]')
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

            dots = chart.append('g')
                .attr('class', 'dots');
        }
        else {
            tooltip = element.select('.tooltip');
            chart = element.select('svg');
            yAxis = chart.select('.y-axis');
            yLabel = chart.select('.y-label');
            xAxis = chart.select('.x-axis');
            xLabel = chart.select('.x-label');
            dots = chart.select('.dots');
        }

        // Tooltip timeout
        let timeout = null;

        // Clear tooltip timeout
        const removeTimeout = () => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        };

        const mouseover = function (event, d) {
            removeTimeout();

            tooltip.html(`Tree: ${d.Name}<br>Abundance: ${d.Abundance}<br>Canopy size (avg.): ${d.Canopy.toFixed(2)} m<sup>2</sup><br>Carbon storage (avg.): ${d.Carbon.toFixed(2)} kg`)
                .style('display', 'block');
        };

        const mousemove = function (event, d) {
            d3.select(event.target)
                .attr('stroke-width', '1');

            tooltip.style('left', `${event.x}px`)
                .style('top', `${event.y - (parseFloat(tooltip.style('height')) * 5 / 4)}px`);
        };

        const mouseleave = function (event, d) {
            removeTimeout();

            // Add Tooltip timeout
            timeout = setTimeout(() => {
                d3.select(event.target)
                    .attr('stroke-width', '0');

                tooltip.style('display', 'none');
            }, 150);
        };

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0 - (yMax / 20), yMax + (yMax / 20)])
            .range([height, 0]);

        yAxis.call(d3.axisLeft(y).tickSizeOuter(0));

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0 - (xMax / 20), xMax + (xMax / 20)])
            .range([0, width]);

        xAxis.call(d3.axisBottom(x).tickSizeOuter(0));

        // Add a scale for bubble size
        const z = d3.scaleLinear()
            .domain([0 - (zMax / 20), zMax + (zMax / 20)])
            .range([4, 20]);

        // Color palette
        const color = function (d) {
            return d3.interpolateWarm(subgroups.indexOf(d.Name) / subgroups.length);
        };

        // Add dots
        dots.selectAll('circle')
            .data(newData)
            .join('circle')
            .attr('class', 'bubbles')
            .attr('stroke', 'black')
            .attr('stroke-width', '0')
            .attr('cx', d => x(d.Height))
            .attr('cy', d => y(d.Carbon))
            .attr('r', d => z(d.Canopy))
            .style('fill', d => color(d))
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);

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
    const nTreeInput = $('#nTree');

    object.rawData = await d3.csv('../csv/geo_data_trees_categories_v2.csv');

    $(window).resize(function () {
        if (currentWidth !== window.innerWidth) {
            currentWidth = window.innerWidth;
            $(singleContainer).html('');
            nTreeInput.trigger('change');
        }
    });

    nTreeInput.attr('max', object.rawData.length)
        .attr('value', object.rawData.length)
        .on('change', (e) => {
            object.drawChart(singleContainer, nTreeInput.val());
        });

    $(window).resize();
});
