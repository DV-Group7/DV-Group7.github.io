$(document).ready(function () {

  // Set the dimensions and margins of the graph
  const margin = { top: 30, right: 30, bottom: 30, left: 50 },
    width = 800 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

  // Call first year
  drawCharts(1993, margin, width, height)

  // General call
  addEventListener("click", function (e) {
    let f = document.getElementById("cars");
    drawCharts(f.value, margin, width, height)
  })
})

// Function for draw the chart
function drawCharts(value, margin, width, height) {

  //Array with month's name
  let month = ["January", "February", "March", "April", "May", "June", "July"
    , "August", "September", "October", "November", "December"]

  // Read the data
  d3.csv("../graph_3.csv").then(function (data) {

    //Auxiliary variables
    let a = 1;
    let dataFiltered = [];

    // Empty the SVG
    $(singleContainer).empty();

    // Set the legend
    const legendTop = d3.select(singleContainer)
      .append("svg")
      .attr("width", 1400)
      .attr("height", 50);

    // Minimun
    legendTop.append("text").attr("x", 515).attr("y", 10).text("Minimum temperature").style("font-size", "12px").attr("alignment-baseline", "middle")
    legendTop.append('circle')
      .attr('cx', 500)
      .attr('cy', 9)
      .attr('r', 7)
      .attr('fill', '#85C1E9');

    // Maximum
    legendTop.append("text").attr("x", 815).attr("y", 10).text("Maximum temperature").style("font-size", "12px").attr("alignment-baseline", "middle")
    legendTop.append('circle')
      .attr('cx', 800)
      .attr('cy', 9)
      .attr('r', 7)
      .attr('fill', '#E74C3C');

    for (let i = 0; i < 12; i++) {

      // Append the svg object to the body of the page
      const svg = d3.select(singleContainer)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Add the x Axis
      const x = d3.scaleLinear()
        .domain([-15, 45])
        .range([0, width]);
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      // Add the y Axis
      const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 0.25]);

      for (let j = 0; j < data.length - 1; j++) {
        if (data[j].yr == value) {
          dataFiltered.push(data[j])
        }
      }

      // Compute kernel density estimation
      const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(25))
      const density1 = kde(dataFiltered
        .filter(function (d) { return d.month === a.toString() })
        .map(function (d) { return d.min; }))
      const density2 = kde(dataFiltered
        .filter(function (d) { return d.month === a.toString() })
        .map(function (d) { return d.max; }))

      // Plot the area
      svg.append("path")
        .attr("class", "mypath")
        .datum(density1)
        .attr("fill", "#85C1E9")
        .attr("opacity", ".6")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.line()
          .curve(d3.curveBasis)
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
        );

      // Plot the area
      svg.append("path")
        .attr("class", "mypath")
        .datum(density2)
        .attr("fill", "#E74C3C")
        .attr("opacity", ".6")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.line()
          .curve(d3.curveBasis)
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
        );

      // Legend (month)
      svg.append("text").attr("x", 680).attr("y", 10).text(month[a - 1]).style("font-size", "12px").attr("alignment-baseline", "middle")
      a++;
    }
  })
}

// Function to compute density
function kernelDensityEstimator(kernel, X) {
  return function (V) {
    return X.map(function (x) {
      return [x, d3.mean(V, function (v) { return kernel(x - v); })];
    });
  };
}
function kernelEpanechnikov(k) {
  return function (v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}




