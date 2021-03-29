// radius of the pie chart = half the width or half the height (smallest one)
const radius = Math.min(graph_2_width, graph_2_height) / 2 - 40;

// location and window setup
let svg = d3.select("#graph2")
    .append("svg")
    .attr("width", 450)
    .attr("height", 450)
    .append("g")
    .attr("transform", `translate(${(graph_2_width - margin.left - margin.right - 70)/2}, ${graph_2_height/2})`);

// div for tooltip
const div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// chart title
let title = svg.append("text")
    .attr("transform", `translate(0, -110)`)
    .style("text-anchor", "middle")
    .style("font-size", 15);

// handle button click
function setGraph2(region) {
    // update title
    const t = region.split("_");
    title.text(`${t[0]} ${t[1]} for Each Genre (in millions)`);

    d3_data.then(data => {
        let genre_data = {};
        let i, d;
        for (i = 0; i < data.length; i++) {
            d = data[i];
            if (d.Genre in genre_data) {
                genre_data[d.Genre] += parseFloat(d[region]);
            } else {
                genre_data[d.Genre] = parseFloat(d[region]);
            }
        }

        // Compute the position of each group on the pie
        let pie = d3.pie().value(d => d.value)
        const pie_data = pie(d3.entries(genre_data)
            .sort((a,b) => a.value-b.value))

        // color scale for the pie chart
        let color = d3.scaleOrdinal()
            .range(d3.quantize(d3.interpolateHcl("#9ccaff", "#21b7b9"), 12));

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        let pie_graph = svg.selectAll('pie').data(pie_data);
        pie_graph.enter()
            .append('path')
            .attr('d', d3.arc()
                .innerRadius(radius*0.5)
                .outerRadius(radius))
            .attr('fill', function(d){ return(color(d.data.key)) })
            .attr("stroke", "white")
            .style("stroke-width", "0.5px")
            .style("opacity", 1)

            // event handler for mouse over
            .on("mouseover", (d,i) => {
                div.transition()
                    .duration(50)
                    .style("opacity", 1);
                div.html(`${d.data.key}: ${parseInt(d.data.value)}`)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 10) + "px");
            })

            // event handler for mouse out
            .on("mouseout", (d, i) => {
                d3.transition()
                .duration('50')
                .attr('opacity', '1');
                div.transition()
                    .duration('50')
                    .style("opacity", 0);
            });
        pie_graph.exit().remove();

    });
};

// default graph
setGraph2('Global_Sales');
