import React, { useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff } from "lucide-react";

interface UserInfo {
  name: string;
  role: string;
}

interface VideoCallProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  localUser: UserInfo;
  remoteUser: UserInfo;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

const VideoCall: React.FC<VideoCallProps> = ({ 
  isVideoEnabled, 
  isAudioEnabled, 
  localUser, 
  remoteUser,
  localStream,
  remoteStream 
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Remote video (main view) */}
      <div className="absolute inset-0">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-lg">
            <VideoOff className="w-8 h-8 mr-2" /> Waiting for remote video...
          </div>
        )}
      </div>

      {/* Local video (picture-in-picture) */}
      <div className="absolute bottom-2 right-2 w-48 h-36 bg-gray-700 rounded-md border border-gray-600 overflow-hidden">
        {localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-xs">
            {localUser.name}
          </div>
        )}
      </div>

      {/* Status indicators */}
      <div className="absolute top-2 left-2 flex gap-2">
        {!isVideoEnabled && (
          <div className="bg-red-500 text-white px-2 py-1 rounded-md flex items-center text-sm">
            <VideoOff className="w-4 h-4 mr-1" /> Video Off
          </div>
        )}
        {!isAudioEnabled && (
          <div className="bg-red-500 text-white px-2 py-1 rounded-md flex items-center text-sm">
            <MicOff className="w-4 h-4 mr-1" /> Mic Off
          </div>
        )}
      </div>

      {/* Remote user name */}
      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
        {remoteUser.name}
      </div>
    </div>
  );
};

export default VideoCall;