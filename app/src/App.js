import React, { useEffect, useState } from "react";
import "./App.css";
import WebcamComponent from "./webcamcomponent";

function DangerDetApp() {
  const [isWebcamActive, setWebcamActive] = useState(false);
  const [isPoliceLightsVisible, setPoliceLightsVisible] = useState(false);
  const [flashingIntervalId, setFlashingIntervalId] = useState(null);
  const [notification, setNotification] = useState("");
  const [currentSituation, setCurrentSituation] = useState("Safe");
  const [intruder, setIntruder] = useState("Pass");
  const [isIntruderGifVisible, setIntruderGifVisible] = useState(false);

  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
      stopFlashingBorder();
    };
  }, []);

  // THIS PART IS THE ONE THAT CALLS THE FUCNTOIN WHEN P CHANGES
  useEffect(() => {
    const targetNode = document.getElementById("type");
    const config = { characterData: true, childList: true, subtree: true };

    const callback = function (mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (
          mutation.type === "childList" ||
          mutation.type === "characterData"
        ) {
          const newPvalue = targetNode.innerText;
          handleSituationChange(newPvalue);
        }
      }
    };
    //

    const observer = new MutationObserver(callback);

    if (targetNode) observer.observe(targetNode, config);

    return () => {
      observer.disconnect();
    };
  }, []);

  function showNotification(message) {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  }

  function startWebcam() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        const webcamElement = document.getElementById("webcam");
        if (webcamElement) {
          webcamElement.srcObject = stream;
          setWebcamActive(true);
        }
        setWebcamActive(true);
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
      });
  }

  function stopWebcam() {
    if (isWebcamActive) {
      const webcamElement = document.getElementById("webcam");
      const stream = webcamElement.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setWebcamActive(false);
    }
  }

  function captureFrame() {
    let video = document.getElementById("webcam");
    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    downloadImage(canvas);
  }

  function downloadImage(canvas) {
    let image = canvas
      .toDataURL("image/jpeg")
      .replace("image/jpeg", "image/octet-stream");
    let link = document.createElement("a");
    link.download = "captured-frame.jpeg";
    link.href = image;
    link.click();
  }

  function toggleFlashingBorder() {
    if (!flashingIntervalId) {
      const intervalId = setInterval(() => {
        let videoElement = document.getElementById("webcam");
        videoElement.style.borderColor =
          videoElement.style.borderColor === "red" ? "grey" : "red";
      }, 200);
      setFlashingIntervalId(intervalId);
    }
  }

  function stopFlashingBorder() {
    if (flashingIntervalId) {
      clearInterval(flashingIntervalId);
      setFlashingIntervalId(null);
      let videoElement = document.getElementById("webcam");
      if (videoElement) {
        videoElement.style.borderColor = "initial";
      }
    }
  }

  function toggleIntruder() {
    setIntruder((prev) => (prev === "Pass" ? "Allow" : "Pass"));
  }

  function togglePoliceLights() {
    setPoliceLightsVisible((prev) => !prev);
  }

  function toggleFreezeFrame() {
    let video = document.getElementById("webcam");
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
    setFireGifVisible((prevState) => !prevState);
  }

  function handleSituationChange(situation) {
    switch (situation) {
      case "Fire":
        setFireGifVisible(true);
        setPoliceLightsVisible(false);
        toggleFlashingBorder();
        showNotification("Fire Hazard Detected!");
        setCurrentSituation("Fire Detected");
        break;
      case "Gun":
        setFireGifVisible(false);
        setPoliceLightsVisible(true);
        toggleFlashingBorder();
        showNotification("Firearm Detected!");
        setCurrentSituation("Gun Detected");
        break;
      case "3":
        if (intruder === "Pass") {
          console.log("Intruders allowed, no action taken.");
        } else {
          toggleFlashingBorder();
          showNotification("Intruder Alert!");
          setCurrentSituation("Intruder Detected!");
          setIntruderGifVisible(true); // Ensure intruder GIF is visible when intruders are not allowed
        }
        break;
      case "Nothing":
        setFireGifVisible(false);
        setIntruderGifVisible(false); // Hide the intruder GIF when the situation is safe
        setPoliceLightsVisible(false);
        stopFlashingBorder();
        setCurrentSituation("Safe");
        break;
      default:
        console.error("Invalid situation");
    }
  }

  return (
    <div className="App">
      <h1>DangerDet</h1>
      <div
        id="police-lights"
        style={{ display: isPoliceLightsVisible ? "block" : "none" }}
      >
        <div className="light red-light"></div>
        <div className="light blue-light"></div>
      </div>

      <div
        id="bgimagecontainer"
        style={{ display: isFireGifVisible ? "block" : "none" }}
      >
        <img id="bgimage" src="images/firegif.gif" alt="firegif"></img>
      </div>

      <div
        id="intrudergif"
        style={{ display: isIntruderGifVisible ? "block" : "none" }}
      >
        <img id="intruderimg" src="/images/giphy.gif" alt="intrudergif"></img>
      </div>

      <p id="safetext" class="safetext">
        Safe
      </p>
      <p id="dangertext" class="dangertext">
        Firearm Detected
      </p>
      <p id="dangertext" class="dangertext">
        Fire Hazard Detected
      </p>

      <div className="video-and-text">
        <WebcamComponent />
        <p
          className={`situation-text ${
            currentSituation === "Safe" ? "safe-text" : "not-safe-text"
          }`}
        >
          {currentSituation}
        </p>
      </div>

      <p id="hiddenP" class="hiddenP"></p>

      <div className="button-container">
        <button onClick={captureFrame}>Capture Frame</button>
        <button onClick={toggleFreezeFrame}>Freeze Frame</button>
        <button onClick={toggleIntruder}>
          {intruder === "Pass" ? "Allow Intruders" : "No Intruders"}
        </button>
      </div>

      <button onClick={() => handleSituationChange("1")}>
        Handle Fire Situation
      </button>

      <button onClick={() => handleSituationChange("3")}>
        Handle Intruder Situation
      </button>

      <button onClick={() => handleSituationChange("2")}>
        Handle Gun Situation
      </button>

      <button onClick={() => handleSituationChange("0")}>
        Reset All Effects
      </button>

      {notification && <div className="notification">{notification}</div>}
    </div>
  );
}

export default DangerDetApp;
