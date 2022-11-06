const waffleObject = {
    rawData: [],
    generateColor: d3.scaleOrdinal().range(['#A63CB3', '#FD4B84', '#FA9832', '#31EE82', '#28A2DC', '#5366D7']),
    getNeighborhoodData: function (neighborhood) {
        let data = []
        this.rawData.forEach(function (row) {
            if (row.Neighborhood === neighborhood) {
                Object.keys(row).slice(1, 6).forEach(function (tree) {
                    data.push({ 'Tree': tree, 'Abundance': parseInt(row[tree]) });
                })
            }
        });
        return data;
    },
    drawChart: function (selector, neighborhood, clean) {
        let width,
            height,
            widthSquares = 10,
            heightSquares = 10,
            squareSize = 20,
            gap = 2;

        let data = this.getNeighborhoodData(neighborhood);

        let total = d3.sum(data, function (d) { return d.Abundance; });

        if (!total || !selector) {
            return;
        }

        //value of a square
        let squareValue = total / (widthSquares * heightSquares);

        for (let i = 0; i < data.length; i++) {
            let unit = parseFloat((data[i].Abundance / squareValue).toFixed(10));
            let integer = Math.floor(unit);

            data[i]['Integer'] = integer;
            data[i]['Decimal'] = parseFloat((unit - integer).toFixed(10));
        }

        data.sort(function (a, b) {
            return b.Decimal - a.Decimal;
        });

        let tot = d3.sum(data, function (d) { return d.Integer; });

        for (let i = 0; i < 100 - tot; i++) {
            data[i].Integer += 1
        }

        //remap waffle
        let waffleData = [];
        data.forEach(function (d, i) {
            waffleData = waffleData.concat(
                Array(d.Integer + 1).join(1).split('').map(function () {
                    return {
                        Units: d.Integer,
                        Abundance: d.Abundance,
                        Tree: d.Tree
                    };
                })
            );
        });

        width = (squareSize * widthSquares) + widthSquares * gap;
        height = (squareSize * heightSquares) + heightSquares * gap;

        const waffle = d3.select(selector);

        if (clean) {
            waffle.html('')
        }

        waffle
            .append("div")
            .style("width", "250px")
            .text(neighborhood)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "rotate(90)")
            .append("g")
            .selectAll("div")
            .data(waffleData)
            .enter()
            .append("rect")
            .attr("width", squareSize)
            .attr("height", squareSize)
            .attr("fill", d => this.generateColor(d.Tree))
            .attr("x", function (d, i) {
                //group n squares for column
                col = Math.floor(i / heightSquares);
                return (col * squareSize) + (col * gap);
            })
            .attr("y", function (d, i) {
                row = i % heightSquares;
                return (heightSquares * squareSize) - ((row * squareSize) + (row * gap))
            })
            .append("title")
            .text(function (d, i) {
                return d.Tree + ": " + d.Abundance + " (" + d.Units + "%)"
            });
    },
    drawLegend: function (selector, neighborhood) {
        if (!selector) {
            return;
        }

        let data = this.getNeighborhoodData(neighborhood);

        //add legend with categorical waffle
        const legend = d3.select(selector)
            .html('')
            .append("svg")
            .style('padding-top', '2rem')
            .attr('width', 270)
            .attr('height', 100)
            .append('g')
            .selectAll("div")
            .data(data)
            .enter()
            .append("g")
            .attr('transform', (d, i) => "translate(0," + i * 20 + ")");

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => this.generateColor(d.Tree));

        legend.append("text")
            .attr("x", 25)
            .attr("y", 13)
            .text(d => d.Tree);
    },
    //DISEGNA LA LISTA CON I BOTTONI
    drawNeighborhoods: function (selector) {
        this.rawData.forEach((row, index) => {
            // Estraggo i dati relativi alla circoscrizione
            let data = this.getNeighborhoodData(row.Neighborhood);
            // Verifico se la circoscrizione contiene alberi al suo interno
            let total = d3.sum(data, function (d) { return d.Abundance; });

            if (total > 0) {
                // Se ci sono alberi allora creo il selettore
                const input = $(document.createElement("input"))
                    .attr('type', 'radio')
                    .attr('name', 'neighborhood')
                    .attr('value', row.Neighborhood)
                    .attr('id', row.Neighborhood)
                    .on('change', (e) => {
                        this.drawChart('.chart', $(e.currentTarget).attr('value'), true)
                        this.drawLegend('.legend', row.Neighborhood)
                    })

                if (index == 0) {
                    input.attr('checked', '')
                }

                const label = $(document.createElement("label"))
                    .attr('for', row.Neighborhood)
                    .html(row.Neighborhood + '<br>')

                $(selector).append(input);
                $(selector).append(label);
            }
        });
    }
};

$(document).ready(async function () {
    waffleObject.rawData = await d3.csv("/csv/geo_data_trees_neighborhoods.csv")

    waffleObject.rawData.forEach(function (d) {
        waffleObject.drawChart('.all-charts', d.Neighborhood);
    });

    waffleObject.drawNeighborhoods('.neighborhoods')

    $('.neighborhoods').find('input').first().trigger('change');
});
