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

let isPaused = false;

//start video playback
navigator.mediaDevices.getUserMedia(
    { video: true, audio: false })
    .then((stream) => {
        video.srcObject = stream;
        video.play();
    })
    .catch((err) => {
        console.error(`An error occurred: ${err}`);
    });

function adjustAspectRations(event) {
    //perform a one-time adjustment of video's and photo's aspect ratio
    if (!streaming) {
        height = video.videoHeight / video.videoWidth * width;
        if (isNaN(height)) {
            height = width * 3.0 / 4.0;
        }

        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
    }
}

//further initializations as soon as a video stream appears
video.addEventListener('canplay', adjustAspectRations, false);

function takePicture(event) {
    const width = video.offsetWidth;
    const height = video.offsetHeight;
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, width, height);

    let canvasImgBlob;
    let imageData;
    canvas.convertToBlob({ type: 'image/jpeg' }).then(
        (blob) => {
            canvasImgBlob = blob;
            imageData = URL.createObjectURL(blob);
            photoImg.width = width;
            photoImg.height = height;
            photoImg.src = imageData;
        }
    );

    const reader = new FileReader();

    reader.onloadend = function () {
        localStorage.setItem('my-image', reader.result);
    };

    reader.readAsDataURL(canvasImgBlob);

    // photo.setAttribute('src', );
}

function toggleButtons(isPaused) {
    if (isPaused) {
        playPauseButton.src = playButtonImage;
        saveButton.disabled = false;
        canvas.hidden = false;
        photo.hidden = false;
        video.hidden = true;
    } else {
        playPauseButton.src = pauseButtonImage;
        saveButton.disabled = true;
        canvas.hidden = true;
        photo.hidden = true;
        video.hidden = false;
    }
}

playPauseButton.addEventListener("click", function () {
    console.debug("Clicked play-pause-button");
    if (!isPaused) {
        video.pause();
        isPaused = true;
        toggleButtons(isPaused);
        takePicture();
    } else {
        video.play();
        isPaused = false;
        toggleButtons(isPaused);
    }
})

saveButton.addEventListener("click", function () {
    // save to local storage
})

cancelButton.addEventListener("click", function () {
    location.href = "index.html";
})

window.onload = () => {
    playPauseButton.src = pauseButtonImage;
    saveButton.src = saveButtonImage;
    cancelButton.src = cancelButtonImage;
}