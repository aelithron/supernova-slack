// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function joinHuddle(body: SlackHuddleBody): Promise<boolean> {
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