const margin = {top: 20, right: 60, bottom: 200, left: 60};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const t = 1000 //1 second for animations
const delaySpeed = 450;

const percentiles = ['1-25th percentile', '25-50th percentile', '50-75th percentile', '75-100th percentile']
const percentileVals = [[1,25], [25, 50], [50, 75], [75, 100]];
const genders = ["Male", "Female"];
const races = ["White", "Black", "Asian", "Hispanic", "Native American"];
const colors = d3.schemeSet3.slice(0, races.length);

let allData = [];
let incomeVar = '1-25th percentile', genderVar = "Male", maxRaceCount = ["Asian", 15]; // default values

// Create SVG
const svg = d3.select('#vis')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// Load data from csv
function init(){
    d3.csv("./data/national_percentile_outcomes.csv", d => ({ 
        parentIncome: +d.par_pctile,
        whiteMwithDad: +d.has_dad_white_male,
        whiteMwithDadN: +d.has_dad_white_male_n,
        whiteFwithDad: +d.has_dad_white_female,
        whiteFwithDadN: +d.has_dad_white_female_n,
        blackMwithDad: +d.has_dad_black_male,
        blackMwithDadN: +d.has_dad_black_male_n,
        blackFwithDad: +d.has_dad_black_female,
        blackFwithDadN: +d.has_dad_black_female_n,
        asianMwithDad: +d.has_dad_asian_male,
        asianMwithDadN: +d.has_dad_asian_male_n,
        asianFwithDad: +d.has_dad_asian_female,
        asianFwithDadN: +d.has_dad_asian_female_n,
        hispMwithDad: +d.has_dad_hisp_male,
        hispMwithDadN: +d.has_dad_hisp_male_n,
        hispFwithDad: +d.has_dad_hisp_female,
        hispFwithDadN: +d.has_dad_hisp_female_n,
        natamMwithDad: +d.has_dad_natam_male,
        natamMwithDadN: +d.has_dad_natam_male_n,
        natamFwithDad: +d.has_dad_natam_female,
        natamFwithDadN: +d.has_dad_natam_female_n
      
    }))
    .then(data => {
            console.log(data) // Check the structure in the console
            allData = data // Save the processed data

            // filtering data here! default data is 1-25th percentile, Male
            filteredData = filterIncomeGender(1, 25, "Male");
            console.log(filteredData);

            // calc average for the default values
            avg = calculateAverage(filteredData);

            avgPresentText = document.getElementById("avgPresent");
            avgPresentText.textContent = "On average " + avg + 
            "% of fathers are present in the lives of young " +
            "boys at the low income level.";

            avgPresentText = document.getElementById("avgPresent");
            sampleData = calculateSamples(filteredData)

            setupSelector();
            updateVis(sampleData);
            addLegend(sampleData);
            
        })
    .catch(error => console.error('Error loading data:', error));
}

// filter the data by the income bracket and by the gender
function filterIncomeGender(minInc, maxInc, gender){

    const filteredData = allData.map(d => {
        return {
            parentIncome: d.parentIncome,
            whiteWithDad: gender === "Male" ? d.whiteMwithDad : d.whiteFwithDad,
            whiteWithDadN: gender === "Male" ? d.whiteMwithDadN : d.whiteFwithDadN,
            blackWithDad: gender === "Male" ? d.blackMwithDad : d.blackFwithDad,
            blackWithDadN: gender === "Male" ? d.blackMwithDadN : d.blackFwithDadN,
            asianWithDad: gender === "Male" ? d.asianMwithDad : d.asianFwithDad,
            asianWithDadN: gender === "Male" ? d.asianMwithDadN : d.asianFwithDadN,
            hispWithDad: gender === "Male" ? d.hispMwithDad : d.hispFwithDad,
            hispWithDadN: gender === "Male" ? d.hispMwithDadN : d.hispFwithDad,
            natamWithDad: gender === "Male" ? d.natamMwithDad : d.natamFwithDad,
            natamWithDadN: gender === "Male" ? d.natamMwithDadN : d.natamFwithDadN,
        };
    }).filter(d => d.parentIncome >= minInc && d.parentIncome <= maxInc);

    // return the averages for each column
    return {
        whiteWithDad: d3.mean(filteredData, d=>d.whiteWithDad), 
        whiteWithDadN: d3.mean(filteredData, d=>d.whiteWithDadN), 
        blackWithDad: d3.mean(filteredData, d=>d.blackWithDad), 
        blackWithDadN: d3.mean(filteredData, d=>d.blackWithDadN), 
        asianWithDad: d3.mean(filteredData, d=>d.asianWithDad), 
        asianWithDadN: d3.mean(filteredData, d=>d.asianWithDadN), 
        hispWithDad: d3.mean(filteredData, d=>d.hispWithDad), 
        hispWithDadN: d3.mean(filteredData, d=>d.hispWithDadN), 
        natamWithDad: d3.mean(filteredData, d=>d.natamWithDad), 
        natamWithDadN: d3.mean(filteredData, d=>d.natamWithDadN)
    };


}

// calculate the samples of each of the columns
function calculateSamples(filteredData){

    // If I have 100 kids, 20 per each race, how many of each race
    // would have a present father


    return [
        // I am flooring, don't know if this is the most accurate? 
        Math.floor(filteredData.whiteWithDad*20),
        Math.floor(filteredData.blackWithDad*20),
        Math.floor(filteredData.asianWithDad*20),
        Math.floor(filteredData.hispWithDad*20),
        Math.floor(filteredData.natamWithDad*20)]
    }


