import playButtonImage from "./play-btn.svg";
import pauseButtonImage from "./pause-btn.svg";
import saveButtonImage from "./save.svg";
import cancelButtonImage from "./x-circle.svg";

let width = 320;    // We will scale the photo width to this
let height = 0;     // This will be computed based on the input stream
let streaming = false;  //flag for a 1st-time init

const video = document.getElementById('video');
const photo = document.getElementById("photo");

const playPauseButton = document.getElementById("playPauseButton");
const saveButton = document.getElementById("save");
const cancelButton = document.getElementById("cancel");
const statusElement = document.getElementById("statusText");

const reader = new FileReader();

let isPaused = false;

let latitude;
let longitude;
let canvasImgBlob;

//start video playback
async function startVideoPlayback() {
    navigator.mediaDevices.getUserMedia(
        { video: true, audio: false })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        })
        .catch((err) => {
            console.error(`An error occurred: ${err}`);
        });

    video.style.display = "block";
    photo.style.display = "none";
}

function adjustAspectRations(event) {
    //perform a one-time adjustment of video's and photo's aspect ratio
    if (!streaming) {
        height = video.videoHeight / video.videoWidth * width;
        if (isNaN(height)) {
            height = width * 3.0 / 4.0;
        }

        video.setAttribute('width', width);
        video.setAttribute('height', height);
        streaming = true;
    }
}

//further initializations as soon as a video stream appears
video.addEventListener('canplay', adjustAspectRations, false);

function takePicture(event) {
    const width = video.getAttribute("width");
    const height = video.getAttribute("height");
    const canvas = new OffscreenCanvas(parseInt(width), parseInt(height));
    const context = canvas.getContext('2d');

    addLocationToImage(context, video);

    canvas.convertToBlob({ type: 'image/jpeg' }).then(
        (blob) => {
            canvasImgBlob = blob;
            const imageData = URL.createObjectURL(blob);
            console.log(imageData);
            photo.width = parseInt(width);
            photo.height = parseInt(height);
            photo.src = imageData;
        }
    );

    video.style.display = "none";
    photo.style.display = "block";
}

function addLocationToImage(context, video) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    latitude = urlParams.get("lat");
    longitude = urlParams.get("lon");

    console.log("Lat: ", latitude);
    console.log("Lon: ", longitude);

    context.drawImage(video, 0, 0, width, height);

    const text = "Latitude: " + latitude + ", Longitude: " + longitude;

    context.font = '16px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'bottom';

    const textMetrics = context.measureText(text);

    const backgroundMargin = 2;
    const backgroundWidth = textMetrics.width + 2 * backgroundMargin;
    const backgroundHeight = 20;

    context.fillStyle = 'rgba(255, 255, 255, 0.5)';
    context.fillRect((width - backgroundWidth) / 2, height - backgroundHeight, backgroundWidth, backgroundHeight);

    context.fillStyle = 'black';
    context.fillText(text, width / 2, height - backgroundMargin, width);

}

function toggleButtons(isPaused) {
    if (isPaused) {
        playPauseButton.src = playButtonImage;
        saveButton.disabled = false;
        video.hidden = true;
        photo.hidden = false;
    } else {
        playPauseButton.src = pauseButtonImage;
        saveButton.disabled = true;
        video.hidden = false;
        photo.hidden = true;
    }
}

function setStatus(text) {
    setTimeout(function() {
        // Deaktiviere die Anzeige nach 2 Sekunden (2000 Millisekunden)
        statusElement.textContent = text;
        setTimeout(function() {
            statusElement.textContent = ""; // Leere den Text nach weiteren 2 Sekunden
        }, 2000);
    }, 0);
}

playPauseButton.addEventListener("click", async function () {
    console.debug("Clicked play-pause-button");
    if (!isPaused) {
        video.pause();
        isPaused = true;
        toggleButtons(isPaused);
        takePicture();
        setStatus("Video paused!")
    } else {
        await startVideoPlayback();
        isPaused = false;
        toggleButtons(isPaused);
        setStatus("Video resumed!")
    }
})

saveButton.addEventListener("click", function () {
    console.debug("Clicked save-button");
    reader.readAsDataURL(canvasImgBlob);
    setStatus("Image saved!")
    location.href = `index.html?lat=${latitude}&lon=${longitude}`;
})

cancelButton.addEventListener("click", function () {
    console.debug("Clicked cancel-button");
    location.href = `index.html?lat=${latitude}&lon=${longitude}`;
})

window.onload = async () => {
    playPauseButton.src = pauseButtonImage;
    saveButton.src = saveButtonImage;
    cancelButton.src = cancelButtonImage;

    reader.onloadend = function () {
        localStorage.setItem(latitude + 'x' + longitude, reader.result);
    };

    await startVideoPlayback();
}