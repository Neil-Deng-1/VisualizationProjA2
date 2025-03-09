console.log('D3 Version:', d3.version);

const margin = { top: 80, right: 60, bottom: 60, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const t = 500;
let targetPercentile = 50, xVar = "Percentage of Children with College Attendance", xScale, yScale, sizeScale
const colorScale = d3.scaleOrdinal(d3.schemeSet2);
const categories = {
    "Number of Children Born to Parents at a Given Income Percentile" : ["count_aian_pooled", "count_asian_pooled", "count_black_pooled", "count_hisp_pooled", "count_white_pooled"],
    "Mean Child Family (HSousehold) Income Rank for Children with Mothers Born in the U.S." : ["nativemom_aian", "nativemom_asian", "nativemom_black", "nativemom_hispanic", "nativemom_white"],
    "Percentage of Children with College Attendance" : ["kid_college_black_female", "kid_college_black_male", "kid_college_white_female", "kid_college_white_male"],
    "Mean Number of Weekly Working Hours Over the Past Year (2018)" : ["kid_hours_black_female", "kid_hours_black_male", "kid_hours_white_female", "kid_hours_white_male"],
    "Percentage of Children Incarcerated" : ["kid_jail_black_female", "kid_jail_black_male", "kid_jail_white_female", "kid_jail_white_male"],
    "Percentage of Children Without a High School Degree or GED" : ["kid_no_hs_black_female", "kid_no_hs_black_male", "kid_no_hs_white_female", "kid_no_hs_white_male"],
    "Percentage of Children Employed at Age 30 or Older" : ["kid_pos_hours_black_female", "kid_pos_hours_black_male", "kid_pos_hours_white_female", "kid_pos_hours_white_male"],
    "Mean Wage Rank of Children at Age 30 or Older" : ["kid_wage_rank_black_female", "kid_wage_rank_black_male", "kid_wage_rank_white_female", "kid_wage_rank_white_male"],
    "Mean Child Individual Income Rank" : ["kir_black_female", "kir_black_male", "kir_white_female", "kir_white_male"],
    "Mean Child Individual Income Rank for Children with Single Parents" : ["kir_1par_black_male", "kir_1par_white_male", "kir_2par_black_male", "kir_2par_white_male"],
    "Mean Individual Income Rank of Spouse" : ["spouse_rank_black_female", "spouse_rank_black_male", "spouse_rank_white_female", "spouse_rank_white_male"]
};

const svg = d3.select('#vis')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

function init(){
    d3.csv("./data/table_1.csv", function(d){
        return {
            par_pctile: +d.par_pctile,

            count_aian_pooled: +d.count_aian_pooled,
            count_asian_pooled: +d.count_asian_pooled,
            count_black_pooled: +d.count_black_pooled,
            count_hisp_pooled: +d.count_hisp_pooled,
            count_white_pooled: +d.count_white_pooled,

            nativemom_aian: +d.kfr_nativemom_aian_pooled,
            nativemom_asian: +d.kfr_nativemom_asian_pooled,
            nativemom_black: +d.kfr_nativemom_black_pooled,
            nativemom_hispanic: +d.kfr_nativemom_hisp_pooled,
            nativemom_white: +d.kfr_nativemom_white_pooled,

            kid_college_black_female: +d.kid_college_black_female,
            kid_college_black_male: +d.kid_college_black_male,
            kid_college_white_female: +d.kid_college_white_female,
            kid_college_white_male: +d.kid_college_white_male,

            kid_hours_black_female: +d.kid_hours_black_female,
            kid_hours_black_male: +d.kid_hours_black_male,
            kid_hours_white_female: +d.kid_hours_white_female,
            kid_hours_white_male: +d.kid_hours_white_male,

            kid_jail_black_female: +d.kid_jail_black_female,
            kid_jail_black_male: +d.kid_jail_black_male,
            kid_jail_white_female: +d.kid_jail_white_female,
            kid_jail_white_male: +d.kid_jail_white_male,

            kid_no_hs_black_female: +d.kid_no_hs_black_female,
            kid_no_hs_black_male: +d.kid_no_hs_black_male,
            kid_no_hs_white_female: +d.kid_no_hs_white_female,
            kid_no_hs_white_male: +d.kid_no_hs_white_male,

            kid_pos_hours_black_female: +d.kid_pos_hours_black_female,
            kid_pos_hours_black_male: +d.kid_pos_hours_black_male,
            kid_pos_hours_white_female: +d.kid_pos_hours_white_female,
            kid_pos_hours_white_male: +d.kid_pos_hours_white_male,

            kid_wage_rank_black_female: +d.kid_wage_rank_black_female,
            kid_wage_rank_black_male: +d.kid_wage_rank_black_male,
            kid_wage_rank_white_female: +d.kid_wage_rank_white_female,
            kid_wage_rank_white_male: +d.kid_wage_rank_white_male,

            kir_black_female: +d.kir_black_female,
            kir_black_male: +d.kir_black_male,
            kir_white_female: +d.kir_white_female,
            kir_white_male: +d.kir_white_male,

            kir_1par_black_male: +d.kir_1par_black_male,
            kir_1par_white_male: +d.kir_1par_white_male,
            kir_2par_black_male: +d.kir_2par_black_male,
            kir_2par_white_male: +d.kir_2par_white_male,

            spouse_rank_black_female: +d.spouse_rank_black_female,
            spouse_rank_black_male: +d.spouse_rank_black_male,
            spouse_rank_white_female: +d.spouse_rank_white_female,
            spouse_rank_white_male: +d.spouse_rank_white_male
        };
    })
    .then(data => {
            console.log(data)
            allData = data
            setupSelector()
            updateAxes()
            updateVis()
        })
    .catch(error => console.error('Error loading data:', error));
}

function setupSelector(){
    let slider = d3
        .sliderHorizontal()
        .min(d3.min(allData.map(d => +d.par_pctile))) 
        .max(d3.max(allData.map(d => +d.par_pctile))) 
        .step(1)
        .width(width - 50)  
        .displayValue(true)
        .default(targetPercentile)
        .on('onchange', (val) => {
            targetPercentile = +val 
            updateVis() 
        });

    d3.select('#slider')
        .append('svg')
        .attr('width', width)
        .attr('height', 75)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider);
        
    d3.selectAll('.variable')
        .each(function() {
            d3.select(this).selectAll('myOptions')
            .data(Object.keys(categories))
            .enter()
            .append('option')
            .text(d => d) 
            .attr("value",d => d)
        })
        .on("change", function (event) {
            if(d3.select(this).property("id") == "xVariable"){
                xVar = d3.select(this).property("value")
            }
            updateAxes();
            updateVis();
        })

    d3.select('#xVariable').property('value', xVar)
}
  
