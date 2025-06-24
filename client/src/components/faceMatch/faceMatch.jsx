import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

const THRESHOLD = 0.6; // Matching threshold

export default function FaceMatch({ userEmail, onMatch, onFail }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    startVideo();
  };

  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
    setLoading(false);
  };

  const captureAndMatch = async () => {
    const result = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!result?.descriptor) {
      setMatchResult("Face not detected.");
      return;
    }

    const currentDescriptor = Array.from(result.descriptor); // Convert to plain array
    const { data } = await axios.get(`/api/face-descriptors/${userEmail}`);

    const storedDescriptor = data.faceDescriptor; // Assume it's an array of numbers

    const distance = euclideanDistance(currentDescriptor, storedDescriptor);

    if (distance < THRESHOLD) {
      setMatchResult("✅ Face matched.");
      onMatch && onMatch();
    } else {
      setMatchResult("❌ Face not matched.");
      onFail && onFail();
    }
  };

  const euclideanDistance = (a, b) => {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-2">Face Match Verification</h2>

      {loading ? (
        <p>Loading camera...</p>
      ) : (
        <>
          <video
            ref={videoRef}
            width="320"
            height="240"
            autoPlay
            muted
            className="rounded border"
          />

          <div className="mt-4">
            <button
              onClick={captureAndMatch}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Verify Face
            </button>
          </div>
        </>
      )}

      {matchResult && <p className="mt-3 text-sm">{matchResult}</p>}
    </div>
  );
}
