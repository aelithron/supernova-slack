import { getClients } from "../index.js";

export default async function initEvents() {
  const { user, helper } = getClients();
  if (!user || !helper) return;
  helper.command("/huddles", async ({ ack, command, respond }) => {
    ack();
    const args: string[] = command.text.split(" ");
    if (args.length < 1 || (args[0] !== "join" && args[0] !== "leave")) {
      await respond({
        response_type: "ephemeral",
        text: "incorrect usage!\n• /huddles join [channel]: have @supernova join a huddle in a channel\n• /huddles leave [channel]: have @supernova leave a huddle in a channel",
        blocks: [{ type: "section", text: { type: "mrkdwn", text: "*incorrect usage!*\n• `/huddles join [channel]`: have <@U0BESAE7KPD> join a huddle in a channel\n• `/huddles leave [channel]`: have <@U0BESAE7KPD> leave a huddle in a channel" } }]
      });
      return;
    }
    let huddleChannel;
    if (args.length >= 2) {
      const match = args[1]!.match(/<#C[A-Z0-9]{8,11}>/gm);
      if (!match) {
        respond({ response_type: "ephemeral", text: `you provided a channel to join, but in the wrong format! make sure the channel name is blue in the command.` });
        return;
      }
      huddleChannel = args[1]!.slice(2, -1);
    } else huddleChannel = command.channel_id;
    if (args[0] === "join") {
      try {
        const form = new FormData();
        form.append("channel_id", huddleChannel);
        const res = await fetch("https://hackclub.enterprise.slack.com/api/rooms.join", {  });
      } catch (e) {
        console.error(`[helper] error joining a huddle in ${args[1]}: ${e}`);
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
}