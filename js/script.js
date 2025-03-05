console.log('D3 Version:', d3.version);

const margin = { top: 80, right: 60, bottom: 60, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

let allData = []
let xVar = 'Income', yVar = 'Life_Expectancy', sizeVar = 'Population', targetYear = 2000
let xScale, yScale, sizeScale

const continents = ['Africa', 'Asia', 'Oceania', 'Americas', 'Europe']
const colorScale = d3.scaleOrdinal(continents, d3.schemeSet2);
const options = ['Income', 'Life_Expectancy', 'GDP', 'Population', 'Child_Deaths']

const t = 1000;

const svg = d3.select('#vis')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

function init(){
    d3.csv("./data/gapminder_subset.csv", 
    function(d){
        return {  
        country: d.country,
        continent: d.continent,
        year: +d.year,
        Life_Expectancy: +d.life_expectancy, 
        Income: +d.income_per_person, 
        GDP: +d.gdp_per_capita, 
        Child_Deaths: +d.number_of_child_deaths,
        Population: +d.population
    }})
    .then(data => {
            console.log(data)
            allData = data
            setupSelector()
            updateAxes()
            updateVis()
            addLegend()
        })
    .catch(error => console.error('Error loading data:', error));
}

function setupSelector(){
    let slider = d3
        .sliderHorizontal()
        .min(d3.min(allData.map(d => +d.year))) 
        .max(d3.max(allData.map(d => +d.year))) 
        .step(1)
        .width(width)  
        .displayValue(true)
        .default(targetYear)
        .on('onchange', (val) => {
            targetYear = +val 
            updateVis() 
        });

    d3.select('#slider')
        .append('svg')
        .attr('width', width)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider);

    d3.selectAll('.variable')
        .each(function() {
            d3.select(this).selectAll('myOptions')
            .data(options)
            .enter()
            .append('option')
            .text(d => d) 
            .attr("value",d => d)
        })
        .on("change", function (event) {
            if(d3.select(this).property("id") == "xVariable"){
                xVar = d3.select(this).property("value")
            } else if(d3.select(this).property("id") == "yVariable"){
                yVar = d3.select(this).property("value")
            } else if(d3.select(this).property("id") == "sizeVariable"){
                sizeVar = d3.select(this).property("value")
            }
            
            updateAxes();
            updateVis();
        })

    d3.select('#xVariable').property('value', xVar)
    d3.select('#yVariable').property('value', yVar)
    d3.select('#sizeVariable').property('value', sizeVar)
}
  
function updateAxes(){
    svg.selectAll('.axis').remove();
    svg.selectAll('.grid').remove();
    svg.selectAll('.labels').remove();

    xScale = d3.scaleLinear()
        .domain([0, d3.max(allData, d => d[xVar])])
        .range([0, width]);

    yScale = d3.scaleLinear()
        .domain([0, d3.max(allData, d => d[yVar])])
        .range([height, 0]);

    sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(allData, d => d[sizeVar])])
        .range([4, 24]); 

    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => d >= 1_000_000 ? d3.format(",")(d / 1_000_000) + "M" : d3.format(",")(d));

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d => d >= 1_000_000 ? d3.format(",")(d / 1_000_000) + "M" : d3.format(",")(d));

    svg.append("g")
        .attr("class", 'axis')
        .call(yAxis);


    // grid stuff

    const xGrid = d3.axisBottom(xScale)
        .ticks(15)
        .tickSize(-height) // Extend across chart
        .tickFormat("");

    svg.append("g")
        .attr("class", "grid x-grid")
        .attr("transform", `translate(0,${height})`)
        .call(xGrid)
        .selectAll("line")
        .style("stroke", "grey") 
        .style("stroke-dasharray", "3,3") 

    const yGrid = d3.axisLeft(yScale)
        .ticks(15)
        .tickSize(-width)
        .tickFormat("");

    svg.append("g")
        .attr("class", "grid y-grid")
        .call(yGrid)
        .selectAll("line")
        .style("stroke", "gray")
        .style("stroke-dasharray", "3,3")
    
    // end of grid stuff


    svg.append('text')
        .attr('class', 'labels')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 20)
        .style('text-anchor', 'middle')
        .text(xVar);

    svg.append('text')
        .attr('class', 'labels')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 40)
        .style('text-anchor', 'middle')
        .text(yVar);
}
  
function updateVis(){
    let currentData = allData.filter(d => d.year === targetYear)

    svg.selectAll('.points')
        .data(currentData, d => d.country)
        .join(
            function(enter){
                return enter
                .append('circle')
                .attr('class', 'points')
                .attr('cx', d => xScale(d[xVar])) 
                .attr('cy', d => yScale(d[yVar])) 
                .style('fill', d => colorScale(d.continent))
                .style('opacity', .5) 
                .attr('r', 0) 
                .on('mouseover', function (event, d) {
                    //console.log(d)
                    d3.select('#tooltip')
                        .style("display", 'block') 
                        .html( 
                        `<strong>${d.country}</strong><br/>
                        Continent: ${d.continent}`)
                        .style("left", (event.pageX + 20) + "px")
                        .style("top", (event.pageY - 28) + "px");
                    d3.select(this)
                        .style('stroke', 'black')
                        .style('stroke-width', '3px')
                })
                .on("mouseout", function (event, d) {
                    d3.select('#tooltip')
                        .style('display', 'none')
                    d3.select(this) 
                        .style('stroke', 'none')
                })
                .transition(t)
                .attr('r', d => sizeScale(d[sizeVar])) 
            },

            function(update){
                return update
                .transition(t)
                .attr('cx', d => xScale(d[xVar]))
                .attr('cy', d => yScale(d[yVar]))
                .attr('r',  d => sizeScale(d[sizeVar]))
            },

            function(exit){
                return exit
                .transition(t)
                .attr('r', 0) 
                .remove()
            }

        )
}
  
function addLegend(){
    let size = 10 
    svg.selectAll('continentSquare')
        .data(continents)
        .enter()
        .append('rect')
        .attr('x', (d, i) => i * (size + 100) + 100)
        .attr('y', -margin.top / 2)
        .attr('width', size)
        .attr('height', size)
        .style('fill', d => colorScale(d));

    svg.selectAll("continentName")
        .data(continents)
        .enter()
        .append("text")
        .attr("y", -margin.top/2 + size)
        .attr("x", (d, i) => i * (size + 100) + 120)  
        .style("fill", d => colorScale(d))
        .text(d => d)
        .attr("text-anchor", "left")
        .style('font-size', '13px')
}

window.addEventListener('load', init);



