/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-expect-error - wrtc doesn't have official types
import wrtc from "wrtc";
export default function polyfill() {
  (global as any).RTCPeerConnection = wrtc.RTCPeerConnection;
  (global as any).RTCSessionDescription = wrtc.RTCSessionDescription;
  (global as any).RTCIceCandidate = wrtc.RTCIceCandidate;
  (global as any).RTCRtpSender = wrtc.RTCRtpSender;
  // @ts-expect-error - am in nodejs but have to trick chime lol
  if (typeof window === "undefined") (global as any).window = global;
}