var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const Mux = require('@mux/mux-node');
const { Video } = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET);

// init sqlite db
var SQL = require('sql-template-strings');
var dbFile = './.data/sqlite.db';
var sqlite = require('sqlite');

const dbPromise = Promise.resolve()
  .then(() => sqlite.open(dbFile))
  .then(db => db.migrate({ force: 'last' }));

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
  db.serialize(function() {
    db.run('INSERT INTO Dreams (dream) VALUES ("Find and count some sheep"), ("Climb a really tall mountain"), ("Wash the dishes")');
  });
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
