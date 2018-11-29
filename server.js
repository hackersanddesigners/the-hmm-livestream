const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('basic-auth');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const Mux = require('@mux/mux-node');
const { Video } = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET);
let STREAM;

const webhookUser = {
  name: 'muxer',
  pass: 'muxology',
};

// init sqlite db
const util = require('util');
const fs = require('fs');
const stateFilePath = './.data/stream';
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const auth = (req, res, next) => {
  function unauthorized(res) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.send(401);
  };

  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
      return unauthorized(res);
  };

  if (user.name === webhookUser.name && user.pass === webhookUser.pass) {
      return next();
  } else {
      return unauthorized(res);
  };
};

const createStreamKey = async () => {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    console.error("It looks like you haven't set up your Mux token in the .env file yet!");
    return;
  }

  let { data: { data: stream }} = await Video.liveStreams.create({
    playback_policy: 'public',
    reconnect_window: 10,
    new_asset_settings: { playback_policy: 'public' }
  });

  return stream;
};

const getStreamDetails = async (streamId) => {
  let { data: { data: stream } } = await Video.liveStreams.get(streamId);

  return stream;
}

const initialize = async () => {
  try {
    const stateFile = await readFile(stateFilePath, 'utf8');
    STREAM = JSON.parse(stateFile);
    console.log('Found an existing stream! Fetching updated data.');
    STREAM = await getStreamDetails(STREAM.id);
  } catch (err) {
    console.log('No stream found, creating a new one.');
    STREAM = await createStreamKey();
    await writeFile(stateFilePath, JSON.stringify(STREAM));
  }

  return STREAM;
}

// Hacky way of getting the playback ID (we know there's one public one).
const getPlaybackId = stream => stream['playback_ids'][0].id;

const publicStreamDetails = stream => ({
  status: stream.status,
  playbackId: getPlaybackId(stream),
  recentAssets: stream['recent_asset_ids'],
})

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/stream', async (req, res) => {
  const { data: { data: stream } } = await Video.liveStreams.get(STREAM.id);
  res.json(
    publicStreamDetails(stream)
  );
});

app.get('/recent', async (req, res) => {
  const recentAssetIds = STREAM['recent_asset_ids'] || [];

  const assets = await Promise.all(
    recentAssetIds
    .reverse()
    .slice(0, 5)
    .map((assetId) =>
      Video.assets.get(assetId).then(muxRes => {
        const asset = muxRes.data.data;

        return {
          playbackId: getPlaybackId(asset),
          status: asset.status,
          created_at: asset.created_at,
        };
      })
    )
  );

  res.json(assets);
});

app.post('/mux-hook', auth, function (req, res) {
  STREAM.status = req.body.data.status;

  switch (req.body.type) {
    case 'video.live_stream.idle':
      STREAM['recent_asset_ids'] = req.body.data['recent_asset_ids'];
    case 'video.live_stream.active':
      io.emit('stream_update', publicStreamDetails(STREAM));
      break;
    default:
      // Relaxing.
  }

  res.status(200).send('Thanks, Mux!');
});

initialize().then((stream) => {
  const listener = http.listen(process.env.PORT || 4000, function() {
    console.log('Your app is listening on port ' + listener.address().port);
    console.log('HERE ARE YOUR STREAM DETAILS!');
    console.log(`Stream Key: ${stream.stream_key}`);
  });
});
