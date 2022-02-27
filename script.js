function monthName(month) {
  const date = new Date()
  const monthName = d3.timeFormat('%B')
  date.setMonth(month - 1)
  return monthName(date)
}

function fillColor(baseTemp, variance, colors) {
  const monthTemp = baseTemp + variance

  if (monthTemp < colors[0].variance) {
    return colors[0].rgb
  } else if (monthTemp < colors[1].variance) {
    return colors[1].rgb
  } else if (monthTemp < colors[2].variance) {
    return colors[2].rgb
  } else if (monthTemp < colors[3].variance) {
    return colors[3].rgb
  } else if (monthTemp < colors[4].variance) {
    return colors[4].rgb
  } else if (monthTemp < colors[5].variance) {
    return colors[5].rgb
  } else if (monthTemp < colors[6].variance) {
    return colors[6].rgb
  } else if (monthTemp < colors[7].variance) {
    return colors[7].rgb
  } else {
    return colors[8].rgb
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

    // Colors
    const colors = [
      { rgb: 'rgb(69, 117, 180)', variance: 3.9 },   // veryDarkBlue 
      { rgb: 'rgb(116, 173, 209)', variance: 5.0 },  // blue 
      { rgb: 'rgb(171, 217, 233)', variance: 6.1 },  // lightBlue 
      { rgb: 'rgb(224, 243, 248)', variance: 7.2 },  // veryLightBlue 
      { rgb: 'rgb(255, 255, 191)', variance: 8.3 },  // yellow 
      { rgb: 'rgb(254, 224, 144)', variance: 9.4 },  // lightOrange 
      { rgb: 'rgb(253, 174, 97)', variance: 10.5 },  // orange 
      { rgb: 'rgb(244, 109, 67)', variance: 11.6 },  // lightRed 
      { rgb: 'rgb(215, 48, 39)', variance: 12.7 }    // red 
    ]

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
      .attr('fill', d => fillColor(baseTemp, d.variance, colors))
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => baseTemp - d.variance)
      .on('mouseover', (event, d) => showTooltip(event, d))
      .on('mouseleave', hideTooltip)

    // Add legend
    const legendWidth = 37
    const legendHeight = 28

    // Set scale
    const legendScale = d3.scaleSequential()
    .domain([d3.min(colors, d => d.variance), d3.max(colors, d => d.variance)])
    .range([0, 295])

    // Add legend colors
    const legend = svg.append('g')
      .attr('id', 'legend')
    legend.selectAll('rect')
      .data(colors)
      .enter()
      .append('rect')
      .attr('x', d => legendScale(d.variance) + paddingLeft)
      .attr('y', height - padding - legendHeight)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', d => d.rgb)

    // Add legend text
    legend.selectAll('text')
      .data(colors)
      .enter()
      .append('text')
      .attr('x', d => legendScale(d.variance) + paddingLeft + legendWidth - 10)
      .attr('y', height - padding + 20)
      .text(d => d.variance.toFixed(1))
  })
