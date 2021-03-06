/* global pinNode, unpinNode */
/* eslint-disable indent */

const nodeColorNormal = 'blue';
const nodeColorMissing = 'red';
const pinnedOutlineColor = 'black';
const edgeColor = '#999';
const labelColor = 'black';


Promise.all([
	fetch('/data.json').then((res) => res.json()),
	fetch('/positions.json').then((res) => res.json()),
])
	.then(([data, positions]) => {
		console.log(data);

		const svgElem = document.querySelector('svg');
		const width = svgElem.clientWidth;
		const height = svgElem.clientHeight;

		const links = data.links;
		const nodes = data.nodes.map((node) => {
			const xy = positions[node.id];
			if (xy) {
				node.fx = xy[0];
				node.fy = xy[1];
			}
			return node;
		});

		const simulation = d3.forceSimulation(nodes)
			.force(
				'link',
				d3.forceLink(links)
					.id(d => d.id)
					.distance(70)
			)
			.force(
				'charge',
				d3.forceManyBody()
					.strength(-100)
			)
			.force(
				'center',
				d3.forceCenter(width / 2, height / 2)
			);

		const svg = d3.select('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height]);

		const defs = svg.append('defs');
		defs.append('marker')
			.attr('id', 'arrow')
			.attr('viewBox', '0 -5 10 10')
			.attr('refX', 15)
			.attr('refY', 0)
			.attr('markerWidth', 6)
			.attr('markerHeight', 6)
			.attr('orient', 'auto')
			.append('path')
				.attr('d', 'M0,-5L10,0L0,5')
				.attr('fill', edgeColor);

		const everythingGroup = svg.append('g')
			.attr('class', 'everything');

		const zoomHandler = d3.zoom()
			.on('zoom', () => {
				everythingGroup.attr('transform', d3.event.transform);
			})
			.on('start', () => {
				svgElem.style.cursor = 'grabbing';
			})
			.on('end', () => {
				svgElem.style.cursor = 'grab';
			});
		zoomHandler(svg);

		const link = everythingGroup.append('g')
			.selectAll('line')
			.data(links)
			.enter()
				.append('line')
				.attr('stroke', edgeColor)
				.attr('marker-end', 'url(#arrow)');

		const drag = (simulation) => {
			const dragstarted = (d, i, list) => {
				if (!d3.event.active) {
					simulation
						.alphaTarget(0.3)
						.restart();
				}
				d.fx = d.x;
				d.fy = d.y;
				const target = list[i];
				d3.select(target)
					.select('circle')
						.attr('stroke', pinnedOutlineColor);
			};

			function dragged(d) {
				d.fx = d3.event.x;
				d.fy = d3.event.y;
				svgElem.style.cursor = 'move';
			}

			function dragended(d) {
				pinNode(d.id, [d.fx, d.fy]);
				if (!d3.event.active) {
					simulation.alphaTarget(0);
				}
				svgElem.style.cursor = 'grab';
			}

			return d3.drag()
				.on('start', dragstarted)
				.on('drag', dragged)
				.on('end', dragended);
		};

		const node = everythingGroup.append('g')
			.selectAll('g')
			.data(nodes)
			.enter()
				.append('g')
				.call(drag(simulation))
				.on('click', (d) => {
					if (d3.event.shiftKey) {
						delete d.fx;
						delete d.fy;
						unpinNode(d.id);
						d3.select(d3.event.target)
							.attr('stroke', 'none');
					}
				});

		/*const circles =*/ node.append('circle')
			.attr('r', 5)
			.attr('fill', (d) => {
				return (d.isMissing)
					? nodeColorMissing
					: nodeColorNormal;
			})
			.attr('stroke-width', 2)
			.attr('stroke', (d) => {
				return (d.fx !== undefined)
					? pinnedOutlineColor
					: 'none';
			});

		/*const labels =*/ node.append('text')
			.text((d) => d.id)
			.attr('x', 10)
			.attr('y', 3)
			.attr('fill', (d) => {
				// return (d.frontmatter && d.frontmatter.public) ? 'black' : 'lightgrey';
				return labelColor;
			})
			.on('mousedown', (d) => {
				// prevent dragging
				d3.event.stopPropagation();
			})
			.on('click', (d) => {
				console.log(d);
			});

		simulation.on('tick', () => {
			link
				.attr('x1', d => d.source.x)
				.attr('y1', d => d.source.y)
				.attr('x2', d => d.target.x)
				.attr('y2', d => d.target.y);

			node
				.attr('transform', (d) => {
					return `translate(${d.x}, ${d.y})`;
				});
		});
	});
