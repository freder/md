/* eslint-disable indent */

const pinnedOutlineColor = 'black';

const commonFetchOpts = {
	method: 'post',
	headers: {
		'Content-Type': 'application/json'
	},
};


const pinNode = (id, xy) => {
	return fetch('/pin',
		{
			...commonFetchOpts,
			body: JSON.stringify({ id, xy }),
		}
	);
};


const unpinNode = (id) => {
	return fetch('/unpin',
		{
			...commonFetchOpts,
			body: JSON.stringify({ id }),
		}
	);
};


fetch('data.json')
	.then((res) => res.json())
	.then(async (data) => {
		console.log(data);

		// load positions
		let positions = {};
		await fetch('/positions.json')
			.then((res) => res.json())
			.then((pos) => {
				positions = pos;
				console.log(pos);
			});

		const width = 600;
		const height = width;

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
				.attr('fill', 'black');

		const link = svg.append('g')
			.selectAll('line')
			.data(links)
			.enter()
				.append('line')
				.attr('stroke', '#999')
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
			}

			function dragended(d) {
				pinNode(d.id, [d.fx, d.fy]);
				if (!d3.event.active) {
					simulation.alphaTarget(0);
				}
			}

			return d3.drag()
				.on('start', dragstarted)
				.on('drag', dragged)
				.on('end', dragended);
		};

		const node = svg.append('g')
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
				return (d.isMissing) ? 'red' : 'blue';
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
				return (d.frontmatter && d.frontmatter.public) ? 'black' : 'lightgrey';
			});

		simulation.on('tick', () => {
			link
				.attr('x1', d => d.source.x)
				.attr('y1', d => d.source.y)
				.attr('x2', d => d.target.x)
				.attr('y2', d => d.target.y);

			node
				.attr('transform', (d) => {
					return 'translate(' + d.x + ',' + d.y + ')';
				});
		});
	});
