<script lang="ts">
	import * as d3 from 'd3';
	import type { InfluenceGraph } from '../interfaces';

	export let graph: InfluenceGraph;
	let svgRef: HTMLElement;
	let width: number;
	let height: number;

	$: if (graph) {
		// Get the dimensions of the parent container
		const container = document.getElementById('graph-container') as HTMLDivElement;
		width = container.clientWidth;
		height = container.clientHeight;

		const svg = d3.select(svgRef).attr('width', width).attr('height', height);

		const simulation = d3
			.forceSimulation(graph.nodes)
			.force(
				'link',
				d3
					.forceLink(graph.influences)
					.id((_d, i) => i)
					.distance(300)
					.strength(2)
			)
			.force('charge', d3.forceManyBody().strength(-1000))
			.force('center', d3.forceCenter(width / 2, height / 2));

		// Define the arrowhead marker
		svg
			.append('defs')
			.append('marker')
			.attr('id', 'arrowhead')
			.attr('markerWidth', 100) // Adjust markerWidth for the arrowhead size
			.attr('markerHeight', 50) // Adjust markerHeight for the arrowhead size
			.attr('refX', 35) // Adjust refX to move the arrowhead away from the center
			.attr('refY', 5)
			.attr('orient', 'auto')
			.append('path')
			.attr('d', 'M0,0 L0,10 L15,5 Z');

		const link = svg
			.selectAll('.link')
			.data(graph.influences)
			.enter()
			.append('line')
			.attr('class', 'link')
			.style('stroke', '#999')
			.style('stroke-width', '2.5px')
			.style('stroke-opacity', 0.6)
			.attr('marker-end', 'url(#arrowhead)'); // Add arrowheads to the end of the lines;

		// Display weights on each line
		const weightText = svg
			.selectAll('.weight-text')
			.data(graph.influences)
			.enter()
			.append('text')
			.attr('class', 'weight-text')
			.attr('text-anchor', 'middle')
			.attr('alignment-baseline', 'middle')
			.style('font-size', '20px')
			.style('fill', 'black')
			.text((d) => d.value);

		const node = svg
			.selectAll('.node')
			.data(graph.nodes)
			.enter()
			.append('g')
			.attr('class', 'node')
			.call(
				d3
					.drag()
					.on('start', (event, d) => {
						if (!event.active) simulation.alphaTarget(0.3).restart();
						d.fx = d.x;
						d.fy = d.y;
					})
					.on('drag', (event, d) => {
						d.fx = event.x;
						d.fy = event.y;
					})
					.on('end', (event, d) => {
						if (!event.active) simulation.alphaTarget(0);
						d.fx = null;
						d.fy = null;
					})
			);

		node.append('circle').attr('r', 50).style('fill', '#4d82bc');

		node
			.append('text')
			.attr('dx', 0)
			.attr('dy', 5)
			.style('text-anchor', 'middle')
			.style('font-size', '30px')
			.style('pointer-events', 'none')
			.text((d) => d.name);

		simulation.on('tick', () => {
			link
				.attr('x1', (d) => d.source.x)
				.attr('y1', (d) => d.source.y)
				.attr('x2', (d) => d.target.x)
				.attr('y2', (d) => d.target.y);

			// Update position of the weight text
			weightText
				.attr('x', (d) => (d.source.x + d.target.x) / 2)
				.attr('y', (d) => (d.source.y + d.target.y) / 2);

			node.attr('transform', (d) => `translate(${d.x},${d.y})`);
		});
	}
</script>

<div id="graph-container" class="w-full h-full">
	<svg bind:this={svgRef} />
</div>
