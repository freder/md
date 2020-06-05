const fs = require('fs');

const express = require('express');

const positions = JSON.parse(
	fs.readFileSync('src/web/positions.json').toString()
);
const storePositions = () => {
	fs.writeFileSync(
		'src/web/positions.json',
		JSON.stringify(positions, null, '\t'),
		(err) => {
			if (err) {
				console.error(err);
			}
		}
	);
};


const port = 3131;
const app = express();
app.use(express.static('src/web'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/pin', (req, res) => {
	const { id, xy } = req.body;
	positions[id] = xy;
	storePositions();
});

app.post('/unpin', (req, res) => {
	const { id } = req.body;
	delete positions[id];
	storePositions();
});

app.listen(
	port,
	() => {
		console.log(`http://localhost:${port}`);
	}
);
