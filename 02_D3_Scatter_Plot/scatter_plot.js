const URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

// Para que el codigo se ejecute solo cuando la pagina
// haya terminado de cargarse
document.addEventListener('DOMContentLoaded', () => {
    // Obtener los datos de la fuente mediante Promises de D3
    d3.json(URL)
        .then(data => {
            drawSVG(data);
        });
});

const drawSVG = dataset => {
    // Dimensiones del svg
    let padding = 60;
    let height = 720;
    let width = 1280;    

    // Crear escala lineal dinamica para el eje X (años)
    let years = dataset.map(d => d.Year)
    let minYear = d3.min(years);
    let maxYear = d3.max(years);

    const xScale = d3.scaleLinear()
                    .domain([minYear - 1, maxYear + 1])
                    .range([padding, width - padding]);

    // Crear escala lineal dinamica para el eje Y (tiempos)
    let times = dataset.map(d => {
        let time = d.Time.split(':');
        let date = new Date();
        date.setHours('00');
        date.setMinutes(time[0]);
        date.setSeconds(time[1]);
        return date;
    });
    let minTime = d3.min(times);
    let maxTime = d3.max(times);

    const yScale = d3.scaleTime()
                    .domain([maxTime, minTime])
                    .range([height - padding, padding]);    

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
                        
    // Añadir al svg un circulo por cada elemento del dataset
    svg.selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d, i) => xScale(years[i]))
        .attr('cy', (d, i) => yScale(times[i]))
        .attr('r', 5)        
        .attr('data-xvalue', (d, i) => years[i])
        .attr('data-yvalue', (d, i) => times[i])
        .style('fill', (d, i) => d.Doping.length === 0 ? '#df691a' : '#48a648')
        .style('stroke', 'white')
        .on('mouseover', function(d, i) { // Para poder utilizar el this siguiente no puede ser una arrow function
            d3.select(this).attr('r', 10);
            let name = `${d.Name}: ${d.Nationality}`;
            let yearTime = `Year: ${d.Year} - Time: ${d.Time}`;
            let doping = `${d.Doping}`;
            tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);        
            tooltip.html(`${name}</br>${yearTime}</br>${doping}`)
                    .attr('class', 'text-center')
                    .attr('data-year', years[i])
                    .style('left', (d3.event.pageX + 10) + 'px')
                    .style('top', (d3.event.pageY - 50) + 'px');
        })
        .on('mouseout', function(d, i) { // Para poder utilizar el this siguiente no puede ser una arrow function
            d3.select(this).attr('r', 5);
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

    // Eje Y - aplicar formato para que muestre MM:SS
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));
    svg.append("g")        
        .attr("transform", `translate(${padding}, 0)`)
        .attr('id', 'y-axis')
        .call(yAxis);

    // Añadir Titulo
    svg.append('text')
        .attr('id', 'title')
        .attr('x', (width / 2))
        .attr('y', (0.5 * padding))
        .attr('text-anchor', 'middle')
        .attr('fill', '#abb6c2') 
        .style('font-size', '1.5rem')
        .style('font-weight', 'bold')        
        .text('Doping in Professional Bicycle Racing');    
        
    svg.append('text')
        .attr('x', (width / 2))
        .attr('y', (0.9 * padding))
        .attr('text-anchor', 'middle')
        .attr('fill', '#abb6c2') 
        .style('font-size', '.8rem')
        .style('font-weight', 'bold')        
        .text('35 Fastest times up Alpe d\'Huez');    
        
    // Añadir leyenda
    svg.append('text')
        .attr('x', (0.8 * width + 20))
        .attr('y', (height / 3))
        .attr('id', 'legend')
        .attr('fill', '#abb6c2') 
        .style('font-size', '1rem')
        .style('font-weight', 'bold')        
        .text('No doping allegations');  
        
    svg.append('rect')
        .attr('x', (0.8 * width))
        .attr('y', (height / 3) - 12)
        .attr('width', '15px')   
        .attr('height', '15px')
        .attr('fill', '#df691a') 
        .style('stroke', 'white');
}

