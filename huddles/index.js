window.joinHuddle = async (meeting, attendee) => {
  const config = new ChimeSDK.MeetingSessionConfiguration(meeting, attendee);
  const logger = new ChimeSDK.ConsoleLogger("ChimeMeetingLogs", ChimeSDK.LogLevel.INFO);
  const controller = new ChimeSDK.DefaultDeviceController(logger);
  window.huddle = new ChimeSDK.DefaultMeetingSession(config, logger, controller);
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  window.virtMic = audioCtx.createMediaStreamDestination();
  await window.huddle.audioVideo.startAudioInput(window.virtMic);
  window.huddle.audioVideo.start();
  console.log("started huddle! :3");
};