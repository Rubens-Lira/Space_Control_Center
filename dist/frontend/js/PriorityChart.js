import * as d3 from 'd3';
export class PriorityChart {
    constructor(controlCenter) {
        this.svg = null;
        this.width = 300;
        this.height = 200;
        this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
        this.controlCenter = controlCenter;
    }
    initialize() {
        this.createSVG();
        this.update();
    }
    createSVG() {
        const container = document.getElementById('priorityChart');
        if (!container)
            return;
        container.innerHTML = '';
        const svgElement = d3.select('#priorityChart')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
        this.svg = svgElement.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        d3.select('body').append('div')
            .attr('class', 'd3-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none');
    }
    update() {
        const data = this.getChartData();
        this.renderChart(data);
    }
    getChartData() {
        const stats = this.controlCenter.ticketService.getQueueStats();
        return [
            { priority: 'EMERGENCY', count: stats.emergency, color: '#dc2626' },
            { priority: 'HIGH', count: stats.highPriority, color: '#f59e0b' },
            { priority: 'NORMAL', count: stats.normal, color: '#10b981' }
        ];
    }
    renderChart(data) {
        if (!this.svg)
            return;
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        this.svg.selectAll('*').remove();
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.priority))
            .range([0, chartWidth])
            .padding(0.3);
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count) || 0])
            .nice()
            .range([chartHeight, 0]);
        // Eixos
        this.svg.append('g')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(d3.axisBottom(xScale))
            .style('color', '#ffffff')
            .style('font-size', '12px');
        this.svg.append('g')
            .call(d3.axisLeft(yScale))
            .style('color', '#ffffff')
            .style('font-size', '12px');
        // Barras
        this.svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.priority))
            .attr('y', d => yScale(d.count))
            .attr('width', xScale.bandwidth())
            .attr('height', d => chartHeight - yScale(d.count))
            .attr('fill', d => d.color)
            .attr('rx', 3)
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip());
        // Valores
        this.svg.selectAll('.bar-value')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'bar-value')
            .attr('x', d => xScale(d.priority) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d.count) - 5)
            .attr('text-anchor', 'middle')
            .style('fill', '#ffffff')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(d => d.count.toString());
    }
    showTooltip(event, data) {
        const tooltip = d3.select('.d3-tooltip');
        tooltip
            .style('opacity', 1)
            .html(`
                <strong>${this.getPriorityLabel(data.priority)}</strong><br/>
                Tickets: ${data.count}
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }
    hideTooltip() {
        d3.select('.d3-tooltip').style('opacity', 0);
    }
    getPriorityLabel(priority) {
        const labels = {
            'EMERGENCY': '🟥 Emergência',
            'HIGH': '🟧 Alta Prioridade',
            'NORMAL': '🟩 Normal'
        };
        return labels[priority] || priority;
    }
}
