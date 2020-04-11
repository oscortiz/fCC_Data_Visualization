const URL_US_Education_Data = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const URL_US_County_Data = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

// Para que el codigo se ejecute solo cuando la pagina
// haya terminado de cargarse
document.addEventListener('DOMContentLoaded', () => {
    // Obtener los datos de la fuente mediante Promises de JavaScript
    // Antes se hacia con d3.queue()
    let data = [URL_US_Education_Data, URL_US_County_Data];

    Promise.all(data.map(url => d3.json(url)))
        .then(values => {
            drawSVG(values[0], values[1])
        })
        .catch(error => {
            // Mostrar error si existe
            console.error('ERROR: ' + error.message);
        });
});

const drawSVG = (dataEducation, dataCounty) => {
    // Dimensiones del svg
    let padding = 100;
    let height = 760;
    let width = 1320; 
      
    // Crear colores
    let percentages = dataEducation.map(d => d.bachelorsOrHigher);   
    let minPercentage = d3.min(percentages);
    let maxPercentage = d3.max(percentages); 

    const colors = d3.scaleSequential()
                    .domain([minPercentage, maxPercentage])
                    .interpolator(d3.interpolateOranges);  
  
    // Crear un elemento svg en el div #content
    const svg = d3.select('#content')
                    .append('svg')                    
                    .attr('height', height)
                    .attr('width', width)
                    .style('background-color', '#4e5d6c')
                    .style('margin-bottom', 20)
                    .style('box-shadow', '0px 10px 10px 2px rgba(0,0,0,0.25)')
                    .style('border-radius', '10px');     

    // Crear Tooltip oculto (opacity = 0)
    // Tooltip creado a partir del libro de Malcolm Maclean
    // D3 Tips and Tricks. Interactive Data Visualization in a Web Browser
    const tooltip = d3.select('#content')
                        .append('div')
                        .attr('id', 'tooltip')                        
                        .style('opacity', 0);  

	// Definir el "path" como as return of geographic features
	const path = d3.geoPath();
	  
	// Carga de datos y visualizacion de los counties en el mapa
    const topojsonCounties = topojson.feature(dataCounty, dataCounty.objects.counties); 
    const countiesDataSet = topojsonCounties.features; 

    // Agrupar las capas svg para los counties
    svg.append('g')
        .attr('class', 'map')
        .selectAll('path')
        .data(countiesDataSet)
        .enter()
        .append('path')
        .attr('class', 'county')
        .attr('d', path)
        .attr('fill', d => colors(dataEducation.filter(data => d.id === data.fips)[0].bachelorsOrHigher))
        .attr('data-fips', d => d.id)
        .attr('data-education', d => dataEducation.filter(data => d.id === data.fips)[0].bachelorsOrHigher)
        .on('mouseover', function(d, i) { // Para poder utilizar el this siguiente no puede ser una arrow function
            d3.select(this).style('stroke', 'black');
            let county = dataEducation.filter(data => d.id === data.fips)[0].area_name;
            let state = dataEducation.filter(data => d.id === data.fips)[0].state;
            let percentage = dataEducation.filter(data => d.id === data.fips)[0].bachelorsOrHigher;
            tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);
            tooltip.html(`${county}, ${state} - ${percentage}%`)
                    .attr('class', 'text-center')
                    .attr('data-education', dataEducation.filter(data => d.id === data.fips)[0].bachelorsOrHigher)
                    .style('left', (d3.event.pageX + 10) + 'px')
                    .style('top', (d3.event.pageY - 50) + 'px');
        })
        .on('mouseout', function(d, i) { // Para poder utilizar el this siguiente no puede ser una arrow function
            d3.select(this).style('stroke', 'none');
            tooltip.transition()
                .duration(200)
                .style('opacity', 0)
        }); 

	// Carga de datos y visualizacion de los estados (states) en el mapa
    const topojsonStates = topojson.feature(dataCounty, dataCounty.objects.states); 
    const statesDataSet = topojsonStates.features;         

    // Mostrar los estados (states)
    svg.append('g')        
        .selectAll('path')
        .data(statesDataSet)
        .enter()
        .append('path')
        .attr('class', 'state')
        .attr('d', path)
        .attr('stroke', '#4e5d6c')
        .attr('fill', 'none');        

    // Centrar el mapa
    var mapHeight = d3.select('.map').node().getBBox().height;
    var mapWidth = d3.select('.map').node().getBBox().width;
    console.log(mapHeight);console.log(mapWidth);

    svg.selectAll('g')        
        .attr('transform', `translate(${(width - mapWidth) / 2}, ${((height - mapHeight) / 2) - 10})`);         

    // Añadir Titulo
    svg.append('text')
        .attr('id', 'title')
        .attr('x', (width / 2))
        .attr('y', (0.4 * padding))
        .attr('text-anchor', 'middle')
        .attr('fill', '#abb6c2') 
        .style('font-size', '1.5rem')
        .style('font-weight', 'bold')        
        .text('United States Educational Attainment');    
    
    svg.append('text')
        .attr('id', 'description')
        .attr('x', (width / 2))
        .attr('y', (0.7 * padding))
        .attr('text-anchor', 'middle')
        .attr('fill', '#abb6c2') 
        .style('font-size', '1.1rem')
        .style('font-weight', 'bold')        
        .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)');

    // Añadir leyenda
    // Follow examples from https://www.freshconsulting.com/d3-js-gradients-the-easy-way/ to draw the legend
    // Eje X de la leyenda
    let legendData = d3.range(minPercentage, maxPercentage, (maxPercentage - minPercentage) / (width / 2));

    let legendScale = d3.scaleLinear()
                    .domain([minPercentage, maxPercentage])
                    .range([0, width / 2]);
    
    let xAxisLegend = d3.axisBottom()
                        .scale(legendScale)
                        .tickFormat(percentage => percentage + '%');

    let legend = svg.append('g')        
                    .attr('transform', `translate(${width / 4}, ${height - 0.6 * padding + 20})`)
                    .attr('id', 'legend')
                    .call(xAxisLegend);

    legend.selectAll('rect')
        .data(legendData)                
        .enter()
        .append('rect') 
        .attr('x', d => legendScale(d))
        .attr('y', -15)
        .attr('width', width / 2 / legendData.length)  
        .attr('height', '15px')
        .attr('fill', d => colors(d)); 
}
