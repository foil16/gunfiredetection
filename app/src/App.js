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
    if (flashingIntervalId) {
      // Stop flashing
      clearInterval(flashingIntervalId);
      setFlashingIntervalId(null);
      let videoElement = document.getElementById("myimage");
      if (videoElement) {
        videoElement.style.borderColor = "initial";
      }
    } else {
      // Start flashing
      const intervalId = setInterval(() => {
        let videoElement = document.getElementById("myimage");
        if (videoElement) {
          videoElement.style.borderColor =
            videoElement.style.borderColor === "red" ? "grey" : "red";
        }
      }, 200);
      setFlashingIntervalId(intervalId);
    }
  }

  function stopFlashingBorder() {
    if (flashingIntervalId) {
      clearInterval(flashingIntervalId);
      setFlashingIntervalId(null);
      let videoElement = document.getElementById("myimage");
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

  function toggleFreezeFrame() {}

  const [isFireGifVisible, setFireGifVisible] = useState(false);

  function toggleFireGif() {
    setFireGifVisible((prevState) => !prevState);
  }

  function handleSituationChange(situation) {
    switch (situation) {
      case "Fire":
        setFireGifVisible(true);
        setPoliceLightsVisible(false);
        //toggleFlashingBorder();
        showNotification("Fire Hazard Detected!");
        break;
      case "Gun":
        setFireGifVisible(false);
        setPoliceLightsVisible(true);
        //toggleFlashingBorder();
        showNotification("Firearm Detected!");
        break;
      case "Rifle":
        setFireGifVisible(false);
        setPoliceLightsVisible(true);
        //toggleFlashingBorder();
        showNotification("Firearm Detected!");
        break;
      case "Nothing":
        setFireGifVisible(false);
        setIntruderGifVisible(false); // Hide the intruder GIF when the situation is safe
        setPoliceLightsVisible(false);
        stopFlashingBorder();
        break;
      default:
        stopFlashingBorder();
        console.error("Invalid situation");
    }
  }

  return (
    <div className="App">
      <h1>DangerDet.</h1>
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
      </div>

      <p id="hiddenP" class="hiddenP"></p>

      <div className="button-container">
        <button onClick={captureFrame}>Capture Frame</button>
        <button onClick={toggleIntruder} style={{ display: "none" }}>
          {intruder === "Pass" ? "Allow Intruders" : "No Intruders"}
        </button>
      </div>

      <button
        className="hideme"
        onClick={() => handleSituationChange("1")}
        style={{ display: "none" }}
      >
        Handle Fire Situation
      </button>

      <button
        className="hideme"
        onClick={() => handleSituationChange("3")}
        style={{ display: "none" }}
      >
        Handle Intruder Situation
      </button>

      <button
        className="hideme"
        onClick={() => handleSituationChange("2")}
        style={{ display: "none" }}
      >
        Handle Gun Situation
      </button>

      <button
        className="hideme"
        onClick={() => handleSituationChange("0")}
        style={{ display: "none" }}
      >
        Reset All Effects
      </button>

      {notification && <div className="notification">{notification}</div>}
    </div>
  );
}

export default DangerDetApp;
