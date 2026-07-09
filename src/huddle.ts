import { ConsoleLogger, DefaultDeviceController, DefaultMeetingSession, LogLevel, MeetingSessionConfiguration } from "amazon-chime-sdk-js";

export async function joinHuddle(body: SlackHuddleBody): Promise<boolean> {
  return true;
  const config = new MeetingSessionConfiguration(body.call.free_willy.meeting, body.call.free_willy.attendee);
  const logger = new ConsoleLogger(`huddle-logger-${body.huddle.id}`, LogLevel.WARN);
  const controller = new DefaultDeviceController(logger);
  const huddle = new DefaultMeetingSession(config, logger, controller);
  try {
    huddle.audioVideo.start();
    return true;
  } catch (e) {
    console.error(`[huddle] error connecting to chime (for a huddle in ${body.huddle.channels[0]}): ${e}`);
    return false;
  }
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