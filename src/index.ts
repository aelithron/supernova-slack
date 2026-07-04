import { App } from "@slack/bolt";
import { WebClient } from "@slack/web-api";
import { configDotenv } from "dotenv";
import initEvents from "./helper/events.js";
import polyfill from "./polyfill.js";

let userClient: WebClient | undefined;
let botClient: App | undefined;
async function init() {
  configDotenv({ quiet: true });
  if (!process.env.SLACK_XOXC || !process.env.SLACK_XOXD) {
    console.error(`user credentials are missing! please make sure "SLACK_XOXC" and "SLACK_XOXD" are correctly set.`);
    process.exit(1);
  }
  if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_APP_TOKEN) {
    console.error(`bot credentials are missing! please make sure "SLACK_BOT_TOKEN" and "SLACK_APP_TOKEN" are correctly set.`);
    process.exit(1);
  }
  userClient = new WebClient(process.env.SLACK_XOXC, { headers: { "Cookie": `d=${process.env.SLACK_XOXD}` }});
  botClient = new App({ token: process.env.SLACK_BOT_TOKEN, appToken: process.env.SLACK_APP_TOKEN, socketMode: true });
  try {
    const me = await userClient.auth.test();
    console.log(`[init] userbot is ready as ${me.user} (${me.user_id})!`);
  } catch (e) {
    console.error(`[init] error starting userbot: ${e}`);
    process.exit(1);
  }
  try {
    await botClient.start();
    botClient.logger.setName("supernova-helper-bot");
    const me = await botClient.client.auth.test();
    console.log(`[init] helper bot is ready as ${me.user} (${me.user_id})!`);
  } catch (e) {
    console.error(`[init] error starting helper bot: ${e}`);
    process.exit(1);
  }
  polyfill();
  await initEvents();
  //await userClient.chat.postMessage({ channel: "C0AS67RMDLN", text: "this is being sent by some typescript code! :3" });
}
export function getClients(): { user: WebClient | undefined, helper: App | undefined } { return { user: userClient, helper: botClient }; }
init();