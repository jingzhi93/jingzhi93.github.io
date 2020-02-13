(function($) {
  "use strict"; // Start of use strict

  // Toggle the side navigation
  $("#sidebarToggle, #sidebarToggleTop").on('click', function(e) {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(".sidebar").hasClass("toggled")) {
      $('.sidebar .collapse').collapse('hide');
    };
  });

  // Close any open menu accordions when window is resized below 768px
  $(window).resize(function() {
    if ($(window).width() < 768) {
      $('.sidebar .collapse').collapse('hide');
    };
  });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function(e) {
    if ($(window).width() > 768) {
      var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
      this.scrollTop += (delta < 0 ? 1 : -1) * 30;
      e.preventDefault();
    }
  });

  // Smooth scrolling using jQuery easing
  $(document).on('click', 'a.scroll-to-top', function(e) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1000, 'easeInOutExpo');
    e.preventDefault();
  });

})(jQuery); // End of use strict

function readUploadImage(input) {
  if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
          $('#imgPlaceholder-upload')
              .attr('src', e.target.result);
      };
      reader.readAsDataURL(input.files[0]);
  }
}

// stream video
const video = document.getElementById('video');
const constraints = {
        audio: false,
        video: {
            width: 1080, height: 960
        }
};

async function initWebcam(){
  try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      handleSucess(stream);
  }
  catch(e){
      console.log(e);
  }
}

  //Sucess
function handleSucess(stream){
    window.stream = stream;
    video.srcObject = stream;
}

function capture(){
  //toggle collapse and show on the cardboard
  $('.collapseCardControl').collapse('toggle');

  // change the image place holder under verify card

    //remove the old verify image placeholder image
  var verifyImagePlaceholder = document.getElementById("imgPlaceholder-verify");
  if (verifyImagePlaceholder){
    verifyImagePlaceholder.remove();
  }
  
  
  var canvas = document.getElementById("webcamSnapCanvas");
  if (canvas){
    //remove previous canvas if any
    canvas.remove();
    // place the image placeholder by canvas
    var verifyImagePlaceholderDiv = document.getElementById("imgPlaceholder-verify-div");
    verifyImagePlaceholderDiv.insertAdjacentHTML('afterbegin', '<canvas class="canvas img-fluid px-3 px-sm-4 mt-3 mb-4" id="webcamSnapCanvas" ></canvas>');

    //   //draw image on canvas
    var canvas = document.getElementById("webcamSnapCanvas");
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    var videoOffsetWidth = video.offsetWidth;
    var videoOffsetHeight = video.offsetHeight;
    canvas.width = videoOffsetWidth;
    canvas.height = videoOffsetHeight;
    context.drawImage(video, 0,0, canvas.width,canvas.height);

  }else{

    // place the image placeholder by canvas
    var verifyImagePlaceholderDiv = document.getElementById("imgPlaceholder-verify-div");
    verifyImagePlaceholderDiv.insertAdjacentHTML('afterbegin', '<canvas class="canvas img-fluid px-3 px-sm-4 mt-3 mb-4" id="webcamSnapCanvas" ></canvas>');

    //   //draw image on canvas
    var canvas = document.getElementById("webcamSnapCanvas");
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    var videoOffsetWidth = video.offsetWidth;
    var videoOffsetHeight = video.offsetHeight;
    canvas.width = videoOffsetWidth;
    canvas.height = videoOffsetHeight;
    context.drawImage(video, 0,0, canvas.width,canvas.height);
  }


}

async function verify(){
  var webcamImage = document.getElementById("webcamSnapCanvas");
  var uploadImage = document.getElementById("uploadImageButton");
  var verifyImagePlaceholderDiv = document.getElementById("imgPlaceholder-verify-div");

  if (webcamImage && uploadImage.files[0]){
    console.log("webcam Image and upload image are available proceed to face verification...");
    
    // const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    let imageUpload = await faceapi.bufferToImage(uploadImage.files[0]);
    const imgUploadDetections = await faceapi.detectSingleFace(imageUpload).withFaceLandmarks().withFaceDescriptor();
    const imgWebcamDetections = await faceapi.detectSingleFace(webcamImage).withFaceLandmarks().withFaceDescriptor();

    if (!imgUploadDetections){
      verifyImagePlaceholderDiv.insertAdjacentText('afterend', "Please upload an image with face =)");
      // console.log("Please upload an image with face =)");
    }
    else if (!imgWebcamDetections){
      verifyImagePlaceholderDiv.insertAdjacentText('afterend', "Please capture a photo with face =)");
      // console.log("Please capture a photo with face =)");
    }
    else{
      const dist = await faceapi.euclideanDistance(imgUploadDetections.descriptor, imgWebcamDetections.descriptor);
      verifyImagePlaceholderDiv.insertAdjacentText('afterend', "distance is: " + dist);
    }

  }else{
    verifyImagePlaceholderDiv.insertAdjacentText('afterend', "Please upload your photo and capture your face before performing face verification. ");
    // console.log("Please upload your photo and capture your face before performing face verification. ");
  }
}

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')


  // faceapi.nets.faceRecognitionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
  // faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
  // faceapi.nets.faceLandmark68TinyNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
  // faceapi.nets.ssdMobilenetv1.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
  // faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
  // 	faceapi.nets.mtcnn.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights')
  
  // faceapi.nets.faceRecognitionNet.loadFromUri('https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights'),
  // faceapi.nets.faceLandmark68Net.loadFromUri('https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights'),
  // faceapi.nets.ssdMobilenetv1.loadFromUri('https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights'),
  // faceapi.nets.tinyFaceDetector.loadFromUri('https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights'),
  // faceapi.nets.mtcnn.loadFromUri('https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights')
]).then(start)

async function start(){
  //init Webcam
  initWebcam();

  //collapse the card and replace the placeholder image by canvas
  document.getElementById("captureButton").addEventListener("click", capture);

  //image verification
  document.getElementById("verifyButton").addEventListener("click", verify);

}
