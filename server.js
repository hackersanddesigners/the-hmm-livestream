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

const initialize = async () => {
  let stream;

  try {
    const stateFile = await readFile(stateFilePath, 'utf8');
    stream = JSON.parse(stateFile);
    console.log('Found an existing stream!');
  } catch (err) {
    console.log('No stream found, creating a new one.');
    stream = await createStreamKey();
    await writeFile(stateFilePath, JSON.stringify(stream));
  }
  
  return stream;
}

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/streams', async (request, response) => {
  const res = await Video.liveStreams.list();
  console.log(res.data.data);
  response.send(JSON.stringify(res.data.data));
});

initialize().then((stream) => {
  const listener = app.listen(process.env.PORT, function() {
    console.log('Your app is listening on port ' + listener.address().port);
    console.log('HERE ARE YOUR STREAM DETAILS!');
    console.log(`Stream Key: ${stream.stream_key}`);
  });
});