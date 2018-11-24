var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const Mux = require('@mux/mux-node');
const { Video } = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET);

// init sqlite db
const util = require('util');
const fs = require('fs');
const stateFilePath = './.data/stream';
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const createStreamKey = async () => {
  // let stream = await Video.liveStreams.create({ playback_policy: 'public', new_asset_settings: { playback_policy: 'public' } });
  let { data: { data: [ stream ] } } = await Video.liveStreams.list();
  
  return stream;
};

const initializeDb = async () => {
  let stream;

  try {
    const stateFile = await readFile(stateFilePath, 'utf8');
    stream = JSON.parse(stateFile);
    console.log('Found an existing stream!');
  } catch (err) {
    console.log('No stream found, creating a new one.');
    console.error(err);
    stream = await createStreamKey();
    await writeFile(stateFilePath, JSON.stringify(stream));
  }
}

initializeDb();

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// endpoint to get all the dreams in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
app.get('/getDreams', function(request, response) {
  db.all('SELECT * from Dreams', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

app.post('/streams', async (request, response) => {
  const createBody = { 
    playback_policy: 'public', 
    new_asset_settings: { 
      playback_policy: 'public' 
    }
  };

  let { data: { data: stream } } = await Video.liveStreams.create(createBody);
  const db = await dbPromise;
  const insert = await db.run(SQL`INSERT INTO streams (streamKey, streamId) VALUES (${stream.streamKey}, ${stream.streamId})`);
  console.log(insert);
});

app.get('/streams', async (request, response) => {
  const res = await Video.liveStreams.list();
  console.log(res.data.data);
  response.send(JSON.stringify(res.data.data));
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
