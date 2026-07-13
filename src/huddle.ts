import path from "node:path";
import { getHuddles } from "./index.js";
import { fileURLToPath } from "node:url";

export async function joinHuddle(body: SlackHuddleBody): Promise<boolean> {
  const { browser, list } = getHuddles();
  if (!browser) return false;
  const page = await browser.newPage();
  await page.goto(`file://${path.join(path.dirname(fileURLToPath(import.meta.url)), "../huddles/index.html")}`);
  await page.addScriptTag({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../huddles/index.js") });
  await page.evaluate((body) => {
    //@ts-expect-error - reference to in-browser code
    window.joinHuddle(body.call.free_willy.meeting, body.call.free_willy.attendee);
  }, body);
  list.set(body.huddle.channels[0]!, { page, ts: body.huddle.thread_root_ts });
  return true;
}

export type SlackHuddleBody = {
  ok: boolean,
  call: {
    free_willy: {
      meeting: {
        ExternalMeetingId: string,
        MediaPlacement: {
          AudioFallbackUrl: string,
          AudioHostUrl: string,
          ScreenDataUrl: string,
          ScreenSharingUrl: string,
          ScreenViewingUrl: string,
          SignalingUrl: string,
          TurnControlUrl: string,
          EventIngestionUrl: string | null
        },
        MediaRegion: string,
        MeetingId: string
      },
      attendee: {
        AttendeeId: string,
        ExternalUserId: string,
        JoinToken: string
      }
    },
    call_id: string
  },
  huddle: {
    id: string,
    created_by: string,
    channels: string[],
    has_ended: boolean,
    huddle_link: string
    thread_root_ts: string,
    locale: string
  }
}