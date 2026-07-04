import { WebClient } from "@slack/web-api";
import { configDotenv } from "dotenv";
let userClient: WebClient;
async function init() {
  configDotenv({ quiet: true });
  userClient = new WebClient(process.env.SLACK_XOXC, { headers: { "Cookie": `d=${process.env.SLACK_XOXD}` }});
  await userClient.chat.postMessage({ channel: "C0AS67RMDLN", text: "meow" });
}
init();