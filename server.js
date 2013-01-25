var express = require('express'),
	connect = require('connect'),
	ejs = require('ejs'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	GooglePass = require('passport-google').Strategy,
	GithubPass = require('passport-github').Strategy,
	models = require('./models');
	
var port = 8000,
	heroku_url = "http://hf.hackersatberkeley.com",
	local_url = "http://localhost:"+port,
	mongohq_db = "mongodb://heroku:hack@linus.mongohq.com:10063/app11021922",
	local_db = 'mongodb://localhost/hackerfair',
	production_gitID = "1e20347862b454010624",
	production_gitSecret = "07d5894deb8fa618d63ddf7c5de2b259346f7740",
	local_gitID = "1771ed921581c00d677e",
	local_gitSecret = "f107369fd2c33bbbed9bd25132edbe9df717bdea";
	
var app = module.exports = express.createServer(),
	SITE_URL = local_url,
	MONGO_URI = mongohq_db,
	GIT_ID = local_gitID,
	GIT_SECRET = local_gitSecret;
	
if (process.argv[2] == "production") {
	SITE_URL = heroku_url;
	MONGO_URI = mongohq_db;
	GIT_ID = production_gitID;
	GIT_SECRET = production_gitSecret;
}
	
var db = mongoose.connect(MONGO_URI);

function errorCallback(err) {
	if (err) {
		console.log(err);
	}
};

function ensureAuthenticated(failureUrl) {
  return function(req, res, next) {
    if (req.isAuthenticated())
      next();
    else
      res.redirect(failureUrl);
  }
}

function forceAbsolute(url) {
	if (url && url.indexOf('://') < 0) {
		url = "http://" + url;
	}
	return url;
}

function stripSpaces(str) {
	return str.replace(/^\s+|\s+$/g,'');
}

function stripPunct(str) {
	return str.replace(/[^a-zA-Z0-9]+/g, '').replace('/ {2,}/',' ');
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
	app.use(express.favicon(__dirname + '/public/img/favicon.ico'));
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
		clientID: GIT_ID,
		clientSecret: GIT_SECRET,
		callbackURL: SITE_URL+"/auth/github/callback",
	}, function(accessToken, refreshToken, profile, done) {
		User.findOne({"github.id": profile.id}, function(err, doc) {
			if (!doc) {
				doc = new User();
				doc.info.name = profile._json.name;
			}
			doc.github.id = profile.id;
			doc.github.username = profile.username;
			doc.github.url = profile.profileUrl;
			doc.github.avatarUrl = profile._json.avatar_url.split('?')[0];
			doc.github.name = profile._json.name;
			doc.github.email = profile.emails[0]["value"];
			doc.save(errorCallback);
			done(err, doc);
		});
	}
));

app.get('/login', passport.authenticate('github'));

app.get('/auth/github/callback', 
	passport.authenticate('github', {
		failureRedirect: '/',	//add failure page
	}),
	function(req, res) {
		res.redirect('/');
	}
);
  
app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/users', function(req, res) {
	User.find({}, function(err, docs) {
		res.render('hackers', {
			title: 'Hackers',
			user: req.user,
			users: docs,
		});
	});
});

app.get('/users/:username', function(req, res) {
	User.findOne({
		"github.username": req.params.username,
	}, function(err, doc) {
		if (doc) {
			Hack.find({
				'team': {
					$all: [req.params.username],
				}
			}, function(err, docs) {
				res.render('profile', {
					title: 'Profile',
					user: req.user,
					viewing: doc,
					hacks: docs,
				});
			});
		}
		else {
			res.redirect('https://github.com/'+req.params.username);
		}
	});
});

app.post('/users/:username', function(req, res) {
	
});

app.get('/projects', function(req, res) {
	Hack.find({}, function(err, docs) {
		res.render('hacks', {
			title: 'Hacks',
			user: req.user,
			hacks: docs,
		});
	});
});

