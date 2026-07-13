import { App } from "@slack/bolt";
import { WebClient } from "@slack/web-api";
import { configDotenv } from "dotenv";
import initEvents from "./events.js";
import { Cron } from "croner";
import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer";

let userClient: WebClient | undefined;
let botClient: App | undefined;
let huddleBrowser: Browser | undefined;
const huddles: Map<string, { page: Page, ts: string }> = new Map();

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
  if (!process.env.SLACK_XOXP) {
    console.error(`user-listener credentials are missing! please make sure "SLACK_XOXP" is correctly set.`);
    process.exit(1);
  }
  userClient = new WebClient(process.env.SLACK_XOXC, { headers: { "Cookie": `d=${process.env.SLACK_XOXD}` } });
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
  await initEvents();
  new Cron("0 * * * *", { timezone: "America/Denver" }, async () => {
    if (!userClient || !botClient) return;
    try {
      await userClient.auth.test();
    } catch {
      await botClient.client.chat.postMessage({ channel: "U08RJ1PEM7X", text: "hey <@U08RJ1PEM7X>! the userbot's authentication tokens (`xoxc` and `xoxd`) have expired.\nplease log in to the user account and refresh the tokens in the env vars!" });
    }
  });
  huddleBrowser = await puppeteer.launch({ args: ["--no-sandbox", "--use-fake-ui-for-media-stream"], headless: true });
}
async function shutdown() {
  console.log("[internal] shutting down...");
  if (huddleBrowser) await huddleBrowser.close();
  if (botClient) botClient.stop();
  process.exit(0);
}
export function getClients(): { user: WebClient | undefined, helper: App | undefined } { return { user: userClient, helper: botClient }; }
export function getHuddles(): { browser: Browser | undefined, list: Map<string, { page: Page, ts: string }> } { return { browser: huddleBrowser, list: huddles }; }
init();
process.on("SIGTERM", () => shutdown());
process.on("SIGINT", () => shutdown());
process.on("SIGUSR2", () => shutdown());