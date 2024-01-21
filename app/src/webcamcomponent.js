import React, { useEffect, useRef, useState } from "react";

const WebcamStream = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [streaming, setStreaming] = useState(false);
  var frame;

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => setStreaming(true));
        };
      })
      .catch((err) => console.error("Error accessing the webcam", err));
  }, []);

  useEffect(() => {
    if (!streaming) return;

    const captureAndSendFrame = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append("frame", blob, "frame.png");

        fetch("http://localhost:5000/process_image", {
          method: "POST",
          body: formData,
          mode: "cors",
        })
          .then((response) => {
            if (response.ok) {
              console.log("Frame sent");
              return response.blob();
            } else {
              console.error("Error sending frame", response);
            }
          })
          .then((blob) => {
            var img = document.createElement("img");
            img.src = URL.createObjectURL(blob);
            document.body.appendChild(img);
          })
          .catch((error) => console.error("Error sending frame:", error));
      }, "image/png");
    };

    const intervalId = setInterval(captureAndSendFrame, 5000);
    return () => clearInterval(intervalId);
  }, [streaming]);

  return (
    <div style={{ position: "relative" }}>
      <video ref={videoRef} style={{ width: "100%" }} muted playsInline />
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width={640}
        height={480}
      />
    </div>
  );
};

export default WebcamStream;
