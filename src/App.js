import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3-scale-chromatic';

import './App.css';

const drawBoxes = (data, frameIndex) => {
  if (frameIndex === undefined || data.tracking.length === 0) return;
  const tracklets = data.tracking[frameIndex];
  if (!tracklets) return;
  return tracklets
    .map((box, i) => {
      const [x1, y1, x2, y2] = box;
      if (box[0]) {
        return <rect
          key={i}
          x={x1}
          y={y1}
          width={x2 - x1}
          height={y2 - y1}
          stroke={d3.schemeCategory10[i % 10]}
        />
      }
      return null;
    });
}

function App() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [tracking, setTracking] = useState({ fps: 0, tracking: [] });
  const videoElement = useRef(null);
  const requestRef = useRef();

  const onLoad = event => {
    const { videoWidth, videoHeight } = event.target;
    setWidth(videoWidth);
    setHeight(videoHeight);
  }

  const updateFrameIndex = useCallback(() => {
    if (!videoElement.current) return;
    setFrameIndex(Math.round(videoElement.current.currentTime * tracking.fps));
    requestRef.current = requestAnimationFrame(updateFrameIndex);
  }, [videoElement, tracking.fps]);

  useEffect(() => {
    fetch('/out.json')
      .then(response => response.json())
      .then(setTracking);
  }, [setTracking]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateFrameIndex);
    return () => cancelAnimationFrame(requestRef.current);
  }, [updateFrameIndex]);

  return (
    <div className="container">
      <video
        ref={videoElement}
        src="/traffic.mp4"
        onLoadedMetadata={onLoad}
        controls
        muted
      />
      <svg
        width={width}
        height={height}
      >
        {drawBoxes(tracking, frameIndex)}
      </svg>
      <form>
        <label>
          Video URL:
          <input className="text" type="text" name="video" />
        </label>
        <label>
          Tracking URL:
          <input className="text" type="text" name="tracking" />
        </label>        
        <input type="submit" value="Visualize" />
      </form>
    </div>
  );
}

export default App;
