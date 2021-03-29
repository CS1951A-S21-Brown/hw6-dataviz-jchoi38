(function () {
    // location and window setup
    let width = graph_1_width,
        height = graph_1_height;

    let svg = d3.select("#graph1")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // x linear scale
    let x = d3.scaleLinear()
        .range([0, width - margin.left - margin.right]);

    // y lindear scale
    let y = d3.scaleBand()
        .range([0, height - margin.top - margin.bottom])
        .padding(0.1); 

    // Set up reference to count SVG group
    let countRef = svg.append("g");
    // Set up reference to y axis label to update text in setData
    let y_axis_label = svg.append("g");

    // x-axis label
    svg.append("text")
        .attr("transform", `translate(${(width - margin.left - margin.right) / 2},
        ${(height - margin.top - margin.bottom) + 10})`)
        .style("text-anchor", "middle")
        .text("Global Sales (in millions)");

    // y-axis label
    let y_axis_text = svg.append("text")
        .attr("transform", `translate(-50, 0)`)
        .style("text-anchor", "middle")
        .text("Game Names");

    // chart title
    let title = svg.append("text")
        .attr("transform", `translate(${(width - margin.left - margin.right) / 2}, -10)`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text(`Top 10 All-Time Ranking of Video Games`);

    // coloar scale
    let color = d3.scaleOrdinal()
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), 10));

    /**
     * Top 10 vidoes games of all time (rank = global sales)
     */
    d3_data.then(function(data) {

        // Clean and strip desired amount of data for barplot
        data = cleanData(data, function(a, b) {
            return parseFloat(b.Global_Sales) - parseFloat(a.Global_Sales);
        }, 10);

        // x axis domain with the max count of the provided data
        x.domain([0, d3.max(data, d => parseFloat(d.Global_Sales))]);

        // y axis domains with the desired attribute
        y.domain(data.map(d => d.Name));
        color.domain(data.map(function(d) { return d.Name }));

        // Render y-axis label
        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        /*
                1. Select all desired elements in the DOM
                2. Count and parse the data values
                3. Create new, data-bound elements for each data value
        */
        let bars = svg.selectAll("rect").data(data);

        // Render the bar elements on the DOM
        /*
                1. Take each selection and append a desired element in the DOM
                2. Merge bars with previously rendered elements
                3. For each data point, apply styling attributes to each element
        */
        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("fill", function(d) { return color(d.Name) })
            .attr("x", x(0))
            .attr("y", d => y(d.Name))
            .attr("width", d => x(parseFloat(d.Global_Sales, 10)))
            .attr("height",  y.bandwidth());

        /*
            In lieu of x-axis labels, we are going to display the count of the artist next to its bar on the
            bar plot. We will be creating these in the same manner as the bars.
        */
        let counts = countRef.selectAll("text").data(data);

        // Render the text elements on the DOM
        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", d => x(parseFloat(d.Global_Sales, 10))+10)
            .attr("y", d => y(d.Name) + 10) 
            .style("text-anchor", "start")
            .text(d => parseFloat(d.Global_Sales)); 

        // Remove elements not in use if fewer groups in new dataset
        bars.exit().remove();
        counts.exit().remove();
    });
})();

