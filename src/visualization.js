const R = require('ramda');


// const prepareData =
module.exports.prepareData = (docs) => {
	const links = [];

	// create placeholder nodes for missing documents
	const missing = R.pipe(
		R.map(R.prop('brokenLinks')),
		R.unnest,
		R.map(R.prop('relativeToRoot')),
		R.uniq,
		R.map((relativeToRoot) => ({
			id: relativeToRoot,
			isMissing: true,
		})),
	)(docs);

	const nodes = [...missing];
	docs.forEach((item) => {
		const node = {
			...R.omit(['backLinks'], item),
			id: item.file,
			links: item.links.map(
				R.prop('relativeToRoot')
			),
			brokenLinks: item.brokenLinks.map(
				R.prop('relativeToRoot')
			),
		};
		nodes.push(node);
		[
			...node.links,
			...node.brokenLinks,
		].forEach((link) => {
			links.push({
				source: node.id,
				target: link,
			});
		});
	});

	return { nodes, links };
};
