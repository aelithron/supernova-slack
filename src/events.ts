import { joinHuddle, type SlackHuddleBody } from "./huddle.js";
import { getClients, getHuddles } from "./index.js";

export default async function initEvents() {
  const { user, helper, userListener } = getClients();
  if (!user || !helper || !userListener) return;
  const userID = (await user.auth.test()).user_id as string;
  helper.command("/huddles", async ({ ack, command, respond }) => {
    ack();
    const args: string[] = command.text.split(" ");
    if (args.length < 1 || (args[0] !== "join" && args[0] !== "leave")) {
      await respond({
        response_type: "ephemeral",
        text: "incorrect usage!\n• /huddles join [channel]: have @supernova join a huddle in a channel\n• /huddles leave [channel]: have @supernova leave a huddle in a channel",
        blocks: [{ type: "section", text: { type: "mrkdwn", text: `*incorrect usage!*\n• \`/huddles join [channel]\`: have <@${userID}> join a huddle in a channel\n• \`/huddles leave [channel]\`: have <@${userID}> leave a huddle in a channel` } }]
      });
      return;
    }
    let huddleChannel;
    if (args.length >= 2) {
      const match = args[1]!.match(/<#C[A-Z0-9]{8,11}>/gm);
      if (!match) {
        respond({ response_type: "ephemeral", text: "you provided a channel to join, but in the wrong format! make sure the channel name is blue in the command." });
        return;
      }
      huddleChannel = args[1]!.slice(2, -1);
    } else huddleChannel = command.channel_id;
    if (args[0] === "join") {
      try {
        const data = new FormData();
        data.append("channel_id", huddleChannel);
        data.append("regions", "us-east-2");
        data.append("token", process.env.SLACK_XOXC);
        const check = await fetch("https://hackclub.enterprise.slack.com/api/rooms.canJoinHuddle", { method: "POST", body: data, headers: { "Cookie": `d=${process.env.SLACK_XOXD}` } });
        if (!(await check.json() as { ok: boolean }).ok) {
          respond({ response_type: "ephemeral", text: `<@${userID}> can't join huddles in <#${huddleChannel}>! you likely need to invite <@${userID}> to your channel.` });
          return;
        }

        data.append("multidevice", true);
        const res = await fetch("https://hackclub.enterprise.slack.com/api/rooms.join", { method: "POST", body: data, headers: { "Cookie": `d=${process.env.SLACK_XOXD}` } });
        const info = await res.json() as SlackHuddleBody;
        if (!info.ok) {
          respond({ response_type: "ephemeral", text: `<@${userID}> can't join huddles in <#${huddleChannel}>! you likely need to invite <@${userID}> to your channel.` });
          return;
        }
        if (await joinHuddle(info)) {
          respond({ response_type: "ephemeral", text: `got it! telling <@${userID}> to join the huddle...` });
          await user.chat.postMessage({ channel: huddleChannel, thread_ts: info.huddle.thread_root_ts as string, text: `hi everyone! <@${command.user_id}> invited me to this huddle :3` });
        } else {
          respond({ response_type: "ephemeral", text: `there was an error joining the huddle in <#${huddleChannel}>!` });
          return;
        }
      } catch (e) {
        console.error(`[helper] error joining a huddle in ${huddleChannel}: ${e}`);
        respond({ response_type: "ephemeral", text: `there was an error joining the huddle in <#${huddleChannel}>!` });
        return;
      }
      return;
    }
    if (args[0] === "leave") {
      const { list } = getHuddles();
      const huddle = list.get(huddleChannel);
      if (!huddle) {
        respond({ response_type: "ephemeral", text: `i'm not in a huddle in <#${huddleChannel}>!` });
        return;
      }
      await huddle.page.evaluate(() => {
        //@ts-expect-error - reference to in-browser code
        huddle.audioVideo.stop();
      });
      await huddle.page.close();
      list.delete(huddleChannel);
      respond({ response_type: "ephemeral", text: `got it! telling <@${userID}> to leave the huddle...` });
      await user.chat.postMessage({ channel: huddleChannel, thread_ts: huddle.ts, text: `<@${command.user_id}> told me to leave this huddle, cya all later! :byee:` });
      return;
    }
  });
  userListener.message(`<@${userID}>`, async ({ message }) => {
    if (message.type !== "message" || (message.subtype !== undefined && message.subtype !== "file_share") || message.user === userID || message.channel_type === "im") return;
    let messageContents = `hiii <@${message.user}>! :3`;
    switch (message.user) {
      case "U08RJ1PEM7X":
        messageContents = "hi mom! :cat-heart:";
        break;
      case "U0BE3DA1YFR":
        messageContents = "hi doppel!! :doppel-pet:";
        break;
      case "U08CJCZ2Z9S":
      case "U06SQJ508LF":
        messageContents = `hiii <@${message.user}>! thanks for organizing <#C0BEAG698GH> and giving nova the motivation to make me! :cat-heart:`;
        break;
      default:
        break;
    }
    await user.chat.postMessage({ channel: message.channel, thread_ts: message.thread_ts || message.ts, text: messageContents });
  });
  helper.event("app_mention", async ({ event }) => {
    if (event.text.includes(`<@${userID}>`) || (event.subtype !== undefined && event.subtype !== "file_share")) return;
    await user.chat.postMessage({ channel: event.channel, thread_ts: event.thread_ts || event.ts, text: `hey <@${event.user}>! you were probably looking for me :3` });
  });
  userListener.message(async ({ message }) => {
    if (message.type !== "message" || (message.subtype !== undefined && message.subtype !== "file_share") || message.channel_type !== "im") return;
    const args: string[] = message.text!.split(" ");
    if (!args || args.length < 1) {
      await user.chat.postMessage({ channel: message.channel, text: `unrecognized message! say "help" for command info!` });
      return;
    }
    switch (args[0]) {
      case "hi":
        await user.chat.postMessage({
          channel: message.channel, text: `hiii <@${message.user}>! :3\nsay "help" for command info!`, blocks: [
            { type: "section", text: { type: "mrkdwn", text: `hiii <@${message.user}>! :3` } },
            { type: "context", elements: [{ type: "mrkdwn", text: `say "help" for command info!` }] }
          ]
        });
        break;
      case "huddles":
        await user.chat.postMessage({ channel: message.channel, markdown_text: "you're probably looking for `/huddles`, silly :3" });
        break;
      case "help":
        await user.chat.postMessage({
          channel: message.channel, text: `hi! here's the commands i recognize! (open this full message to see the commands! :3)`, blocks: [
            { type: "section", text: { type: "plain_text", text: "hi! here's the commands i recognize!" } },
            { type: "section", text: { type: "mrkdwn", text: `• \`hi\`: have me say hi to you!\n• \`help\`: show this message.` } },
            { type: "section", text: { type: "plain_text", text: "you can also try my slash commands:" } },
            { type: "section", text: { type: "mrkdwn", text: `• \`/huddles\`: have me join or leave a huddle (coming soon!)` } }
          ]
        });
        break;
      default:
        await user.chat.postMessage({ channel: message.channel, text: `unrecognized command! say "help" for command info!` });
    }
  });
}