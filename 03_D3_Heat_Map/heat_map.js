const URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Para que el codigo se ejecute solo cuando la pagina
// haya terminado de cargarse
document.addEventListener('DOMContentLoaded', () => {
    // Obtener los datos de la fuente mediante Promises de D3
    d3.json(URL)
        .then(data => {
            drawSVG(data);
        });
});

const drawSVG = data => {
    // Datos recibidos
    const baseTemp = data.baseTemperature;
    const dataset = data.monthlyVariance;

    // Dimensiones del svg
    let padding = 100;
    let height = 760;
    let width = 1320;    

    // Crear escala lineal dinamica para el eje X (años)
    let years = [...new Set(dataset.map(d => d.year))]; // Obtener array sin años repetidos   
    let minYear = d3.min(years);
    let maxYear = d3.max(years);

    const xScale = d3.scaleLinear()
                    .domain([minYear, maxYear])
                    .range([padding, width - padding]);    

    // Crear escala de banda dinamica para el eje Y (meses)
    const yScale = d3.scaleBand()
                    .domain(months)
                    .range([height - padding, padding]);    

    // Crear colores
    let variances = dataset.map(d => d.variance);   
    let minTemp = d3.min(variances) + baseTemp;
    let maxTemp = d3.max(variances) + baseTemp; 

    const colors = d3.scaleSequential()
                    .domain([maxTemp, minTemp])
                    .interpolator(d3.interpolateSinebow);                                      

    // Crear un elemento svg en el div #content
    const svg = d3.select('#content')
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)
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
                        
    // Añadir al svg un rectangulo por cada elemento del dataset
    svg.selectAll('rect')
        .data(dataset)                
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('data-month', d => d.month - 1)
        .attr('data-year', d => d.year)
        .attr('data-temp', d => d.variance + baseTemp)
        .attr('x', d => xScale(d.year))
        .attr('y', d => yScale(months[d.month - 1])) // Hay que relacionar el array months con el dataset
        .attr('height', (height - padding * 2) / months.length)
        .attr('width', (width - padding * 2) / years.length)
        .attr("fill", d => colors(d.variance + baseTemp))
        .on('mouseover', function(d, i) { // Para poder utilizar el this siguiente no puede ser una arrow function
            d3.select(this).style('stroke', 'black');
            tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);        
            tooltip.html(`${d.year} - ${months[d.month - 1]}</br>${(d.variance + baseTemp).toFixed(2)}ºC</br>${d.variance.toFixed(2)}ºC`)
                    .attr('class', 'text-center')
                    .attr('data-year', d.year)
                    .style('left', (d3.event.pageX + 10) + 'px')
                    .style('top', (d3.event.pageY - 90) + 'px');
        })
        .on('mouseout', function(d, i) { // Para poder utilizar el this siguiente no puede ser una arrow function
            d3.select(this).style('stroke', 'none');
            tooltip.transition()
                .duration(200)
                .style('opacity', 0)
        });  

    // Eje X - aplicar formato para quitar el punto de los miles (1.994)
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    svg.append("g")        
        .attr("transform", `translate(0, ${height - padding})`)
        .attr('id', 'x-axis')
        .call(xAxis);

    // Eje Y
    const yAxis = d3.axisLeft(yScale);
    svg.append("g")        
        .attr("transform", `translate(${padding}, 0)`)
        .attr('id', 'y-axis')
        .call(yAxis);

    // Añadir Titulo
    svg.append('text')
        .attr('id', 'title')
        .attr('x', (width / 2))
        .attr('y', (0.4 * padding))
        .attr('text-anchor', 'middle')
        .attr('fill', '#abb6c2') 
        .style('font-size', '1.5rem')
        .style('font-weight', 'bold')        
        .text('Monthly Global Land-Surface Temperature');    
        
    svg.append('text')
        .attr('id', 'description')
        .attr('x', (width / 2))
        .attr('y', (0.7 * padding))
        .attr('text-anchor', 'middle')
        .attr('fill', '#abb6c2') 
        .style('font-size', '1.1rem')
        .style('font-weight', 'bold')        
        .text('1753 - 2015: base temperature 8.66°C');    
        
    // Añadir leyenda
    // Follow examples from https://www.freshconsulting.com/d3-js-gradients-the-easy-way/ to draw the legend
    // Eje X de la leyenda
    let legendData = d3.range(minTemp, maxTemp, (maxTemp - minTemp) / (width / 2));

    let legendScale = d3.scaleLinear()
                    .domain([minTemp, maxTemp])
                    .range([0, width / 2]);
    
    let xAxisLegend = d3.axisBottom().scale(legendScale);

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
