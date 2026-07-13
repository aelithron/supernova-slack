window.joinHuddle = async (meeting, attendee) => {
  const config = new ChimeSDK.MeetingSessionConfiguration(meeting, attendee);
  const logger = new ChimeSDK.ConsoleLogger();
};