var NUM_STEPS = 32;

var path = "./acoustic_grand_piano-mp3/";
var sounds = [
  path + "C4.mp3",
  path + "D4.mp3",  
  path + "E4.mp3",
  path + "F4.mp3",
  path + "G4.mp3",
  path + "A4.mp3",
  path + "B4.mp3",
  path + "C5.mp3",
  path + "D5.mp3",
  path + "E5.mp3",
];

var play = function(num){
    var audio = new Audio(sounds[num]);
    audio.play();
}

$(document).ready(function() {
    $(".play").click(function(){
        var num = $(".enter-number-text").val();
        var notestoplay = [];
        for(var i = 0; i < num.length; i++){
            var toplay = Number(num[i]);    // note to be played
            var playindex = 0;              // index to get it from the notestoplay array 
            notestoplay.push(toplay);
            setTimeout(function(){play(notestoplay[playindex]); playindex++ }, (i)*300); // i sets the time for
                                                                                          // the function to be played,
                                                                                          // but it needs to increment 
                                                                                          // through playindex to actually
                                                                                          // play correctly.
                                                                                          // Note, it has access to i, etc,
                                                                                          // but those are the static values
                                                                                          // after the for loop has stopped
        }
        
        //var audio = new Audio("/acoustic_grand_piano-mp3/C4.mp3");
        //audio.play();
    })
});

/*Cells = new Mongo.Collection("cells");

Meteor.methods({
  toggleCell: function(cellId) {
    var active = Cells.findOne(cellId).active;
    Cells.update(cellId, {$set: {active: !active}});
  }
});

if (Meteor.isClient) {
  Session.setDefault("playing", false);

  Session.setDefault("step", 0);
  Session.setDefault("bpm", 120);

  function step() {
    Session.set("step", (Session.get("step") + 1) % NUM_STEPS);

    Cells.find({time: Session.get("step")}).forEach(function (cell) {
      if (cell.active) {
        sounds[cell.instrument].play();
      }
    });
  };

  function play() {
    step();
    Session.set("playing", true);

    Meteor.setTimeout(function () {
      if (Session.get("playing")) {
        play();
      }
    }, 60000 / Session.get("bpm") / 4);
  }

  function pause() {
    Session.set("playing", false);
  }

  soundManager.onready(function() {
    sounds = _.map(sounds, function (filename, index) {
      return soundManager.createSound({
        id: 'sound-' + index,
        url: '/' + filename,
        autoLoad: true,
        autoPlay: false,
        onload: function() {
          // loaded
        },
        volume: 50
      });
    });
  });

  Template.oneCell.events({
    "click rect": function () {
      Meteor.call("toggleCell", this.cell._id);
    }
  });

  Template.oneCell.helpers({
    xPos: function () {
      return this.cell.time * 25;
    },
    yPos: function () {
      return this.cell.instrument * 25;
    },
    active: function() {
      return this.cell.active;
    }
  });

  Template.main.events({
    'click .play': function () {
      if (Session.get("playing")) {
        pause();
      } else {
        play();
      }
    },
    "change .bpm": function (event) {
      var newBpm = parseInt(event.target.value, 10);
      Session.set("bpm", newBpm);
    }
  });

  Template.main.helpers({
    cells: function () {
      return Cells.find();
    },
    playing: function () {
      return Session.get("playing");
    },
    stepXPos: function () {
      return Session.get("step") * 25;
    },
    bpm: function () {
      return Session.get("bpm");
    },
    bpmOptions: _.range(20, 300, 5),
    selectedBpm: function (bpmOption) {
      return Session.get("bpm") === bpmOption;
    }
  });
}

if (Meteor.isServer) {
  if (Cells.find().count() === 0) {
    _.each(_.range(4), function (instrumentIndex) {
      _.each(_.range(32), function (timeIndex) {
        Cells.insert({
          instrument: instrumentIndex,
          time: timeIndex
        });
      });
    });
  }
}*/
