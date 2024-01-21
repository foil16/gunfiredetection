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
        formData.append("frame", blob, "frame.jpg");

        fetch("http://localhost:5000/process_image", {
          method: "POST",
          body: formData,
          mode: "cors",
        })
          .then((response) => {
            const customHeader = response.headers.get("type");
            console.log(customHeader);
            document.getElementById("type").innerText = customHeader;
            return response.blob();
          })
          .then((blob) => {
            const imageUrl = URL.createObjectURL(blob);
            document.getElementById("myimage").src = imageUrl;
          })

          .catch((error) => console.error("Error sending frame:", error));
      }, "image/jpg");
    };

    const intervalId = setInterval(captureAndSendFrame, 1000);
    return () => clearInterval(intervalId);
  }, [streaming]);

  return (
    <div>
      <video
        ref={videoRef}
        style={{ width: "100%", visibility: "hidden", display: "none" }}
        muted
        playsInline
      />

      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width={640}
        height={480}
      />

      <img id="myimage"></img>
      <p display="" id="type"></p>
    </div>
  );
};

export default WebcamStream;