function updateAxes(){
    svg.selectAll('.axis').remove();
    svg.selectAll('.grid').remove();
    svg.selectAll('.labels').remove();

    xScale = d3.scaleBand()
        .domain(categories[xVar])
        .range([0, width]);

    temp = d3.max(categories[xVar], key => allData.find(d => d.par_pctile === targetPercentile)[key])

    yScale = d3.scaleLinear()
        .domain([0, d3.max(allData, d => d3.max(categories[xVar], key => d[key]))])
        .range([height, 0]);

    const yAxis = d3.axisLeft(yScale)
    const xAxis = d3.axisBottom(xScale)

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", 'axis')
        .call(yAxis);

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

    svg.append('text')
        .attr('class', 'labels')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 20)
        .style('text-anchor', 'middle')
        .text(xVar);
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 40)
        .attr("text-anchor", "middle")
        .text( function(){
            if(xVar == "Number of Children Born to Parents at a Given Income Percentile"){
                return 'Number of Children'
            }else if(xVar == "Mean Number of Weekly Working Hours Over the Past Year (2018)"){
                return 'Number of Hours'
            }else if(xVar == "Mean Child Family (HSousehold) Income Rank for Children with Mothers Born in the U.S." ||
                xVar == "Mean Wage Rank of Children at Age 30 or Older" ||
                xVar == "Mean Child Individual Income Rank" ||
                xVar == "Mean Child Individual Income Rank for Children with Single Parents" ||
                xVar == "Mean Individual Income Rank of Spouse"){
                return 'Income Rank'
            }else{
                return 'Percent (%)'
            }
        } ) 
        .attr('class', 'labels')
    
        /*
            const categories = {
                "Number of children born to parents at a given income percentile" : ["count_aian_pooled", "count_asian_pooled", "count_black_pooled", "count_hisp_pooled", "count_white_pooled"],
                "Mean child family (household) income rank for children with mothers born in the U.S." : ["nativemom_aian", "nativemom_asian", "nativemom_black", "nativemom_hispanic", "nativemom_white"],
                "Percentage of children with college attendance" : ["kid_college_black_female", "kid_college_black_male", "kid_college_white_female", "kid_college_white_male"],
                "Mean number of weekly working hours over the past year (2018)" : ["kid_hours_black_female", "kid_hours_black_male", "kid_hours_white_female", "kid_hours_white_male"],
                "Percentage of children incarcerated." : ["kid_jail_black_female", "kid_jail_black_male", "kid_jail_white_female", "kid_jail_white_male"],
                "Percentage of children without a high school degree or GED." : ["kid_no_hs_black_female", "kid_no_hs_black_male", "kid_no_hs_white_female", "kid_no_hs_white_male"],
                "Percentage of children employed at age 30 or older" : ["kid_pos_hours_black_female", "kid_pos_hours_black_male", "kid_pos_hours_white_female", "kid_pos_hours_white_male"],
                "Mean wage rank of children at age 30 or older" : ["kid_wage_rank_black_female", "kid_wage_rank_black_male", "kid_wage_rank_white_female", "kid_wage_rank_white_male"],
                "Mean child individual income rank" : ["kir_black_female", "kir_black_male", "kir_white_female", "kir_white_male"],
                "Mean child individual income rank for children with single parents" : ["kir_1par_black_male", "kir_1par_white_male", "kir_2par_black_male", "kir_2par_white_male"],
                "Mean individual income rank of spouse" : ["spouse_rank_black_female", "spouse_rank_black_male", "spouse_rank_white_female", "spouse_rank_white_male"]
            };
        */
}
  
function updateVis(){
    let currentData = allData.find(d => d.par_pctile === targetPercentile);
    let bars = svg.selectAll(".bar")
        .data(categories[xVar], d => d);

    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d) + 5)
        .attr("y", d => yScale(currentData[d]))
        .attr("width", xScale.bandwidth() - 10)
        .attr("height", d => height - yScale(currentData[d]))
        .attr("fill", d => colorScale(d))
        .merge(bars)
        .on('mouseover', function (event, d) {
            d3.select('#tooltip')
                .style("display", 'block') 
                .html(`<strong>${d}</strong>: ${currentData[d]}`)
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
        .transition()
        .duration(t)
        .attr("y", d => yScale(currentData[d]))
        .attr("height", d => height - yScale(currentData[d]))
        
    bars.exit()
        .remove();      
}
  
window.addEventListener('load', init);