app.get('/projects/:id', function(req, res) {
	Hack.findOne({
		"hackid": req.params.id,
	}, function(err, doc) {
		var team = {};
		
		for (var i=0; i<doc.team.length; i++) {
			team[doc.team[i]] = {
				name: doc.team[i],
			};
		}
		
		User.where('github.username').in(doc.team).exec(function(err, docs) {
			for (var i=0; i<docs.length; i++) {
				team[docs[i].github.username] = {
					name: docs[i].info.name,
					avatarUrl: docs[i].github.avatarUrl,
				};
			}
			res.render('hack', {
				title: doc.title,
				user: req.user,
				hack: doc,
				team: team,
			});
		});
	});
});

app.get('/projects/:id/edit', ensureAuthenticated('/login'), function(req, res) {
	Hack.findOne({
		"hackid": req.params.id,
	}, function(err, doc) {
		if (doc.owners.indexOf(req.user._id) < 0) {
			res.redirect('/projects/'+req.params.id);
		}
		else {
			User.where('_id').in(doc.owners).exec(function(err, docs) {
				res.render('edit_hack', {
					title: doc.title,
					user: req.user,
					hack: doc,
					owners: docs.map(function(owner) {
						return owner.github.username;
					}),
				});
			});
		}
	});
});

app.post('/projects/:id', ensureAuthenticated('/login'), function(req, res) {
	console.log(req.body);
	Hack.findOne({
	  "hackid": req.params.id,
	}, function(err, doc) {
		if (doc.owners.indexOf(req.user._id) < 0) {
			res.redirect('/projects/'+req.params.id);
		} else {
		  doc.title = req.body.title;
		  doc.source = forceAbsolute(req.body.source);
		  doc.demo = forceAbsolute(req.body.demo);
		  doc.video = forceAbsolute(req.body.video);
		  doc.picture = forceAbsolute(req.body.picture);
		  doc.blurb = req.body.blurb;
		  doc.tags = req.body.tags.toLowerCase().split(',').map(stripSpaces);
		  doc.save(function(err, doc) {
        res.redirect('/projects/'+doc.hackid);
		  });
    }
  });
});

app.get('/submit', ensureAuthenticated('/login'), function(req, res) {
	res.render('submit', {
		title: 'Submit Hack',
		user: req.user,
	});
});

app.post('/submit', ensureAuthenticated('/login'), function(req, res) {
	Hack.find({}, function(err, docs) {
		var address = stripPunct(req.body.title.toLowerCase()),
			collisions = 0;
			docs.map(function(doc) {
				collisions += (stripPunct(doc.title.toLowerCase()) == address ? 1 : 0);
			}).length;

		var hack = new Hack({
			title: req.body.title,
			owners: [req.user._id],
			source: forceAbsolute(req.body.source),
			demo: forceAbsolute(req.body.demo),
			video: forceAbsolute(req.body.video),
			picture: forceAbsolute(req.body.picture),
			blurb: req.body.blurb,
			tags: req.body.tags.toLowerCase().split(',').map(stripSpaces),
			hackid: address+"-"+Math.random().toString(36).substring(2, 8)+(collisions ? collisions : ""),
			team: req.body.team.split(',').map(stripSpaces),
		});

		/*
		var team = req.body.team.split(',').map(stripSpaces);
		
		for (var i=0; i<team.length; i++) {
			(function(member) {
				User.findOne({
					"github.username": member,
				}, function(err, doc) {
					if (doc) {
						hack.owners.push(doc._id);
					}
					else {
						hack.team.push(member);
						console.log(hack);
					}
				});
			})(team[i]);
		}
		*/
		hack.save(function(err, doc) {
			if (err) {
				console.log(err);
			}
			res.redirect('/projects/'+hack.hackid);
		});
	});
});

app.get('/', function(req, res) {
	res.render('index', {
		title: 'Home',
		user: req.user,
	});
});

app.listen(process.env.PORT || port);
