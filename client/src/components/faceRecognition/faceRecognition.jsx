import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

function FaceCaptureModal({ onClose, onCapture }) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceInsideFrame, setFaceInsideFrame] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noseTip, setNoseTip] = useState(null);
  const [holdTime, setHoldTime] = useState(0);
  const [captured, setCaptured] = useState(false);
  const [cameraDenied, setCameraDenied] = useState(false);

  const videoRef = useRef(null);
  const faceDescriptorRef = useRef(null);
  const holdIntervalRef = useRef(null);

  const VIDEO_WIDTH = 320;
  const VIDEO_HEIGHT = 240;

  const OVAL_CENTER_X = VIDEO_WIDTH / 2;
  const OVAL_CENTER_Y = VIDEO_HEIGHT / 2;
  const OVAL_RADIUS_X = 80;
  const OVAL_RADIUS_Y = 100;
  const REQUIRED_HOLD_TIME = 5; // seconds

  const isPointInOval = (x, y) => {
    const dx = x - OVAL_CENTER_X;
    const dy = y - OVAL_CENTER_Y;
    return (dx ** 2) / (OVAL_RADIUS_X ** 2) + (dy ** 2) / (OVAL_RADIUS_Y ** 2) <= 1;
  };

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    setModelsLoaded(true);
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraDenied(false);
    } catch (err) {
      console.error("Camera access denied:", err);
      setCameraDenied(true);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((track) => track.stop());
  };

  const detectFace = async () => {
    if (
      videoRef.current &&
      videoRef.current.readyState === 4 &&
      modelsLoaded
    ) {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const dims = faceapi.matchDimensions(videoRef.current, {
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT,
        });

        const resizedDetections = faceapi.resizeResults(detection, dims);
        const nose = resizedDetections.landmarks.getNose();
        const noseTipPoint = nose[3];

        setNoseTip(noseTipPoint);

        const inside = isPointInOval(noseTipPoint.x, noseTipPoint.y);
        setFaceInsideFrame(inside);

        if (inside) {
          faceDescriptorRef.current = detection.descriptor;
        }
      } else {
        setFaceInsideFrame(false);
        setNoseTip(null);
      }
    }
  };

  useEffect(() => {
    const setup = async () => {
      await loadModels();
      await startVideo();
      setLoading(false);
    };

    setup();

    return () => {
      stopCamera();
      clearInterval(holdIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (modelsLoaded) {
      const interval = setInterval(detectFace, 500);
      return () => clearInterval(interval);
    }
  }, [modelsLoaded]);

  useEffect(() => {
    if (faceInsideFrame && !captured) {
      if (!holdIntervalRef.current) {
        holdIntervalRef.current = setInterval(() => {
          setHoldTime((prev) => {
            const next = prev + 1;
            if (next >= REQUIRED_HOLD_TIME) {
              clearInterval(holdIntervalRef.current);
              holdIntervalRef.current = null;
              setCaptured(true);
              stopCamera();
              if (faceDescriptorRef.current) {
                onCapture(faceDescriptorRef.current);
              }
            }
            return next;
          });
        }, 1000);
      }
    } else {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
      setHoldTime(0);
    }

    return () => {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    };
  }, [faceInsideFrame, captured]);

  const progressPercent = (holdTime / REQUIRED_HOLD_TIME) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg text-center w-[360px] space-y-4">
        <h2 className="text-lg font-semibold">Face Capture</h2>

        <div className="relative w-[320px] h-[240px] mx-auto">
          {cameraDenied ? (
            <div className="text-red-600 p-4">
              Please allow camera access to proceed.
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
                className="rounded object-cover"
              />

              {/* Oval overlay */}
              <div
                className="absolute border-4 border-blue-500"
                style={{
                  top: `${OVAL_CENTER_Y - OVAL_RADIUS_Y}px`,
                  left: `${OVAL_CENTER_X - OVAL_RADIUS_X}px`,
                  width: `${OVAL_RADIUS_X * 2}px`,
                  height: `${OVAL_RADIUS_Y * 2}px`,
                  borderRadius: "50%",
                  pointerEvents: "none",
                }}
              />

              {/* Nose tip red dot */}
              {noseTip && (
                <div
                  className="absolute w-2 h-2 bg-red-600 rounded-full"
                  style={{
                    top: `${noseTip.y - 1}px`,
                    left: `${noseTip.x - 1}px`,
                  }}
                />
              )}

              {/* Detection status badge */}
              <div className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-white shadow-md border border-gray-300 font-medium">
                {faceInsideFrame ? (
                  <span className="text-green-600">User Detected</span>
                ) : (
                  <span className="text-red-500">No Face</span>
                )}
              </div>
            </>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading models...</p>
        ) : captured ? (
          <p className="text-green-600">Face captured!</p>
        ) : faceInsideFrame ? (
          <p className="text-blue-600">
            Hold steady for {REQUIRED_HOLD_TIME - holdTime}s...
          </p>
        ) : (
          <p className="text-red-500">Position your face inside the oval.</p>
        )}

        {!captured && faceInsideFrame && (
          <div className="relative w-full bg-gray-200 h-4 rounded overflow-hidden mt-2">
            <div
              className="h-full bg-green-500 transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
              {Math.min(Math.round(progressPercent), 100)}%
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default FaceCaptureModal;
