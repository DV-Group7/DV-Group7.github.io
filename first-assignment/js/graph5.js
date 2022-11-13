const enableAnimation = false;

const listNeighborhoods = '.list-neighborhoods';

const object = {
    rawData: [],
    getNeighborhoodData: function (neighborhood) {
        let data = [];
        this.rawData.forEach(function (row) {
            if (row.Neighborhood === neighborhood) {
                Object.keys(row).slice(1, 6).forEach(function (tree) {
                    data.push({ 'Tree': tree, 'Abundance': parseInt(row[tree]) });
                });
            }
        });
        return data;
    },
    drawChart: function (selector, neighborhood, full) {
        const widthSquares = 10,
            heightSquares = 10,
            squareSize = 20,
            gap = 2;

        const neighborhoodData = this.getNeighborhoodData(neighborhood);

        let total = d3.sum(neighborhoodData, function (d) { return d.Abundance; });

        if (!total || !selector) {
            return;
        }

        // Calculate square value
        let squareValue = total / (widthSquares * heightSquares);

        // Copy data and fix it
        let data = [];
        for (let i = 0; i < neighborhoodData.length; i++) {
            data[i] = { ...neighborhoodData[i] };

            let unit = parseFloat((data[i].Abundance / squareValue).toFixed(10));
            let integer = Math.floor(unit);

            // Add info about values
            data[i]['Integer'] = integer;
            data[i]['Decimal'] = parseFloat((unit - integer).toFixed(10));
        }

        // Order by decimal
        data.sort(function (a, b) {
            return b.Decimal - a.Decimal;
        });

        let tot = d3.sum(data, function (d) { return d.Integer; });

        // Add unit to reach total
        for (let i = 0; i < 100 - tot; i++) {
            data[i].Integer += 1;
        }

        // Create waffle squares
        let waffleSquares = [];
        data.forEach(function (d, i) {
            waffleSquares = waffleSquares.concat(
                Array(d.Integer + 1).join(1).split('').map(function () {
                    return {
                        Units: d.Integer,
                        Abundance: d.Abundance,
                        Tree: d.Tree,
                        Random: numberToWords.toWords((Math.random() * 5).toFixed(0))
                    };
                })
            );
        });

        // Set chart dimensions
        const width = (squareSize * widthSquares) + widthSquares * gap;
        const height = (squareSize * heightSquares) + heightSquares * gap;

        if (!full) {
            // Wrap selector in a div
            selector = d3.select(selector)
                .append('div')
                .attr('class', 'container')
                .node();
        }

        // Add tooltip
        const tooltip = d3.select(selector)
            .append('div')
            .attr('class', 'tooltip')
            .style('display', 'none');

        // Set fixed order to keep same colors on each iteration
        const color = getTreeColors(data.map(d => d.Tree));

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

            // Set opacity to other rects
            d3.selectAll('.myRect').style('opacity', 0.2);
            // Show 'subgroupName' rect
            d3.selectAll(`.${sanitizeString(d.Tree)}`).style('opacity', 1);

            // Show tooltip
            tooltip.html(`${d.Tree}: ${d.Abundance} (${d.Units}%)`)
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

        // Show all waffle chats
        d3.selectAll('.waffle-chart')
            .style('display', 'block');

        // Hide same waffle chart
        d3.selectAll(`.${sanitizeString(neighborhood)}`)
            .style('display', 'none');

        // Add chart svg
        const chart = d3.select(selector)
            .append('svg')
            .attr('class', d => `waffle-chart ${sanitizeString(neighborhood)}`);

        // Add title
        const title = chart.append('g')
            .attr('class', 'title')
            .attr('font-size', '15');

        title.append('text')
            .text(neighborhood);

        // Show squares
        chart.append('g')
            .attr('transform', `translate(${width},${getSVGHeight(title) / 2}) rotate(90)`)
            .selectAll('div')
            .data(waffleSquares)
            .enter()
            .append('rect')
            .attr('class', d => `myRect ${sanitizeString(d.Tree)} ${sanitizeString(d.Random)}`)
            .attr('height', squareSize)
            .attr('fill', d => color(d.Tree))
            .attr('x', (d, i) => {
                let col = Math.floor(i / heightSquares);
                return (col * squareSize) + (col * gap);
            })
            .attr('y', (d, i) => {
                let row = i % heightSquares;
                return (heightSquares * squareSize) - ((row * squareSize) + (row * gap));
            })
            .attr('width', squareSize)
            .attr('stroke', 'black')
            .attr('stroke-width', '.5')
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);

        // Fix title position
        title.attr('transform', `translate(${(width - getSVGWidth(title)) / 2},${-5})`);

        // Set chart dimension
        chart.attr('width', width)
            .attr('height', height);

        // Set chart viewBox
        setViewBoxAttr(chart);

        // Animation
        if (enableAnimation) {
            let randoms = [];
            waffleSquares.forEach((d) => {
                if (!randoms.find(random => random === d.Random)) {
                    randoms.push(d.Random);
                }
            });

            randoms.forEach((random) => {
                chart.selectAll('.' + sanitizeString(random))
                    .attr('width', 0)
                    .transition()
                    .duration(100)
                    .attr('width', squareSize)
                    .delay((d, i) => i * 75);
            });
        }

        if (full) {
            // Add legend svg
            const legend = d3.select(selector)
                .append('svg')
                .attr('class', d => 'legend');

            const rows = legend.selectAll('g')
                .data(neighborhoodData)
                .join('g')
                .attr('transform', (d, i) => `translate(0,${i * 20})`);

            rows.append('rect')
                .attr('width', 18)
                .attr('height', 18)
                .style('fill', d => color(d.Tree));

            rows.append('text')
                .attr('x', 25)
                .attr('y', 15)
                .text(d => d.Tree);

            // Fix svg dimension
            legend.attr('width', width)
                .attr('height', getBBoxHeight(legend));

            // Set chart viewBox
            setViewBoxAttr(legend);
        }
    }
};

$(document).ready(async function () {
    object.rawData = await d3.csv('/first-assignment/csv/geo_data_trees_neighborhoods.csv');

    // Disegno la lista delle circoscrizioni
    object.rawData.forEach((row, index) => {
        // Estraggo i dati relativi alla circoscrizione
        let data = object.getNeighborhoodData(row.Neighborhood);
        // Verifico se la circoscrizione contiene alberi al suo interno
        let total = d3.sum(data, function (d) { return d.Abundance; });

        if (total > 0) {
            // Se ci sono alberi allora creo il selettore
            const input = $(document.createElement('input'))
                .attr('type', 'radio')
                .attr('name', 'neighborhood')
                .attr('value', row.Neighborhood)
                .attr('id', row.Neighborhood)
                .on('change', (e) => {
                    $(singleContainer).html('');
                    object.drawChart(singleContainer, $(e.target).attr('value'), true);
                });

            if (!index) {
                input.attr('checked', '');
            }

            const label = $(document.createElement('label'))
                .attr('for', row.Neighborhood)
                .html(`${row.Neighborhood}<br>`);

            $(listNeighborhoods).append(input);
            $(listNeighborhoods).append(label);
        }
    });

    // Disegno i grafici di tutte le circoscrizioni
    object.rawData.forEach(function (d) {
        object.drawChart(multiContainer, d.Neighborhood);
    });

    // Disegno la prima circoscrizione della lista
    $(listNeighborhoods).find('input').first().trigger('change');
});
