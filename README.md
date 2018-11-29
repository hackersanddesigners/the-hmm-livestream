# Tubelet

To remix on Glitch and make your own Tubelet, you need to:

Add your own Mux access token to the `.env` file:

```
MUX_TOKEN_ID=YourAccessTokenId
MUX_TOKEN_SECRET=YourAccessTokenSecret
```

After you've remixed, you need to add your Glitch application as a webhook in the Mux dashboard. By default, the server uses basic auth for Mux webhooks, so if you haven't changed it you can add something like this as a webhook endpoint:

```
https://muxer:muxology@your-tubelet.glitch.me/mux-hook
```

And there you go! The first time the app starts up the console will spit out a stream key for you. From there you can start streaming.

Have fun! 🤘
