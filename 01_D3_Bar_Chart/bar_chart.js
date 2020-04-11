const URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

// Para que el codigo se ejecute solo cuando la pagina
// haya terminado de cargarse
document.addEventListener('DOMContentLoaded', () => {
    // Obtener los datos de la fuente mediante Promises de D3
    d3.json(URL)
        .then(data => {
            drawSVG(data.data);
        });
});

const drawSVG = dataset => {
    // Dimensiones del svg
    let padding = 50;
    let height = 500;
    let width = 1200;    

    // Crear escala lineal dinamica para el eje X
    let dates = dataset.map(data => new Date(data[0]));
    let dateMin = d3.min(dates);
    let dateMax = d3.max(dates);

    const xScale = d3.scaleTime()
                    .domain([dateMin, dateMax])
                    .range([padding, width - padding]);

    // Crear escala lineal dinamica para el eje Y
    const yScale = d3.scaleLinear()
                    .domain([0, d3.max(dataset, (d) => d[1])])
                    .range([height - padding, padding]);    

    // Crear un elemento svg en el div #content
    const svg = d3.select('#content')
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .style('background-color', '#4E5D6C')
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
        .attr('x', (d, i) => xScale(dates[i]))
        .attr('y', (d, i) => yScale(d[1]))
        .attr('width', (width / dataset.length))   
        .attr('height', (d, i) => height - padding - yScale(d[1]))               
        .attr('class', 'bar')
        .attr('data-date', (d, i) => d[0])
        .attr('data-gdp', (d, i) => d[1])
        .attr('fill', '#abb6c2') 
        .on('mouseover', (d, i) => {
            tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);            
            tooltip.html(`${d[0]}</br>$${d[1]} Billion`)
                    .attr('class', 'text-center')
                    .attr('data-date', d[1])
                    .style('left', (d3.event.pageX + 10) + 'px')
                    .style('top', (d3.event.pageY - 50) + 'px');
        })
        .on('mouseout', (d, i) => {
            tooltip.transition()
                .duration(200)
                .style('opacity', 0)
        });

    // Eje X
    const xAxis = d3.axisBottom(xScale);
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
        .attr('x', (width / 2))
        .attr('y', (0.8 * padding))
        .attr('text-anchor', 'middle')
        .attr('fill', '#abb6c2') 
        .style('font-size', '1.5rem')
        .style('font-weight', 'bold')        
        .text('United States GDP');        
}
