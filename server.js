var express = require('express'),
	connect = require('connect'),
	ejs = require('ejs'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	GooglePass = require('passport-google').Strategy,
	GithubPass = require('passport-github').Strategy,
	models = require('./models');
	
var port = 8000,
	heroku_url = "http://gentle-hollows-2295.herokuapp.com",
	local_url = "http://localhost:"+port,
	mongohq_db = "mongodb://heroku:hack@linus.mongohq.com:10063/app11021922",
	local_db = 'mongodb://localhost/hackerfair',
	app = module.exports = express.createServer(),
	SITE_URL = local_url,
	MONGO_URI = mongohq_db; //change back to local_db later
	
if (process.argv[2] == "production") {
	SITE_URL = heroku_url;
	MONGO_URI = mongohq_db;
}
	
var db = mongoose.connect(mongohq_db);

function errorCallback(err) {
	if (err) {
		console.log(err);
	}
};

function stripSpaces(str) {
	return str.replace(/^\s+|\s+$/g,'');
}

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({secret: 'autobahn'}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use('/', express.static(__dirname + '/public'));
});

var User = mongoose.model('User', models.UserSchema),
	Hack = mongoose.model('Hack', models.HackSchema);

passport.serializeUser(function(user, done) {
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

passport.use(
	new GithubPass({
		clientID: "1e20347862b454010624",
		clientSecret: "07d5894deb8fa618d63ddf7c5de2b259346f7740",
		callbackURL: SITE_URL+"/auth/github/callback",
	}, function(accessToken, refreshToken, profile, done) {
		User.findOne({"github.id": profile.id}, function(err, doc) {
			if (!doc) {
				doc = new User();
			}
			doc.github.username = profile.username;
			doc.github.url = profile.profileUrl;
			doc.github.avatarUrl = profile._json.avatar_url;
			doc.github.name = profile._json.name;
			doc.github.email = profile.emails[0]["value"];
			doc.save(errorCallback);
			done(err, doc);
		});
	}
));

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', 
	passport.authenticate('github', {
		failureRedirect: '/',
	}),
	function(req, res) {
		res.redirect('/');
	}
);
  
app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/hackers', function(req, res) {
	User.find({}, function(err, docs) {
		res.render('hackers', {
			title: 'hackers',
			user: req.user,
			users: docs,
		});
	});
});

app.get('/hackers/:username', function(req, res) {
	User.findOne({
		"github.username": req.params.username,
	}, function(err, doc) {
		res.render('profile', {
			title: 'profile',
			user: req.user,
			viewing: doc,
		});
	});
});

app.post('/hackers/:username', function(req, res) {
	
});

app.get('/hacks', function(req, res) {
	Hack.find({}, function(err, docs) {
		res.render('hacks', {
			title: 'hacks',
			user: req.user,
			hacks: docs,
		});
	});
});

app.get('/hacks/:id', function(req, res) {
	Hack.findById(req.params.id, function(err, doc) {
		res.render('hack', {
			title: 'hack',
			user: req.user,
			viewing: doc,
		});
	});
});

app.get('/submit', function(req, res) {
	res.render('submit', {
		title: 'submit hack',
		user: req.user,
	});
});

app.post('/submit', function(req, res) {
	var hack = new Hack({
		title: req.body.title,
		owners: [req.user._id],
		source: req.body.source,
		demo: req.body.demo,
		video: req.body.video,
		pictures: req.body.pictures,
		blurb: req.body.blurb,
		tags: req.body.tags.toLowerCase().split(',').map(stripSpaces),
	});
	
	var team = req.body.team.split(',').map(stripSpaces);
	
	for (var i=0; i<team.length; i++) {
		User.findOne({
			"github.username": team[i],
		}, function(err, doc) {
			if (doc) {
				hack.owners.push(doc._id);
			}
			else {
				hack.team.push(team[i]);
			}
		});
	}
});

app.get('/', function(req, res) {
	console.log(req.user);
	res.render('index', {
		title: 'home',
		user: req.user,
	});
});

app.listen(port);
