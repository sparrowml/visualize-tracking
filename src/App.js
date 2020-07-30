import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3-scale-chromatic';

import './App.css';

// Hardcode video player width
// Then compute height to match video's aspect ratio
const WIDTH = 800;

function App() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [trackingSrc, setTrackingSrc] = useState(null);
  const [height, setHeight] = useState(0);
  const [frameIndex, setFrameIndex] = useState(undefined);
  const [tracking, setTracking] = useState({ fps: undefined, tracklets: [] });
  const videoElement = useRef(null);
  const requestRef = useRef();

  const onLoad = event => {
    const { videoWidth, videoHeight } = event.target;
    setHeight(WIDTH * videoHeight / videoWidth);
  }

  const drawBoxes = () => {
    if (frameIndex === undefined || tracking.tracklets.length === 0) return;
    return tracking.tracklets
      .map((tracklet, i) => {
        if (tracklet.start <= frameIndex && frameIndex < tracklet.start + tracklet.boxes.length) {
          const [x1, y1, x2, y2] = tracklet.boxes[frameIndex - tracklet.start];
          return <rect
            key={i}
            x={x1 * WIDTH}
            y={y1 * height}
            width={(x2 - x1) * WIDTH}
            height={(y2 - y1) * height}
            stroke={d3.schemeCategory10[i % 10]}
          />
        }
        return null;
      });
  }

  const updateFrameIndex = useCallback(() => {
    if (!tracking.fps) return;
    setFrameIndex(Math.round(videoElement.current.currentTime * tracking.fps));
    requestRef.current = requestAnimationFrame(updateFrameIndex);
  }, [setFrameIndex, tracking.fps]);

  useEffect(() => {
    if (trackingSrc) {
      fetch(trackingSrc)
        .then(response => response.json())
        .then(setTracking);
    }
  }, [trackingSrc, setTracking]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateFrameIndex);
  }, [updateFrameIndex]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setVideoSrc(urlParams.get('video') || '/traffic.mp4');
    setTrackingSrc(urlParams.get('tracking') || '/out.json');
  }, [])

  return (
    <div className="container">
      <video
        ref={videoElement}
        src={videoSrc}
        width={WIDTH}
        height={height}
        onLoadedMetadata={onLoad}
        controls
        muted
      />
      <svg
        width={WIDTH}
        height={height}
      >
        {drawBoxes(tracking, frameIndex)}
      </svg>
      <form>
        <label>
          Video URL:
          <input className="text" type="text" name="video" defaultValue={videoSrc} />
        </label>
        <label>
          Tracking URL:
          <input className="text" type="text" name="tracking" defaultValue={trackingSrc} />
        </label>        
        <input type="submit" value="Visualize" />
      </form>
    </div>
  );
}

export default App;
