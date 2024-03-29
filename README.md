# The Hmm

Single-page app to livestream The Hmm events.

Starting off from [this codebase](https://mux.com/articles/how-to-build-your-own-live-streaming-app-with-mux-video/), but heavily deformed it along the way.

## License

If you use this codebase to build a livestream platform, please credit with the following text: "This codebase has been initially developed as part of a collaboration between Hackers and Designers and The Hmm. The source code is licensed under MIT".

## Setup

The app runs on node.js (`v13.6.0`). Depending on where you install this code, I suggest to use [nvm](https://github.com/nvm-sh/nvm) to manage different node version on the same machine. Else just make sure to have node v13 installed.

The repo contains a `public` folder and an `app` folder. You need to first compile the code in the app folder, which handles the frontend of the app, and then run the main app inside the public folder.

1. Clone the repo, eg with `git clone https://github.com/hackersanddesigners/the-hmm-livestream` (or by using the download button and clicking on *Download ZIP*)
2. (open a new terminal and) Enter the repo folder by doing `cd the-hmm-livestream`
3. First we need to bundle the frontend part of the app: 
  - Move to the app sub-folder: `cd app`
  - Then type `npm install`; assuming you are running node v13, everything should be installed with no error; 
  - After that do `npm run deploy`. when the process is done, the necessary files will be created and added to the `public/assets` folder
4. We now move to the `public` folder: `cd ../public`. 
   - To be sure all is done, let’s do `cd/assets && ls` and check the files `bundle.js` and `bundle.css` are there
5. After this, open the `.env` file inside the `public` folder and add the necessary values after each key

```
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MOLLIE_API_KEY=
MOLLIE_REDIRECT_URL=
MOLLIE_WEBHOOK_URL=
EXPORT_FOLDER=files/export
```
  
  - `MUX_TOKEN_ID`: get this value when creating a new api key from the MUX account
  - `MUX_TOKEN_SECRET`: get this value when creating a new api key from the MUX account
  - `MOLLIE_API_KEY`: get this value when creating a new api key from the Mollie account
  - `MOLLIE_REDIRECT_URL`: set a full url for the page Mollie should redirect to after the payment checkout is done, eg `https://live.hackersanddesigners.nl`
  - `MOLLIE_WEBHOOK_URL`: set a full url to use with Mollie’s Webhook system, eg `https://live.hackersanddesigners.nl/donate/webhook`
  - `EXPORT_FOLDER`: path to folder used for the exported HTML documents that contain a list of shared URLs from a given stream, eg `files/export`; in the frontend app only `export` is used when accessing the HTML files but express.js needs a root folder out of which to serve static files

6. You can set whether the MUX stream is in `test-mode` or not, by changing the boolean on line 71 of `public/server.js`
7. For completeness, there is a `.data` folder inside `public` with two files: `db.json` and `stream`; both are created automatically, the first when the first chat message is sent, the second when we’ll run the app and the backend will talk with the MUX APIs to setup a new stream (if the stream file is found, it will be used instead)
  - You can reset the chat history by deleting the `db.json` file and restarting the p2m process
8. Finally, from inside the `public` folder:
  - Let’s first do `npm install` to get all the necessary packages
  - Then let’s run the app by doing `npm run start` (this runs the command `node server.js`, you can find it inside the `package.json` file in the `public` folder, under the `scripts` key). 
  - When the app talks with the MUX APIs, *the terminal will print the key we need to use with [OBS](ht*tps://obsproject.com/) to setup the connection between the computer that is going to stream and the stream created in our MUX account; let’s copy this key and put it inside the streaming configuration for OBS. this key is re-printed any time we run the app (by doing `npm run start`), so we can always double check in case we forget (this key is read from the `stream` file inside the `public/.data`)
  
[This article](https://docs.mux.com/docs/configure-broadcast-software) explains how to setup OBS with MUX.
  
## Server

Create a webhook in MUX to be able to listen from the app, when the livestream starts and ends. Check here for [docs](https://docs.mux.com/docs/webhooks).

### Process management

As said, to run the app you need to do `npm run start` from within the `public` folder. To keep this process ongoing, we can either use [pm2](https://github.com/Unitech/pm2) or a [systemd](https://en.m.wikipedia.org/wiki/Systemd) configuration file.

Since `systemd` is only available on pure linux-distros, I’ll briefly explain how to setup `pm2`.

Assuming you have `node.js` installed, you can install `pm2` with

```
npm install pm2 -g
```

Then, move to the app location, and inside the `public` folder type

```
pm2 start npm run start --name="<some-name>"
```

Where `<some-name>` is replaced by how you want to call the app.

Then type `pm2 list` to see all the apps that `pm2` is controlling, you should see yours.

### Nginx config

Following a sample configuration to use with `nginx`, if that’s the software you use to manage your servers. For Apache2 or other options, the code should be similar.

```
server_name <domain-name>;
 
    access_log /var/log/nginx/live.access.log;
    error_log  /var/log/nginx/live.error.log;
 
    root /var/www/<app-folder>;
    index index.html;
 
    location ~ / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
```

This sample does not include setting up `https` with let’s encrypt.

Also, we’re running the app on port `4000`. We can change this by opening the `server.js` inside the `public` folder, go to line `206`, and change the `4000` value to something else. Then change it in the nginx configuration too.

## Options

Some options can be changed by updating `app/setting.json`:

```
{
  "title": "Hackers & Designers livestream",
  "headline": "Inefficient Tool Building\nfor Quantified Beings",
  "ticker": {
    "text": "BodyBuilding: A Platform in Transition |",
    "backgroundColour": "rgba(255, 55, 5, 1)",
    "foregroundColour": "#fff",
    "typeface": "Arial Rounded"
  },
  "logo": false,
  "donateButton": false,
  "stream": {
    "active": true,
    "testmode": true
  }
}
```

- `title`: stream title, for now used when outputting an HTML page with the list of links from a stream's chat
- `headline`: instead of an image logo, use *real* text; this is rendered as markdown, eg you can force a newline by adding `\n`; this is also used when outputting an HTML page with the list of links from a stream's chat — if any `\n` is used to correctly typeset the text for the frontpage, when used in the HTML output document any `\n` is replaced by ` ` (whitespace, aka `\s` in regex syntax)
- `ticker`:
 - set text
 - set background and foreground color
 - set typeface
- `logo`: use image for logo, or not
- enable or not the `donate button`
- `stream`: 
  - `active`: if setting this to true, the chat is displayed, else it’s not; useful when keeping the website online but without any stream going. prevents from possible “random chat abuse”.
  -  `testmode`: set stream on or off
