import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3-scale-chromatic';
import seedrandom from 'seedrandom';

import './App.css';

const FPS = 30;

const drawBoxes = (tracklets, frameIndex) => {
  if (frameIndex === undefined) return;
  return tracklets
    .map((tracklet, i) => ([tracklet, i]))
    .filter(stuff => stuff[0].start <= frameIndex && frameIndex < stuff[0].start + stuff[0].boxes.length)
    .map(stuff => {
      const [tracklet, i] = stuff;
      const boxIndex = frameIndex - tracklet.start;
      const [x1, y1, x2, y2] = tracklet.boxes[boxIndex];
      return <rect
          key={i}
          x={x1}
          y={y1}
          width={x2 - x1}
          height={y2 - y1}
          stroke={d3.interpolatePlasma(seedrandom(i)())}
        />
    });
}

function App() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [tracklets, setTracklets] = useState([]);
  const videoElement = useRef(null);

  const onLoad = event => {
    const { videoWidth, videoHeight } = event.target;
    setWidth(videoWidth);
    setHeight(videoHeight);
  }

  useEffect(() => {
    fetch('/out.json')
      .then(response => response.json())
      .then(setTracklets);
  }, [setTracklets]);

  const updateFrameIndex = () => {
    if (!videoElement.current) return;
    setFrameIndex(Math.round(videoElement.current.currentTime * FPS));
    requestAnimationFrame(updateFrameIndex);
  }
  requestAnimationFrame(updateFrameIndex);

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
        {drawBoxes(tracklets, frameIndex)}
      </svg>
    </div>
  );
}

export default App;
