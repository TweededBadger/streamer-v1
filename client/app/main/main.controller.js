'use strict';

angular.module('streamerApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.awesomeThings = [];
    $scope.peerID = "";

    var mediaStream;
    //var audio = new Audio();
    ////audio.src = 'myfile.mp3';
    //audio.controls = true;
    //audio.autoplay = true;
    //document.body.appendChild(audio);

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });

    $scope.startStream = function() {
      if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia;

      if (navigator.getUserMedia){
        navigator.getUserMedia({audio:true}, success, function(e) {
          alert('Error capturing audio.');
        });
      } else alert('getUserMedia not supported in this browser.');

    }

    $scope.makeCall = function() {
      console.log($scope.targetID);
      var call = peer.call($scope.targetID, mediaStream);
    }

    $scope.connectToBroadcast = function() {
      console.log($scope.targetID);
      var c = peer.connect($scope.targetID, {
        label: 'connect',
        serialization: 'none',
        metadata: {id: $scope.peerID}
      });
    }

    var  playStream = function(stream) {
      var audio = $('<audio autoplay />').appendTo('body');
      audio[0].src = (URL || webkitURL || mozURL).createObjectURL(stream);
    }

    var log = function(str) {
      $('.debug').html(str+'<br>'+$('.debug').html())
    }

    var mediaStreamSource;
    var analyser;

    var buflen = 1024;
    var buf = new Float32Array( buflen );

    var waveCanvas;

    var audioContext = new AudioContext();

    var DEBUGCANVAS = document.getElementById( "waveform" );
    if (DEBUGCANVAS) {
      waveCanvas = DEBUGCANVAS.getContext("2d");
      waveCanvas.strokeStyle = "black";
      waveCanvas.lineWidth = 1;
    }

    $scope.checkAudio = function() {
        var cycles = new Array;
        analyser.getFloatTimeDomainData( buf );

      waveCanvas.clearRect(0,0,512,256);
      waveCanvas.strokeStyle = "red";
      waveCanvas.beginPath();
      waveCanvas.moveTo(0,0);
      waveCanvas.lineTo(0,256);
      waveCanvas.moveTo(128,0);
      waveCanvas.lineTo(128,256);
      waveCanvas.moveTo(256,0);
      waveCanvas.lineTo(256,256);
      waveCanvas.moveTo(384,0);
      waveCanvas.lineTo(384,256);
      waveCanvas.moveTo(512,0);
      waveCanvas.lineTo(512,256);
      waveCanvas.stroke();
      waveCanvas.strokeStyle = "black";
      waveCanvas.beginPath();
      waveCanvas.moveTo(0,buf[0]);
      for (var i=1;i<512;i++) {
        waveCanvas.lineTo(i,128+(buf[i]*128));
      }
      waveCanvas.stroke();


      if (!window.requestAnimationFrame)
        window.requestAnimationFrame = window.webkitRequestAnimationFrame;
      var rafID = window.requestAnimationFrame( $scope.checkAudio );


    }

    var startVisualizer = function() {
      $scope.checkAudio();


    }

    var  success = function(e){
      mediaStream = e;

      mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);

      // Connect it to the destination.
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      mediaStreamSource.connect( analyser );

      startVisualizer();

      // creates the audio context
      //var audioContext = window.AudioContext || window.webkitAudioContext;
      //var context = new audioContext();
      //
      //// retrieve the current sample rate to be used for WAV packaging
      //var sampleRate = context.sampleRate;
      //
      //// creates a gain node
      //var volume = context.createGain();
      //
      //// creates an audio node from the microphone incoming stream
      //var audioInput = context.createMediaStreamSource(e);
      //
      //// connect the stream to the gain node
      //audioInput.connect(volume);

      ///* From the spec: This value controls how frequently the audioprocess event is
      // dispatched and how many sample-frames need to be processed each call.
      // Lower values for buffer size will result in a lower (better) latency.
      // Higher values will be necessary to avoid audio breakup and glitches */
      //var bufferSize = 2048;
      //recorder = context.createJavaScriptNode(bufferSize, 2, 2);
      //
      //recorder.onaudioprocess = function(e){
      //  console.log ('recording');
      //  var left = e.inputBuffer.getChannelData (0);
      //  var right = e.inputBuffer.getChannelData (1);
      //  // we clone the samples
      //  leftchannel.push (new Float32Array (left));
      //  rightchannel.push (new Float32Array (right));
      //  recordingLength += bufferSize;
      //}
      //
      //// we connect the recorder
      //volume.connect (recorder);
      //recorder.connect (context.destination);
    }

    //var peer = new Peer({key: '7yq3dpsm6zgp66r',debug: 3,
    //  logFunction: function() {
    //    var copy = Array.prototype.slice.call(arguments).join(' ');
    //    console.log(copy);
    //  }
    //});
    var peer = new Peer({host: '192.168.0.4', port: 9010, key: 'peerjs',debug: 3,
      logFunction: function() {
        var copy = Array.prototype.slice.call(arguments).join(' ');
        console.log(copy);
        log(copy)
      }
    });
    //var peer = new Peer({host: 'localhost', port: 9010, key: 'peerjs'});

    peer.on('open', function(id) {
      console.log('My peer ID is: ' + id);
      $scope.$apply(function() {
        $scope.peerID = id;
      });

    });

    peer.on('connection', function(e) {
      console.log(e);
      console.log(e.metadata.id);
      log("New connection: " + e.metadata.id);
      $scope.targetID = e.metadata.id;
      $scope.makeCall();
    });

    peer.on('error', function(err) {
      console.log(err);
    })

    var connect = function(c) {
      console.log("New chat connection");
      console.log(c);
    }

    peer.on('call', function(call) {
      // Answer the call, providing our mediaStream
      log("Call recieved");
      log(call);
      call.answer(null);
      call.on('stream', function(stream) {
        // `stream` is the MediaStream of the remote peer.
        // Here you'd add it to an HTML video/canvas element.
        console.log(stream);
        playStream(stream);
      });

    });


  });
