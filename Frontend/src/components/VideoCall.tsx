
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, Phone, Users, Signal } from 'lucide-react';

const VideoCall = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);

  useEffect(() => {
    // Simulate connection process
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <Badge 
          className={`${
            connectionStatus === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : connectionStatus === 'connecting'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <Signal className="w-3 h-3 mr-1" />
          {connectionStatus === 'connected' ? 'Connected' : 
           connectionStatus === 'connecting' ? 'Connecting...' : 'Connection Failed'}
        </Badge>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>HD Quality</span>
        </div>
      </div>

      {/* Remote Video (Large) */}
      <Card className="flex-1 relative overflow-hidden">
        <CardContent className="p-0 h-full">
          {connectionStatus === 'connected' ? (
            <div className="relative h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              {remoteVideoEnabled ? (
                <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-white font-medium">John Doe</p>
                    <p className="text-gray-300 text-sm">Candidate</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <VideoOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Video disabled</p>
                </div>
              )}
              
              {/* Audio indicator */}
              {!remoteAudioEnabled && (
                <div className="absolute top-2 left-2 bg-red-500 rounded-full p-1">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}
              
              {/* Name overlay */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 rounded px-2 py-1">
                <span className="text-white text-sm">John Doe</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">
                  {connectionStatus === 'connecting' ? 'Establishing connection...' : 'Connection failed'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Local Video (Small - Picture in Picture) */}
      <Card className="h-24 relative">
        <CardContent className="p-0 h-full">
          <div className="relative h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
            {localVideoEnabled ? (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white text-xs mt-1">You</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <VideoOff className="w-6 h-6 text-gray-400" />
              </div>
            )}
            
            {/* Audio indicator */}
            {!localAudioEnabled && (
              <div className="absolute top-1 right-1 bg-red-500 rounded-full p-1">
                <MicOff className="w-2 h-2 text-white" />
              </div>
            )}
            
            {/* Name overlay */}
            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 rounded px-1">
              <span className="text-white text-xs">You</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Stats */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>Bitrate:</span>
          <span>2.5 Mbps</span>
        </div>
        <div className="flex justify-between">
          <span>Latency:</span>
          <span>45ms</span>
        </div>
        <div className="flex justify-between">
          <span>Packet Loss:</span>
          <span>0.1%</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;