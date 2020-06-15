# The Hmm

single-page app to livestream The Hmm events.

starting off from [this codebase](https://mux.com/articles/how-to-build-your-own-live-streaming-app-with-mux-video/), but heavily deformed it along the way.

## setup

the app runs on node.js (`v13.6.0`). depending on where you install this code, i suggest to use [nvm](https://github.com/nvm-sh/nvm) to manage different node version on the same machine. else just make sure to have node v13 installed.

the repo contains a `public` folder and an `app` folder. you need to first compile the code in the app folder, which handles the frontend of the app, and then run the main app inside the public folder.

1. clone the repo, eg with `git clone https://github.com/hackersanddesigners/the-hmm-livestream` (or by using the download button and clicking on *Download ZIP*)
2. (open a new terminal and) enter the repo folder by doing `cd the-hmm-livestream`
3. first we need to bundle the frontend part of the app: 
  - move to the app sub-folder: `cd app`
  - then type `npm install`; assuming you are running node v13, everything should be installed with no error; 
  - after that do `npm run deploy`. when the process is done, the necessary files will be created and added to the `public/assets` folder
4. we now move to the `public` folder: `cd ../public`. 
   - to be sure all is done, let’s do `cd/assets && ls` and check the files `bundle.js` and `bundle.css` are there
5. after this, open the `.env` file inside the `public` folder and add the necessary values after each key

  ```
  MUX_TOKEN_ID=
  MUX_TOKEN_SECRET=
  MOLLIE_API_KEY=
  MOLLIE_REDIRECT_URL=
  MOLLIE_WEBHOOK_URL=
  ```
  
  - `MUX_TOKEN_ID`: get this value when creating a new api key from the MUX account
  - `MUX_TOKEN_SECRET`: get this value when creating a new api key from the MUX account
  - `MOLLIE_API_KEY`: get this value when creating a new api key from the Mollie account
  - `MOLLIE_REDIRECT_URL`: set a full url for the page Mollie should redirect to after the payment checkout is done, eg `https://live.hackersanddesigners.nl`
  - `MOLLIE_WEBHOOK_URL`: set a full url to use with Mollie’s Webhook system, eg `https://live.hackersanddesigners.nl/donate/webhook`
6. you can set whether the MUX stream is in `test-mode` or not, by changing the boolean on line 71 of `public/server.js`
6. for completeness, there is a `.data` folder inside `public` with two files: `db.json` and `stream`; both are created automatically, the first when the first chat message is sent, the second when we’ll run the app and the backend will talk with the MUX APIs to setup a new stream (if the stream file is found, it will be used instead)
7. finally, from inside the `public` folder:
  - let’s first do `npm install` to get all the necessary packages
  - then let’s run the app by doing `npm run start` (this runs the command `node server.js`, you can find it inside the `package.json` file in the `public` folder, under the `scripts` key). 
  - when the app talks with the MUX APIs, *the terminal will print the key we need to use with [OBS](ht*tps://obsproject.com/) to setup the connection between the computer that is going to stream and the stream created in our MUX account; let’s copy this key and put it inside the streaming configuration for OBS. this key is re-printed any time we run the app (by doing `npm run start`), so we can always double check in case we forget (this key is read from the `stream` file inside the `public/.data`)
  
I suggest to also read through [the article](https://mux.com/articles/how-to-build-your-own-live-streaming-app-with-mux-video/) mentioned at the beginning, especially the final part on setting up the app with OBS.

## server

### process management

as said, to run the app you need to do `npm run start` from within the `public` folder. to keep this process ongoing, we can either use [pm2](https://github.com/Unitech/pm2) or a [systemd](https://en.m.wikipedia.org/wiki/Systemd) configuration file.

since systemd is only available on pure linux-distros, i’ll briefly explain how to setup `pm2`.

assuming you have node.js installed, you can install pm2 with

```
npm install pm2 -g
```

then, move to the app location, and inside the `public` folder type

```
pm2 start npm run start --name="<some-name>"
```

where `<some-name>` is replaced by how you want to call the app.

then type `pm2 list` to see all the apps that `pm2` is controlling, you should see yours.

### nginx config

following a sample configuration to use with `nginx`, if that’s the software you use to manage your servers. for apache2 or other options, the code should be similar.

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

this sample does not include setting up `https` with let’s encrypt.

also, we’re running the app on port `4000`. we can change this by opening the `server.js` inside the `public` folder, go to line `206`, and change the `4000` value to something else. then change it in the nginx configuration too.


