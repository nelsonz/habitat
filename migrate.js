var mongo = require('mongoskin');

var habitat_mongo = "mongodb://localhost/testdb",
    hackers_mongo = 'mongodb://noob:place@joe.mongohq.com:10018/sleepberkeley',
    habitat_db = mongo.db(habitat_mongo),
    hackers_db = mongo.db(hackers_mongo);

function stripSpaces(str) {
	return str.replace(/^\s+|\s+$/g,'');
}

function stripPunct(str) {
	return str.replace(/[^a-zA-Z0-9]+/g, '').replace('/ {2,}/',' ');
}

habitat_db.collection('hacks').find().toArray(function(err, hacks) {
  if (hacks.length == 0 || err) {
    console.log("FAIL: Unable to get hacks from new hackers website");
    process.exit(2);
  } else {
    for (var i = 0; i < hacks.length; i++) {
      var hack = hacks[i];
      habitat_db.collection('hacks').update({
        _id: hack._id
      }, {
        $set: {
          event: "hacker-fair"
        }
      });
    }
  }
});

hackers_db.collection('hacks').find().toArray(function(err, hacks) {
  if (hacks.length == 0 || err) {
    console.log("FAIL: Unable to get hacks from old hackers website");
    process.exit(2);
  } else {
    for (var i = 0; i < hacks.length; i++) {
      var hack = hacks[i];
      var new_format_hack = {
        blurb: "",
        demo: hack.demo,
        hackid: stripPunct(hack.project_name.toLowerCase()) + "-" + new Date().getTime().toString(32).substring(2),
        owners: [],
        picture: hack.screenshot,
        event: hack.hackathon,
        team: [],
        title: hack.project_name,
        names: hack.names,
        date: hack.date
      };
      habitat_db.collection('hacks').insert(new_format_hack, function(err,doc) {
        if (err) {
          console.log("FAIL: Could not insert doc into new db");
          console.log(new_format_hack);
        }
      });
    }
  }
});
