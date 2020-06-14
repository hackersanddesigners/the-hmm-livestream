# The Hmm

Single-page app to livestream The Hmm events.

Starting off from [this codebase](https://mux.com/articles/how-to-build-your-own-live-streaming-app-with-mux-video/), but heavily deformed it along the way.

## setup

the app runs on node.js (v13.6.0). depending on where you install this app, i suggest to use [nvm](https://github.com/nvm-sh/nvm) to manage different node version on the same machine.

the repo contains a `public` folder and an `app` folder. you need to first compile the code in the app folder, which handles the frontend of the app, and then run the main app inside the public folder.

1. clone the repo, eg with `git clone https://github.com/hackersanddesigners/the-hmm-livestream`
2. enter the repo folder `cd the-hmm-livestream`
3. bundle the frontend part of the app first: `cd app` and `npm install`; assuming you are running node 13, everything should be installed with no error; after that do `npm run deploy`, when the process is done the necessary files will be created and added inside `public/assets`
4. to check all is done, visit the public folder `cd ../public` and check the `assets` folder has both `bundle.js` and `bundle.css`
5. after this, open the `.env` file inside the `public` folder and add the necessary values after each key

  ```
  MUX_TOKEN_ID=
  MUX_TOKEN_SECRET=
  MOLLIE_API_KEY=
  MOLLIE_REDIRECT_URL=
  MOLLIE_WEBHOOK_URL=
  ```
  
  - `MUX_TOKEN_ID`: get this value when creating a new api key from the mux account
  - `MUX_TOKEN_SECRET`: get this value when creating a new api key from the mux account
  - `MOLLIE_API_KEY`: get this value when creating a new api key from the mollie account
  - `MOLLIE_REDIRECT_URL`: set a full url for the page mollie should redirect to after the payment checkout is done, eg `https://live.hackersanddesigners.nl`
  - `MOLLIE_WEBHOOK_URL`: set a full url to use with mollie’s webhook system, eg `https://live.hackersanddesigners.nl/donate/webhook`

6. for completeness, there is a `.data` folder inside `public` with two files: `db.json` and `stream`; both are created automatically, the first when the first chat message is sent, the second when we’ll run the app and the backend will talk with the MUX APIs to setup a new stream (if the stream file is found, it will be used instead)

7. finally, from inside the `public` folder, let’s first do `npm install` to get all the necessary packages. then let’s run the app by doing `npm run start` (this runs the command `node server.js`, you can find it inside the `package.json` file in the `public` folder, under the `scripts` key). when the app talks with the MUX APIs, the terminal will print the key we need to use in OBS to setup the connection between the computer that is going to stream and the stream created in our MUX account
