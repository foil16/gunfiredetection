import React, { useEffect, useState } from 'react';
import WebcamComponent from "./webcamcomponent";
import './App.css';

const App = () => {
  const [isWebcamActive, setWebcamActive] = useState(false);
  const [isPoliceLightsVisible, setPoliceLightsVisible] = useState(false);
  const [flashingIntervalId, setFlashingIntervalId] = useState(null);
  const [notification, setNotification] = useState('');
  const [currentSituation, setCurrentSituation] = useState('Safe');

  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
      stopFlashingBorder();
    };
  }, []);

  function showNotification(message) {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  }

  function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        const webcamElement = document.getElementById('webcam');
        if (webcamElement) {
          webcamElement.srcObject = stream;
          setWebcamActive(true);
        }
        setWebcamActive(true);
      })
      .catch(err => {
        console.error("Error accessing webcam:", err);
      });
  }

  function stopWebcam() {
    if (isWebcamActive) {
      const webcamElement = document.getElementById('webcam');
      const stream = webcamElement.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setWebcamActive(false);
    }
  }

  function captureFrame() {
    let video = document.getElementById('webcam');
    let canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    downloadImage(canvas);
  }

  function downloadImage(canvas) {
    let image = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
    let link = document.createElement('a');
    link.download = 'captured-frame.jpeg';
    link.href = image;
    link.click();
  }

  function toggleFlashingBorder() {
    if (!flashingIntervalId) {
      const intervalId = setInterval(() => {
        let videoElement = document.getElementById('webcam');
        videoElement.style.borderColor = videoElement.style.borderColor === 'red' ? 'grey' : 'red';
      }, 200);
      setFlashingIntervalId(intervalId);
    }
  }

  function stopFlashingBorder() {
    if (flashingIntervalId) {
      clearInterval(flashingIntervalId);
      setFlashingIntervalId(null);
      let videoElement = document.getElementById('webcam');
      if (videoElement) {
        videoElement.style.borderColor = 'initial';
      }
    }
  }

  function togglePoliceLights() {
    setPoliceLightsVisible(prev => !prev);
  }

  function toggleFreezeFrame() {
    let video = document.getElementById('webcam');
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  }

  const [isFireGifVisible, setFireGifVisible] = useState(false);

  function toggleFireGif() {
    setFireGifVisible(prevState => !prevState);
  }

  function handleSituationChange(situation) {
    switch (situation) {
      case "fire":
        setFireGifVisible(true);
        setPoliceLightsVisible(false);
        toggleFlashingBorder();
        showNotification('Fire Hazard Detected!');
        setCurrentSituation('Fire Detected');
        break;
      case "gun":
        setFireGifVisible(false);
        setPoliceLightsVisible(true);
        toggleFlashingBorder();
        showNotification('Firearm Detected!');
        setCurrentSituation('Gun Detected');
        break;
      case "safe":
        setFireGifVisible(false);
        setPoliceLightsVisible(false);
        stopFlashingBorder();
        setCurrentSituation('Safe');
        break;
      default:
        console.error("Invalid situation");
    }
  }

  return (
    <div>
      return (
    <div className="App">
      <h1>DangerDet</h1>
      <div id="police-lights" style={{ display: isPoliceLightsVisible ? 'block' : 'none' }}>
        <div className="light red-light"></div>
        <div className="light blue-light"></div>
      </div>

      <div id="bgimagecontainer" style={{ display: isFireGifVisible ? 'block' : 'none' }}>
        <img id="bgimage" src="/images/firegif.gif" alt="firegif"></img>
      </div>

      <p id="safetext" class="safetext">Safe</p>
      <p id="dangertext" class="dangertext">Firearm Detected</p>
      <p id="dangertext" class="dangertext">Fire Hazard Detected</p>
    
      <div className="video-and-text">
       
        <WebcamComponent/>
        <p className={`situation-text ${currentSituation === 'Safe' ? 'safe-text' : 'not-safe-text'}`}>
          {currentSituation}
        </p>
      </div>

      <div className="button-container">
        <button onClick={captureFrame}>Capture Frame</button>
        <button onClick={toggleFreezeFrame}>Freeze Frame</button>
        
      </div>

      <button onClick={() => handleSituationChange("fire")}>
        Handle Fire Situation
      </button>

      <button onClick={() => handleSituationChange("gun")}>
        Handle Gun Situation
      </button>

      <button onClick={() => handleSituationChange("safe")}>
        Reset All Effects
      </button>

      {notification && <div className="notification">{notification}</div>}

    </div>
  );
     
    </div>
  );
};

export default App;
