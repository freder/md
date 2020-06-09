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
