window.joinHuddle = async (meeting, attendee) => {
  const config = new ChimeSDK.MeetingSessionConfiguration(meeting, attendee);
  const logger = new ChimeSDK.ConsoleLogger("ChimeMeetingLogs", ChimeSDK.LogLevel.INFO);
  const controller = new ChimeSDK.DefaultDeviceController(logger);
  window.huddle = new ChimeSDK.DefaultMeetingSession(config, logger, controller);
  window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  window.virtMic = window.audioCtx.createMediaStreamDestination();
  await window.huddle.audioVideo.startAudioInput(window.virtMic.stream);
  window.huddle.audioVideo.start();
  console.log("started huddle! :3");
};
window.playSound = async (filePath) => {
  if (!window.audioCtx || !window.virtMic) {
    console.error("virtual mic not existing yet, wait for huddle joining to finish!");
    return;
  }
  const audio = document.createElement("audio");
  audio.src = filePath;
  audio.crossOrigin = "anonymous";
  const source = window.audioCtx.createMediaElementSource(audio);
  source.connect(window.virtMic);
  await audio.play();
}