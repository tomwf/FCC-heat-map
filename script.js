function monthName(month) {
  const date = new Date()
  const monthName = d3.timeFormat('%B')
  date.setMonth(month - 1)
  return monthName(date)
}

function fillColor(baseTemp, variance) {
  const monthTemp = baseTemp + variance

  if (monthTemp < VARIANCE[0]) {
    return COLORS[0]
  } else if (monthTemp < VARIANCE[1]) {
    return COLORS[1]
  } else if (monthTemp < VARIANCE[2]) {
    return COLORS[2]
  } else if (monthTemp < VARIANCE[3]) {
    return COLORS[3]
  } else if (monthTemp < VARIANCE[4]) {
    return COLORS[4]
  } else if (monthTemp < VARIANCE[5]) {
    return COLORS[5]
  } else if (monthTemp < VARIANCE[6]) {
    return COLORS[6]
  } else if (monthTemp < VARIANCE[7]) {
    return COLORS[7]
  } else {
    return COLORS[8]
  }
}

function showTooltip(event, data) {
  const x = event.target.attributes.x.value
  const y = event.target.attributes.y.value
  const year = event.target.attributes['data-year'].value
  const month = monthName(event.target.attributes['data-month'].value)
  const temp = +event.target.attributes['data-temp'].value

  // Add tooltip
  const tooltip = chart.append('div')
    .attr('id', 'tooltip')
    .attr('data-year', year)
    .attr('x', x)
    .attr('y', y)
    .style('left', `${+x}px`)
    .style('top',`${+y}px`)
    .style('transform', `translate(-50%, 0)`)

  tooltip.append('p')
    .text(`${year} - ${month}`)
  tooltip.append('p')
    .text(`${temp.toFixed(1)}°C`)
  tooltip.append('p')
    .text(`${data.variance.toFixed(1)}°C`)
}

function hideTooltip() {
  d3.select('#tooltip').remove()
}
// Constants
const VARIANCE = [2.8, 3.9, 5.0,  6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8]
const COLORS = [
  'rgb(69, 117, 180)',   // veryDarkBlue 
  'rgb(116, 173, 209)',  // blue 
  'rgb(171, 217, 233)',  // lightBlue 
  'rgb(224, 243, 248)',  // veryLightBlue 
  'rgb(255, 255, 191)',  // yellow 
  'rgb(254, 224, 144)',  // lightOrange 
  'rgb(253, 174, 97)',   // orange 
  'rgb(244, 109, 67)',   // lightRed 
  'rgb(215, 48, 39)'     // red 
]

// Create chart
const chart = d3.select('body')
  .append('div')
  .attr('id', 'chart')

// Add title
chart.append('h1')
  .attr('id', 'title')
  .text('Monthly Global Land-Surface Temperature')

// Fetch Data
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'

fetch(url)
  .then(res => res.json())
  .then(json => {

    // Initialization
    const data = json.monthlyVariance
    const baseTemp = json.baseTemperature
    const width = 1600
    const height = 540
    const padding = 40
    const paddingBottom = padding + 80
    const paddingLeft = padding + 80

    // Add description
    chart.append('h3')
      .attr('id', 'description')
      .text(`1753 - 2015: base temperature ${baseTemp}℃`)

    // Add SVG
    const svg = chart.append('svg')
      .attr('width', width)
      .attr('height', height)

    // Set scales for X and Y axis
    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
      .range([0, width - (padding * 2)])
    const yScale = d3.scaleLinear()
      .domain([d3.max(data, d => d.month) + 0.5, d3.min(data, d => d.month) - 0.5])
      .range([height - padding - paddingBottom, 0])

    // Format tick labels
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => d.toString())
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => monthName(d))

    // Add X and Y axis
    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(${paddingLeft}, ${height - paddingBottom})`)
      .call(xAxis)
    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${paddingLeft}, ${padding})`)
      .call(yAxis)

    // Add rect
    const barHeight = 32
    svg.selectAll('.cell')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => paddingLeft + xScale(d.year))
      .attr('y', d => padding + yScale(d.month) - (barHeight / 2))
      .attr('width', '6')
      .attr('height', barHeight)
      .attr('fill', d => fillColor(baseTemp, d.variance))
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => baseTemp - d.variance)
      .on('mouseover', (event, d) => showTooltip(event, d))
      .on('mouseleave', hideTooltip)

    // Add legend
    const legendWidth = 37
    const legendHeight = 28

    // Add legend colors
    const legend = svg.append('g')
      .attr('id', 'legend')
    legend.selectAll('rect')
      .data(COLORS)
      .enter()
      .append('rect')
      .attr('x', (_, i) => legendWidth * i + paddingLeft)
      .attr('y', height - padding - legendHeight)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', color => color)

    // Add ticks
    legend.selectAll('.ticks')
      .data(VARIANCE)
      .enter()
      .append('line')
      .attr('x1', (_, i) => legendWidth * i + paddingLeft)
      .attr('y1', () => height - padding)
      .attr('x2', (_, i) => legendWidth * i + paddingLeft)
      .attr('y2', () => height - padding + 10)

    // Add legend text
    legend.selectAll('text')
      .data(VARIANCE)
      .enter()
      .append('text')
      .attr('x', (_, i) => legendWidth * i + paddingLeft)
      .attr('y', height - padding + 20)
      .text(d => d.toFixed(1))
      .style('text-anchor', 'middle')
      .style('font-size', '.75rem')
  })
