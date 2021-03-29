// svg for graph3
let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// x-axis label
svg3.append("text")
    .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2},
        ${(graph_3_height - margin.top - margin.bottom) - 90})`)
    .style("text-anchor", "middle")
    .text("Global Sales (in millions)");

// y-axis label
let y_axis_text = svg3.append("text")
    .attr("transform", `translate(-50, 0)`)
    .style("text-anchor", "middle")
    .text("Game Names");

// x linear scale
let x = d3.scaleLinear()
    .range([0, graph_3_width - margin.left - margin.right]);

// y lindear scale
let y = d3.scaleBand()
    .range([0, graph_3_height - margin.top - margin.bottom - 100])
    .padding(0.1); 

// Set up reference to count SVG group
let countRef = svg3.append("g");
// Set up reference to y axis label to update text in setData
let y_axis_label = svg3.append("g");

// chart title
let title_3 = svg3.append("text")
    .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2}, -10)`)
    .style("text-anchor", "middle")
    .style("font-size", 15)

// top publishers for each genre
function setGraph3(genre) {
    d3_data.then(pre => {

        // filter data by genre
        let data = pre.filter(d => d.Genre == genre);

        // publisher -> sales sum, list of [name, global sales]
        let dict = {};
        let i, d;
        let top_publisher = data[0].Publisher;
        let max_count = 0;
        let sales_sum = 0;
        for (i = 0; i < data.length; i++) {
            d = data[i];
            let global_sales = parseFloat(d.Global_Sales);
            if (d.Publisher in dict) {
                dict[d.Publisher][0] += global_sales;
                dict[d.Publisher].push([d.Name, global_sales]);
            } else {
                dict[d.Publisher] = [global_sales, [d.Name, global_sales]];
            }

            // accumulate total sum
            sales_sum += global_sales;

            // find top publisher
            if (dict[d.Publisher][0] > max_count) {
                top_publisher = d.Publisher;
                max_count = dict[d.Publisher][0];
            }
        }
        // reduce by same game name and sum sales
        const games = dict[top_publisher].slice(1)
            .reduce((acc, curr) => {
                if (curr[0] in acc) {
                    acc[curr[0]] += curr[1];
                } else {
                    acc[curr[0]] = curr[1];
                } return acc;
            }, {});
        
        // convert from dictionary to list and sort
        data = [];
        for (let g in games) {
            // cut decimals
            let count = Math.round(games[g] * 100) / 100

            // abbreviate name
            if (g.length > 30) {
                g = g.slice(0,27) + "...";
            }
            data.push([g, count]);
        }
        data.sort((a,b) => b[1]-a[1]);

        const NUM_GAMES = 20;
        data = data.slice(0, NUM_GAMES);
        console.log(data);

        // cut down after two digits after dot
        const sales_percentage = Math.round((max_count/sales_sum * 100)*100)/100;

        // display the top publisher
        document.getElementById("top_publisher").innerHTML = `Top Publisher for ${genre} Games: ${top_publisher}`;
        document.getElementById("sales_percentage").innerHTML = `All-Time Global Sales Percentage: ${sales_percentage}%`;

        // update title of the graph
        title_3.text(`Top ${data.length} ${genre} Games by ${top_publisher}`);

        // Set up reference to count SVG group
        let countRef_3 = svg3.append("g");
        // Set up reference to y axis label to update text in setData
        let y_axis_3 = svg3.append("g");

        // color scale
        let color = d3.scaleOrdinal()
            .range(d3.quantize(d3.interpolateHcl("#da4227", "#e7a094"), data.length));
            
        // x axis domain with the max count of the provided data
        x.domain([0, d3.max(data, d => d[1])]);

        // y axis domains with the desired attribute
        y.domain(data.map(d => d[0]));
        color.domain(data.map(function(d) { return d[0] }));

        // Render y-axis label
        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        /*
                1. Select all desired elements in the DOM
                2. Count and parse the data values
                3. Create new, data-bound elements for each data value
        */
        let bars = svg3.selectAll("rect").data(data);

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
            .attr("fill", function(d) { return color(d[0]) })
            .attr("x", x(0))
            .attr("y", d => y(d[0]))
            .attr("width", d => x(d[1]))
            .attr("height",  y.bandwidth);

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
            .attr("x", d => x(d[1])+10)
            .attr("y", d => y(d[0]) + 10) 
            .style("text-anchor", "start")
            .text(d => d[1]); 

        // Remove elements not in use if fewer groups in new dataset
        bars.exit().remove();
        counts.exit().remove();
    });
    
}

// default graph
setGraph3('Action');

let genre_list = ['Action', 'Adventure', 'Fighting', 'Misc', 'Platform',
    'Puzzle', 'Racing', 'Role-Playing', 'Shooter', 'Simluation', 'Sports', 'Strategy'];
let input_genre;

// get user input genre and update graph
function setGenre() {
    input_genre = document.getElementById("input_genre").value;
    if (!genre_list.includes(input_genre)) {
        document.getElementById("top_publisher").innerHTML = "Please submit a valid genre.";
        document.getElementById("sales_percentage").innerHTML = ``;
    } else {
        setGraph3(input_genre);
    }
}