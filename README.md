# supernova-slack ![IMG](https://hackatime-badge.hackclub.com/U08RJ1PEM7X/supernova-slack)

A personal selfbot for Slack! \
This project was made for Hack Club [Doppel](https://doppel.hackclub.com)!

<a href="https://notbyai.fyi" target="_blank">
  <img src="not-by-ai.svg" alt="Developed by a human, not by AI!">
</a>

## Features
- Responds to commands sent in DMs
- Responds when pinging the user and bot accounts
- Can start, join, leave, and play sounds in huddles via a command (`/huddles`)
- Can reply when you talk in huddles
- DMs you when the user tokens (XOXC and XOXD) expire

## Usage
Right now, you can use the bot in [#supernova-playground](https://hackclub.enterprise.slack.com/archives/C0BFB5KTBM2) if you are in the Hack Club Slack.
### Self-Hosting
Some steps on how to self host the bot!
1. Get your user tokens. This generally involves logging onto Slack on an alt account, with a web browser.
  - Open your browser console and run `JSON.parse(localStorage.localConfig_v2).teams[Object.keys(JSON.parse(localStorage.localConfig_v2).teams)[0]].token` there. Copy the output, that's your XOXC token!
  - Go to the "Application" (or "Storage" on Firefox) tab of the browser devtools, and select Cookies for app.slack.com. Look through the list until you find one named `d`. Copy the value of this cookie, which will start with `xoxd`. That's your XOXD token!

2. Set up an app on [Slack's API portal](https://api.slack.com/apps). You can use the manifest in [`slack-manifest.json`](https://raw.githubusercontent.com/aelithron/supernova-slack/refs/heads/main/slack-manifest.json), feel free to change it as you wish.
  - You will need to add your alt account as a "Collaborator" on the bot, this is done through the sidebar.
  - Then, open the "Install App" tab from a page logged into your alt account. Click "Install to (your workspace)", then approve the access. The page will give you your XOXP value at the top, and your XOXB value below it. Copy these.
  - You also need to set up an app token, or `xapp`. Go back to the "Basic Information" tab in the sidebar, and scroll down to "App-Level Tokens". Create one with the scope `connections:write`. From here, copy that XAPP token value.
3. Deploy the app, following the instructions below for your Docker choice (I heavily recommend using Docker for this). Make sure you replace the placeholders with the appropriate values from the Slack API portal.
#### With Docker Compose
Save the following Compose file as `compose.yml` (making sure to fill in the tokens from steps 1 and 2):
```yaml
services:
  supernova-slack:
    image: ghcr.io/aelithron/supernova-slack:latest
    container_name: supernova-slack
    restart: unless-stopped
    environment:
      SLACK_XOXC: (insert xoxc here)
      SLACK_XOXD: (insert xoxd here)
      SLACK_XOXP: (insert xoxp here)
      SLACK_BOT_TOKEN: (insert xoxb here)
      SLACK_APP_TOKEN: (insert xapp here)
      HOSTER_SLACK_ID: (insert your personal slack id here)
```
Then, run the following in a terminal: `docker compose up -d`
#### With `docker run`
Run this command in your terminal, filling in the tokens from steps 1 and 2:
```bash
docker run -d \
  --name supernova-slack \
  -e SLACK_XOXC="" \
  -e SLACK_XOXD="" \
  -e SLACK_XOXP="" \
  -e SLACK_BOT_TOKEN="" \
  -e SLACK_APP_TOKEN="" \
  -e HOSTER_SLACK_ID="" \
  --restart unless-stopped \
  ghcr.io/aelithron/supernova-slack:latest
```
4. There you go! Your bot should now be online :3