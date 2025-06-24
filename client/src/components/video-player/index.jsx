import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import * as faceapi from "face-api.js";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import {
  Play, Pause, RotateCcw, RotateCw,
  Volume2, VolumeX, Maximize, Minimize,
} from "lucide-react";

export default function VideoPlayerWithFaceDetection({ url, width = "100%", height = "100%" }) {
  const playerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const webcamRef = useRef(null);
  const faceInterval = useRef(null);
  const controlsTimeout = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceFound, setFaceFound] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [maxPlayed, setMaxPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Load models
  useEffect(() => {
    faceapi.nets.tinyFaceDetector.loadFromUri("/models").then(() => {
      setModelsLoaded(true);
    });
  }, []);

  // Setup webcam + detection
  useEffect(() => {
    if (!modelsLoaded) return;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        webcamRef.current.srcObject = stream;
        webcamRef.current.play();

        faceInterval.current = setInterval(async () => {
          const detection = await faceapi.detectSingleFace(webcamRef.current, new faceapi.TinyFaceDetectorOptions());
          if (detection) {
            setFaceFound(true);
          } else {
            setFaceFound(false);
          }
        }, 300);
      })
      .catch(console.error);

    return () => {
      clearInterval(faceInterval.current);
      webcamRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    };
  }, [modelsLoaded]);

  // Auto-pause/play based on face detection
  useEffect(() => {
    if (faceFound) setPlaying(true);
    else setPlaying(false);
  }, [faceFound]);

  function handlePlayPause() {
    if (faceFound) setPlaying(prev => !prev);
  }

  function handleProgress(state) {
    if (!seeking) {
      let cur = state.played;
      setPlayed(cur);
      if (cur > maxPlayed) setMaxPlayed(cur);
    }
  }

  function handleRewind() {
    const ct = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(Math.max(ct - 5, 0));
  }

  function handleForward() {
    const ct = playerRef.current.getCurrentTime();
    const duration = playerRef.current.getDuration();
    const maxT = maxPlayed * duration;
    playerRef.current.seekTo(Math.min(ct + 5, maxT));
  }

  function handleSeekChange([val]) {
    if (val/100 <= maxPlayed) {
      setPlayed(val/100);
      setSeeking(true);
    }
  }

  function handleSeekCommit() {
    const duration = playerRef.current.getDuration();
    playerRef.current.seekTo(Math.min(played * duration, maxPlayed * duration));
    setSeeking(false);
  }

  function handleVolumeChange([val]) { setVolume(val / 100); }

  const formatTime = sec => {
    const d = new Date(sec * 1000);
    const hh = d.getUTCHours(), mm = d.getUTCMinutes(), ss = ('0' + d.getUTCSeconds()).slice(-2);
    return hh? `${hh}:${('0'+mm).slice(-2)}:${ss}` : `${mm}:${ss}`;
  };

  const toggleFull = useCallback(() => {
    if (!isFullScreen) videoContainerRef.current.requestFullscreen();
    else document.exitFullscreen();
  }, [isFullScreen]);

  useEffect(() => {
    const onFs = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  

  const onMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };
  useEffect(() => {
    const askCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("granted");
      } catch (err) {
        console.error("Camera access denied or error:", err);
        setStatus("denied");
      }
    };

    askCameraAccess();
  }, []);

  return (
    <div
      ref={videoContainerRef}
      className={`relative bg-gray-900 ${isFullScreen? "w-screen h-screen" : ""}`}
      style={{ width, height }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Hidden webcam */}
      <video ref={webcamRef} className="absolute w-0 h-0 opacity-0 pointer-events-none" />

      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        width="100%"
        height="100%"
        onProgress={handleProgress}
      />

      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 p-3">
          <Slider value={[played*100]} max={100} step={0.1} onValueChange={handleSeekChange} onValueCommit={handleSeekCommit} className="w-full mb-3" />

          <div className="flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={handlePlayPause}>
                {playing ? <Pause className="h-5 w-5"/> : <Play className="h-5 w-5"/>}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleRewind}><RotateCcw className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={handleForward}><RotateCw className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setMuted(m=>!m)}>
                {muted? <VolumeX className="h-5 w-5"/> : <Volume2 className="h-5 w-5"/>}
              </Button>
              <Slider value={[volume*100]} max={100} step={1} onValueChange={handleVolumeChange} className="w-24" />
            </div>
            <div className="flex items-center space-x-2">
              <span>{formatTime(played * playerRef.current?.getDuration() || 0)} / {formatTime(playerRef.current?.getDuration() || 0)}</span>
              <Button variant="ghost" size="icon" onClick={toggleFull}>
                {isFullScreen? <Minimize className="h-5 w-5"/> : <Maximize className="h-5 w-5"/>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!faceFound && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white font-semibold">
          Face not detected — video is paused
        </div>
      )}
    </div>
  );
}
