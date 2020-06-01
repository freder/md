fetch('data.json')
	.then((res) => res.json())
	.then((data) => {
		console.log(data);

		const width = 600;
		const height = width;

		const links = data.links;
		const nodes = data.nodes;

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

		const link = svg.append('g')
			.selectAll('line')
			.data(links)
			.enter()
				.append('line')
				.attr('stroke', '#999')


		const node = svg.append('g')
			.selectAll('g')
			.data(nodes)
			.enter()
				.append('g');

		const circles = node.append('circle')
			.attr('r', 5)
			.attr('fill', (d) => {
				return (d.isMissing) ? 'red' : 'blue';
			});
			
		const labels = node.append('text')
			.text((d) => d.id)
			.attr('x', 6)
			.attr('y', 3);

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
