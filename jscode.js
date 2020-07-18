// global variables
var controlBtn, audio, mediaBtn, userFlag;

function startVisulization() {
    var width, height;

    // canvas settings
    var canvas = document.getElementById("myCanvas");
    height = canvas.height = window.innerHeight;
    width = canvas.width = window.innerWidth;
    var canvasCtx = canvas.getContext("2d");

    // create the audioContext
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioCtx = new AudioContext({
        latencyHint: 'interactive'
    });
    // var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // create the source
    var source = audioCtx.createMediaElementSource(audio);

    // create analyser for the frequency data
    // ftt size is in power of 2
    var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;

    // connect analyser to the source and source to the destination
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    // buffer length: power of 2, this is half of the ftt size 
    var bufferLength = (analyser.frequencyBinCount) / 2;
    var dataArray = new Uint8Array(bufferLength);

    // gainNode for the volume gain (easy terms)
    var gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.3;

    // connect source to the gainNode
    source.connect(gainNode);
    // connect the gainNode to the audioContext's destination
    gainNode.connect(audioCtx.destination);

    // uncomment this function and comment drawCircle() to see the
    // output of the this function

    // (function drawLine() {
    //     requestAnimationFrame(drawLine);
    //     height = canvas.height = window.innerHeight;
    //     width = canvas.width = window.innerWidth;
    //     analyser.getByteFrequencyData(dataArray);

    //     canvasCtx.clearRect(0, 0, width, height);
    //     canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)';
    //     canvasCtx.fillRect(0, 0, width, height);
    //     canvasCtx.lineWidth = 2;
    //     canvasCtx.beginPath();

    //     var sliceWidth = width / bufferLength;
    //     var x = 0;

    //     for(var i = 0; i < bufferLength; i++) {
    //         var value = dataArray[i] / 200.0;
    //         var y = (height - 10) - value * height / 2.5;

    //         if(i === 0) {
    //             canvasCtx.moveTo(x, height - 10);
    //         } else {
    //             canvasCtx.lineTo(x,y);
    //         }

    //         x += sliceWidth;
    //     }
    //     canvasCtx.strokeStyle = 'red';
    //     canvasCtx.lineTo(canvas.width, canvas.height - 10);
    //     canvasCtx.stroke();
    // })();

    /*
        function drawCircle() description:
        1) height and width should be refreshed at every frame
           userful when user resize the window
        2) get the frequency data from the analyser and put in the dataArray
        3) canvas should be filled for each and every frame with new frequency data
        4) divide 360 degrees in small angles using bufferSize
        5) Do some math to calculate (x1, y1) and (x2, y2)
        6) finally stroke to see the drawing
    */

    var sliceAngle = 2 * Math.PI / bufferLength;

    (function drawCircle() {
        requestAnimationFrame(drawCircle);
        height = canvas.height = window.innerHeight;
        width = canvas.width = window.innerWidth;

        var radius = 150;

        analyser.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, width, height);
        canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)';
        canvasCtx.fillRect(0, 0, width, height);
        canvasCtx.lineWidth = 4;
        canvasCtx.lineCap = 'round';
        canvasCtx.beginPath();

        var angle = 0;

        for (var i = 0; i < bufferLength; i++) {
            var value = dataArray[i] / 128.0;
            var length = value * height / 25;

            var cosAngle = Math.cos(angle);
            var sinAngle = Math.sin(angle);

            var x1 = radius * cosAngle + (width / 2) - length * cosAngle * 0.5;
            var y1 = radius * sinAngle + (height / 2) - length * sinAngle * 0.5;
            var x2 = x1 + 2.5 * length * cosAngle;
            var y2 = y1 + 2.5 * length * sinAngle;

            canvasCtx.moveTo(x1, y1)
            canvasCtx.lineTo(x2, y2);
            angle += sliceAngle;
        }
        canvasCtx.strokeStyle = 'red';
        canvasCtx.stroke();
    })();
}

// whenever user click on play/pause button
// it will toggle play/pause class
function mediaControl(e) {
    if (userFlag) {
        // call startVisulization() when user first click on the play button
        startVisulization();
        userFlag = false;
    }

    mediaBtn.classList.toggle('pause');
    var flag = audio.paused;
    if (flag) {
        audio.play();
    } else {
        audio.pause();
    }
}

window.onload = function () {
    // getters: when window is completely loaded
    audio = document.getElementById("myAudio");
    controlBtn = document.getElementById("controlBtn");
    mediaBtn = document.getElementById("mediaBtn");

    // start eventListener on the play/pause button
    controlBtn.addEventListener('click', mediaControl);
    userFlag = true;

    audio.onended = () => {
        mediaBtn.classList.toggle('pause');
    }
}
