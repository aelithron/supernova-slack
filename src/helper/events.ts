import { joinHuddle, type SlackHuddleBody } from "../huddle.js";
import { getClients } from "../index.js";

export default async function initEvents() {
  const { user, helper } = getClients();
  if (!user || !helper) return;
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
      console.log(huddleChannel);
      return;
    }
  });
  helper.message(`<@${userID}>`, async ({ message }) => {
    if (message.type !== "message" || (message.subtype !== undefined && message.subtype !== "file_share")) return;
    if (message.user === userID) return;
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
}