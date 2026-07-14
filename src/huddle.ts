import path from "node:path";
import { getHuddles } from "./index.js";
import { fileURLToPath } from "node:url";

export async function joinHuddle(body: SlackHuddleBody): Promise<boolean> {
  const { browser, list } = getHuddles();
  if (!browser) return false;
  const page = await browser.newPage();
  const basePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../");
  await page.goto(`file://${path.join(basePath, "./huddles/index.html")}`);
  await page.addScriptTag({ path: path.join(basePath, "./huddles/index.js") });
  const joinEffect = path.join(basePath, "./huddles/sounds/join.mp3");
  await page.evaluate((body, joinEffect) => {
    //@ts-expect-error - reference to in-browser code
    window.joinHuddle(body.call.free_willy.meeting, body.call.free_willy.attendee);
    //@ts-expect-error - reference to in-browser code but again
    setTimeout(() => window.playSound(joinEffect), 1000);
  }, body, joinEffect);
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