const URL_Movie_Sales = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json';

// Para que el codigo se ejecute solo cuando la pagina
// haya terminado de cargarse
document.addEventListener('DOMContentLoaded', () => {
    // Obtener los datos de la fuente mediante Promises de D3
    d3.json(URL_Movie_Sales)
        .then(data => {
            drawSVG(data);
        });
});

const drawSVG = dataset => {
    // Dimensiones del svg
    let padding = 100;
    let height = 760;
    let width = 1320; 
      
    // Crear colores
    const colors = d3.scaleOrdinal(d3.schemeSet3);
  
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

    // Crear el treemap
    let treemap = d3.treemap()
                    .size([width - (padding * 2), height - (padding * 2)]) // Ancho y alto de la zona de visualizacion
                    .paddingInner(1) // Padding para separar los elementos
                    .round(true); // round a true para redondear las coordenadas de cada rectangulo.
    
    // Desplegar la jerarquia de raices especificada
    // Se asignan las siguientes propiedades a la raiz y sus descendientes:
    //      node.x0 - borde izquierdo del rectangulo
    //      node.y0 - borde superior del rectangulo
    //      node.x1 - borde derecho del rectangulo
    //      node.y1 - borde inferior del rectangulo
    let root = d3.hierarchy(dataset)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value);

    // Ejecuta el layout sobre la estructura de datos preparada a partir del JSON
    // y generar los atributos necesarios para generar la visualizacion
    treemap(root);

    // Crear una capa o grupo de celdas por cada genero de pelicula
    let movie_category = svg.append('g')
                            .attr('id', 'treemap')
                            .selectAll('g')
                            .data(root.leaves())
                            .enter()
                            .append('g')
                            .attr('class', 'movie_category')
                            .attr('transform', d => `translate(${d.x0}, ${d.y0})`)
                            .on('mousemove', function(d, i) { // Para poder utilizar el this siguiente no puede ser una arrow function
                                d3.select(this).style('stroke', 'black');
                                tooltip.transition()
                                        .duration(200)
                                        .style('opacity', .9);        
                                tooltip.html(`${d.data.name}</br>Category: ${d.data.category}</br>Value: ${d.data.value}`)
                                        .attr('class', 'text-center')
                                        .attr('data-value', d.data.value)
                                        .style('left', (d3.event.pageX + 10) + 'px')
                                        .style('top', (d3.event.pageY - 100) + 'px');
                            })
                            .on('mouseout', function(d, i) { // Para poder utilizar el this siguiente no puede ser una arrow function
                                d3.select(this).style('stroke', 'none');
                                tooltip.transition()
                                    .duration(200)
                                    .style('opacity', 0)
                            });

    // Añadir a cada genero de pelicula un rectangulo por cada pelicula del dataset
    movie_category.append('rect')
                    .attr('class', 'tile')
                    .attr('fill', d => colors(d.data.category))
                    .attr('data-name', d => d.data.name)
                    .attr('data-category', d => d.data.category)
                    .attr('data-value', d => d.data.value)
                    .attr('height', d => d.y1 - d.y0)
                    .attr('width', d => d.x1 - d.x0);
    
    // Añadir a cada genero de pelicula un texto en un parrafo p como objeto foraneo
    // del SVG por cada pelicula del dataset
    movie_category.append('foreignObject')
                    .attr('width', d => d.x1 - d.x0)
                    .attr('height', d => d.y1 - d.y0)
                    .append('xhtml:p')
                    .attr('width', d => d.x1 - d.x0)
                    .attr('height', d => d.y1 - d.y0)
                    .style('padding', '4px')
                    .style('color', '#000000') 
                    .style('font-size', '0.6rem') 
                    .style('cursor', 'default')
                    .text(d => d.data.name);

    // Centrar el treemap
    var treemapHeight = d3.select('#treemap').node().getBBox().height;
    var treemapWidth = d3.select('#treemap').node().getBBox().width;

    svg.select('#treemap')       
        .attr('transform', `translate(${(width - treemapWidth) / 2}, ${((height - treemapHeight) / 2) - 10})`);         

    // Añadir Titulo
    svg.append('text')
        .attr('id', 'title')
        .attr('x', (width / 2))
        .attr('y', (0.4 * padding))
        .attr('text-anchor', 'middle')
        .attr('fill', '#abb6c2') 
        .style('font-size', '1.5rem')
        .style('font-weight', 'bold')        
        .text('Movie Sales');    
    
    svg.append('text')
        .attr('id', 'description')
        .attr('x', (width / 2))
        .attr('y', (0.7 * padding))
        .attr('text-anchor', 'middle')
        .attr('fill', '#abb6c2') 
        .style('font-size', '1.1rem')
        .style('font-weight', 'bold')        
        .text('Top 100 Highest Grossing Movies Grouped By Genre');

    // Añadir leyenda
    let legendData = dataset.children.map(child => child.name);

    let legend = svg.append('g')
                    .attr('id', 'legend')
                    .selectAll('g')
                    .data(legendData)
                    .enter()
                    .append('g');

    legend.append('rect') 
            .attr('class', 'legend-item')
            .attr('x', (d, i) => padding + ((width - padding * 2) / legendData.length) * i)
            .attr('y', height - padding * 0.7)
            .attr('width', '15px')  
            .attr('height', '15px')
            .attr('fill', d => colors(d))
            .style('stroke', 'black'); 

    legend.append('text')
            .attr('x', (d, i) => (padding + ((width - padding * 2) / legendData.length) * i) + 20)
            .attr('y', height - padding * 0.7 + 15)
            .attr('fill', '#ffffff') 
            .style('font-size', '1rem')
            .style('font-weight', 'bold')        
            .text(d => d);      
}
