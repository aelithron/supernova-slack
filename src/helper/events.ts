import { getClients } from "../index.js";

export default async function initEvents() {
  const { user, helper } = getClients();
  if (!user || !helper) return;
  helper.command("/huddles", async ({ ack, command, respond }) => {
    ack();
    console.log(`/huddles triggered by ${command.user_name} - ${command.text}`);
    const args: string[] = command.text.split(" ");
    if (args.length < 2) {
      await respond({
        response_type: "ephemeral",
        text: "incorrect usage!\n• /huddles join <channel>: join a huddle in a channel\n• /huddles leave <channel>: leave a huddle in a channel",
        blocks: [{ type: "section", text: { type: "mrkdwn", text: "*incorrect usage!*\n• /huddles join <channel>: join a huddle in a channel\n• /huddles leave <channel>: leave a huddle in a channel" } }]
      });
      return;
    }
    if (args[0] === "join") {
      console.log("a");
    }
  });
}