// This function sets up the two dropdown filters
function setupSelector(){

    // income percentile dropdown
    d3.select("#income")
        .selectAll('myOptions')
        .data(percentiles)
        .enter()
        .append('option')
        .text(d=>d)
        .attr("value", d=>d)

    // gender dropdown
    d3.select("#gender")
        .selectAll('myOptions')
        .data(genders)
        .enter()
        .append('option')
        .text(d=>d)
        .attr("value", d=>d)

    d3.selectAll(".variable")
        .on("change", function(){
            // view console for altered dropdown and the newly selected value
            console.log(d3.select(this).property("id")) 
            console.log(d3.select(this).property("value")) 

            if (d3.select(this).property("id") == 'income'){
                incomeVar = d3.select(this).property("value")
            } else if(d3.select(this).property("id") == 'gender'){
                genderVar = d3.select(this).property("value")
            }
    
            let min = percentileVals[percentiles.indexOf(incomeVar)][0];
            let max = percentileVals[percentiles.indexOf(incomeVar)][1];
    
            // filtering to get new data
            filteredData = filterIncomeGender(min, max, genderVar);

            // update visualization
            updateVis(calculateSamples(filteredData));

            // update the text
            avg = calculateAverage(filteredData);

            if(genderVar == "Female"){
                genderText = "girls";
            } else {
                genderText = "boys";
            }

            if(incomeVar == percentiles[0]){
                incomeText = "low"
            } else if(incomeVar == percentiles[1]){
                incomeText = "low to middle"
            } else if(incomeVar == percentiles[2]){
                incomeText = "middle to high"
            } else {
                incomeText = "high"
            }
            
            avgPresentText = document.getElementById("avgPresent");
            avgPresentText.textContent = "On average " + avg + 
            "% of fathers are present in the lives of young " +
            genderText + " at the " + incomeText +" income level.";
            
    
        })

        d3.select('#income').property("value", incomeVar);
        d3.select('#gender').property("value", genderVar);

        


}

// This function will update the circles in the visualization based on the sample data received
function updateVis(sampleData){
    //remove circles before redrawing visualization
    svg.selectAll(".race").remove()


    // change max race and count
    maxRaceCount[1] = Math.max(...sampleData)
    maxRaceCount[0] = races[sampleData.indexOf(maxRaceCount[1])];
    
    // Spacing the circles on the X axis
    var xSpace = 35
    // Spacing the circles on the Y axis
    var ySpace = 50

    // Adding 5 groups of circles
    races.forEach((race, index) => {
        let group = svg.append("g")
        .attr("class", "race")
        .attr("transform", `translate(0, ${40 + ySpace * index})`)

        //Append the circles
        group.selectAll("circle")
            .data(d3.range(sampleData[index]))
            .enter()
            .append("circle")
            .attr("class", "race")
            .attr("cx", (d) => d * xSpace + 20)
            .attr("cy", 0)
            .attr("r", 13)
            .attr("fill", colors[index])
            .attr("opacity", 0)
            .transition()
            .duration(t)
            .delay((d, i) => i * delaySpeed)
            .attr("opacity", 1);
        
        // make sure tooltips update with correct data
        addLegend(sampleData)

})}

// Adds a legend for circles
function addLegend(sampleData) {

    svg.selectAll(".legend-item").remove(); // This will clear previous legend items
    
    let legend = svg.append("g")
        .attr("transform", `translate(${width / 2 - 300}, ${height})`);

    let legendItems = legend.selectAll(".legend-item")
        .data(races)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${i * 105}, 0)`); // Space out horizontally

    // Add circles for legend
    legendItems.append("circle")
        .attr("cx", 10)
        .attr("cy", 10)
        .attr("r", 13)
        .style("fill", (d, i) => colors[i])
        .on("mouseover", function (event, d) {
            d3.select("#tooltip")
                .style("display", "block") // Show the tooltip
                .html(changeTooltip(sampleData, d))
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 30) + "px");
        })
        .on("mouseout", function () {
            d3.select("#tooltip").style("display", "none"); // Hide tooltip when not hovering
        });

    // Add text labels
    legendItems.append("text")
        .attr("x", 30)
        .attr("y", 14)
        .text(d => d)
        .style("font-size", "14px")
        .style("alignment-baseline", "middle")
        .style("fill", "black");
}

function changeTooltip(sampleData, d){


    if(genderVar == "Female"){
        genderText = "girls";
    } else {
        genderText = "boys";
    }

    if(incomeVar == percentiles[0]){
        incomeText = "low"
    } else if(incomeVar == percentiles[1]){
        incomeText = "low to middle"
    } else if(incomeVar == percentiles[2]){
        incomeText = "middle to high"
    } else {
        incomeText = "high"
    }
    
    if(d === maxRaceCount[0]){
        return `${(maxRaceCount[1]/20)*100}% of young ${d.toLowerCase()} ${genderText} in the ${incomeText} income level have a father present`
    } else {
    return `Young ${d.toLowerCase()} ${genderText} in the ${incomeText} income level have about
    ${Math.floor(100 - ((sampleData[races.indexOf(d)] / maxRaceCount[1])*100))}% less fathers present than ${maxRaceCount[0].toLowerCase()}
    ${genderText} in the same income level`
    }
}
function calculateAverage(data) {
    return ((data.whiteWithDad +
        data.blackWithDad +
        data.asianWithDad + 
        data.hispWithDad + 
        data.natamWithDad)/5*100).toFixed(2);

}

window.addEventListener('load', init);    