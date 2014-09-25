'use strict';

angular.module('tapsterApp')
  .controller('MainCtrl', function($scope, $interval) {

    var player;
    var startTime = null;
    var TIME_LIMIT_IN_SECONDS = 10;
    var NUM_BEATS_TO_USE = 12;
    var currentSongIndex = 0;
    var lastBeat = null;
    var last10Beats = [];

    window.SONGS = [{
      'name': 'Crystallize',
      'artist': 'Lindsey Sterling',
      'video_id': 'aHjpOzsQ9YI',
      'start_seconds': 27.8,
      'bpm': 140
    }, {
      'name': 'Elements',
      'artist': 'Lindsey Sterling',
      'video_id': 'sf6LD2B_kDQ',
      'start_seconds': 20,
      'bpm': 140
    }, {
      'name': 'Scary Monsters and Nice Sprites',
      'artist': 'Skrillex',
      'start_seconds': 20,
      'bpm': 140,
      'video_id': 'WSeNSzJ2-Jw'
    }, {
      'name': 'Freedom Dive',
      'artist': 'Xi',
      'start_seconds': 0,
      'bpm': 222,
      'video_id': 'OI3C9qQlb1U'
    }, {
      'name': 'B.Y.O.B',
      'artist': 'System of a Down',
      'start_seconds': 50,
      'bpm': 101,
      'video_id': 'zUzd9KyIDrM'
    }, {
      'name': 'Move Your Feet',
      'artist': 'Junior Senior',
      'start_seconds': 28,
      'bpm': 119,
      'video_id': 'g71E3A6xu94'
    }, {
      'name': 'Zauberkugel',
      'artist': 'Xi',
      'start_seconds': 10,
      'bpm': 153,
      'video_id': 'GiyHOjlc4tg'
    }, {
      'name': 'Smooth Criminal',
      'artist': 'Michael Jackson',
      'start_seconds': 90,
      'bpm': 118,
      'video_id': 'h_D3VFfhvs4'
    }];

    window.currentSong = window.SONGS[currentSongIndex];
    $scope.currentSong = window.currentSong;
    // $scope.DEBUG = true;

    var calculateUserBpm = function() {
      var now = new Date();
      if (last10Beats.unshift(now) > NUM_BEATS_TO_USE) {
        last10Beats.pop();
      }

      var firstBeat = last10Beats[last10Beats.length - 1];
      var miliseconds = now.getTime() - firstBeat.getTime();
      var minutes = miliseconds / 60000.0;
      return ($scope.currentBeats - 1) / minutes;
    };

    var onDone = function() {
      $scope.showResults = true;
      $scope.trueBpm = $scope.currentSong.bpm;
    };

    var getBatonPos = function() {
      var millis = getMillisecondsSinceStart();
      var millisPerBeat = 1 / ($scope.currentSong.bpm / 60 / 1000);
      var goingRight = millis % (2 * millisPerBeat) > millisPerBeat;
      millis = millis % millisPerBeat;
      var fraction = millis / millisPerBeat;
      if (goingRight) {
        return fraction;
      } else {
        return 1 - fraction;
      }
    };

    var getMillisecondsSinceStart = function() {
      var now = new Date();
      return now.getTime() - startTime.getTime();
    };

    var applyButtonEffects = function() {
      var batonPos = getBatonPos();
      var color1 = [12, 153, 228];
      var color2 = [255, 139, 0];
      var r = color1[0] + Math.round(batonPos * (color2[0] - color1[0]));
      var g = color1[1] + Math.round(batonPos * (color2[1] - color1[1]));
      var b = color1[2] + Math.round(batonPos * (color2[2] - color1[2]));
      $scope.bgColor = 'rgb(' + r + ', ' + g + ', ' + b + ')';

      var BLUR_TIMEOUT = 400;
      var MAX_BLUR = 2;
      var blurFraction = ((new Date()).getTime() - lastBeat.getTime()) / BLUR_TIMEOUT;
      var blur = MAX_BLUR - MAX_BLUR * blurFraction;
      $scope.blur = 'blur(' + blur + 'px)';
    };

    var tick = function() {
      if (startTime) {
        if (!$scope.showResults) {
          $scope.secondsLeft = (TIME_LIMIT_IN_SECONDS - getMillisecondsSinceStart() / 1000).toFixed(0);
        }

        applyButtonEffects();

        if ($scope.secondsLeft === '0' || $scope.secondsLeft === '-0') {
          onDone();
        }
      }
    };

    var loadSong = function(song) {
      var playerEle = document.getElementById('player');
      if (playerEle) {
        playerEle.parentNode.removeChild(playerEle);
      }
      // reattach
      var newPlayerEle = document.createElement('div');
      newPlayerEle.setAttribute('id', 'player');
      document.body.appendChild(newPlayerEle);

      player = new window.YT.Player('player', {
        height: '0',
        width: '0',
        videoId: song.video_id,
        events: {
          'onReady': window.onPlayerReady
        }
      });
      $scope.tapDisabled = true;
    };


    var playTapSound = function() {
      // tapSound.play();
    };

    $scope.nextSong = function() {
      currentSongIndex = (currentSongIndex + 1) % window.SONGS.length;
      window.currentSong = window.SONGS[currentSongIndex];
      $scope.currentSong = window.currentSong;
      $scope.reset();
      loadSong($scope.currentSong);
    };

    $scope.playMusic = function() {
      player.playVideo();
      $scope.tapDisabled = false;
    };

    $scope.handleNewBeat = function() {
      $scope.currentBeats = Math.min($scope.currentBeats + 1, NUM_BEATS_TO_USE);
      if ($scope.currentBeats === 1) {
        startTime = new Date();
        tick();
      } else {
        lastBeat = new Date();
        $scope.bpm = Math.round(calculateUserBpm());
      }
      playTapSound();
    };

    $interval(tick, 30);

    $scope.bpm = '';
    $scope.currentBeats = 0;
    $scope.TIME_LIMIT_IN_SECONDS = TIME_LIMIT_IN_SECONDS;

    $scope.reset = function() {
      startTime = null;
      $scope.showResults = false;
      $scope.currentBeats = 0;
      $scope.secondsLeft = null;
      $scope.bpm = '';
    };


    window.onYouTubeIframeAPIReady = function() {
      loadSong($scope.currentSong);
    };

    // 4. The API will call this function when the video player is ready.
    window.onPlayerReady = function() {
      player.seekTo($scope.currentSong.start_seconds);
      $scope.songReady = true;
    };

  });
