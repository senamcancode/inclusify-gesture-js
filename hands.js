const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

let isRecognizing = true; 
const recognitionDelay = 2000; 

function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }


function fingersUp(landmarks) {
    const fingerStatus = [];

    // Check thumb and other fingers' positions
    fingerStatus.push(landmarks[4].y < landmarks[3].y ? 1 : 0); // Thumb
    fingerStatus.push(landmarks[8].y < landmarks[6].y ? 1 : 0); // Index finger
    fingerStatus.push(landmarks[12].y < landmarks[10].y ? 1 : 0); // Middle finger
    fingerStatus.push(landmarks[16].y < landmarks[14].y ? 1 : 0); // Ring finger
    fingerStatus.push(landmarks[20].y < landmarks[18].y ? 1 : 0); // Pinky finger

    return fingerStatus;
}


//Function to recognize gestures and trigger actions
function recognizeGesture(fingerStatus) {
    if (isRecognizing){
  // Example gesture: All fingers up = scroll up
        if (fingerStatus.join('') === '11111') {
            // Scroll up
            speakText("Scroll Up");
            window.scrollBy(0, -100);
            console.log("Scroll Up Gesture");
        }
        // Example gesture: Only thumb up = scroll down
        // else if (fingerStatus.join('') === '00000') {
        //     // Scroll down
        //     speakText("Scroll Down");
        //     window.scrollBy(0, 100);
        //     console.log("Scroll Down Gesture");
        // }

            // Example gesture: Most fingers down (simplified fist) = Scroll down
            else if (fingerStatus.filter(status => status === 0).length >= 4) {
                speakText("Scroll Down");
                window.scrollBy(0, 100);
                console.log("Scroll Down Gesture");
            }
    

        isRecognizing = false; 
        setTimeout(() => {
            isRecognizing = true;
        }, recognitionDelay); 
    }
}




// Function to handle hand tracking results
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
      drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

      // Detect which fingers are up
      const fingerStatus = fingersUp(landmarks);

      // Recognize the gesture based on the fingers' status and trigger action
      recognizeGesture(fingerStatus);
    }
  }

  canvasCtx.restore();
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720
});
camera.start();

