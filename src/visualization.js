const R = require('ramda');


// const prepareData =
module.exports.prepareData = (fileItems) => {
	const links = [];

	// create placeholder nodes for missing documents
	const missing = R.pipe(
		R.map(R.prop('brokenLinks')),
		R.unnest,
		R.uniq,
		R.map((id) => ({ id, isMissing: true })),
	)(fileItems);

	const nodes = [...missing];
	fileItems.forEach((item) => {
		nodes.push({
			...item,
			id: item.file,
		});
		[
			...item.links,
			...item.brokenLinks,
		].forEach((l) => {
			links.push({
				source: item.file,
				target: l,
			});
		});
	});

	return { nodes, links };
};
