import cameraImage from './camera.svg';

const COORD_FORMATTER = Intl.NumberFormat('de-DE', { minimumFractionDigits: 6, maximumFractionDigits: 6, minimumIntegerDigits: 3, style: 'unit', unit: 'degree' });
const DIST_FORMATTER = Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1, style: 'unit', unit: 'meter' });
const DEG_FORMATTER = Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1, style: 'unit', unit: 'degree' });

const LOCATION_ID = 'location';
const CAMERA_INPUT_ID = 'camera';

const cameraButton = document.getElementById(CAMERA_INPUT_ID);

cameraButton.addEventListener("click", function () {
    location.href = "camera.html";
})

//map state
var map;
var ranger;
var geolocation;
var watchID;

function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

function configureMap(latLngArray) {
    map = L.map('map').setView(latLngArray, 17);
    if (isTouchDevice()) {
        map.removeControl(map.zoomControl);
    }
    map.attributionControl.setPosition('bottomleft');

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    ranger = L.circle(latLngArray, { radius: 20.0 }).addTo(map);
}

function updatePosition(position) {
    const locatorDiv = document.getElementById(LOCATION_ID);

    const coords = position.coords;

    console.debug(`got new coordinates: ${coords}`);
    locatorDiv.innerHTML = `
        <dl>
            <dt>LAT</dt>
            <dd>${COORD_FORMATTER.format(coords.latitude)}</dd>
            <dt>LONG</dt>
            <dd>${COORD_FORMATTER.format(coords.longitude)}</dd>
            <dt>ALT</dt>
            <dd>${coords.altitude ? DIST_FORMATTER.format(coords.altitude) : '-'}</dd>
            <dt>ACC</dt>
            <dd>${DIST_FORMATTER.format(coords.accuracy)}</dd>
            <dt>HEAD</dt>
            <dd>${coords.heading ? DEG_FORMATTER.format(coords.heading) : '-'}</dd>
            <dt>SPED</dt>
            <dd>${coords.speed ? DIST_FORMATTER.format(coords.speed) : '-'}</dd>
        </dl>
    `;
    var ll = [coords.latitude, coords.longitude];
    localStorage.setItem("last-coords", JSON.stringify(ll));
    console.debug(`New coordinates: ${ll}`);

    map.setView(ll);

    ranger.setLatLng(ll);
    ranger.setRadius(coords.accuracy);
}

function locate(position) {
    const c = position.coords;
    console.debug(
        `my position: lat=${c.latitude} lng=${c.longitude}`);
}

function handleErr(err) {
    console.error(err.message);
}

/* setup component */
window.onload = () => {
    //setup UI
    cameraButton.src = cameraImage;

    //init leaflet
    configureMap([47.406653, 9.744844]);

    //init footer
    updatePosition({ coords: { latitude: 47.406653, longitude: 9.744844, altitude: 440, accuracy: 40, heading: 45, speed: 1.8 } });

    // setup service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(
            new URL('serviceworker.js', import.meta.url),
            { type: 'module' }
        ).then(() => {
            console.log('Service worker registered!');
        }).catch((error) => {
            console.warn('Error registering service worker:');
            console.warn(error);
        });
    }

    const options = {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    };

    if ('geolocation' in navigator) {
        /* geolocation is available */
        geolocation = navigator.geolocation;
        watchID = geolocation.watchPosition(
            updatePosition, handleErr, options);
    }

}

window.onbeforeunload = (event) => {
    if (geolocation) {
        geolocation.clearWatch(watchID);
    }
};
