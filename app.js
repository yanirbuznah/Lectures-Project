require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: "I love C, and vim.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://" + process.env.MONGO_DB + "@cluster0.xd9fc.mongodb.net/computerStructureDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
mongoose.set("useCreateIndex", true);

const UserSchema = new mongoose.Schema({
  email: String,
  userName: String,
  password: String,
  googleId: String,
  facebookId: String,
  secret: String
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);

const User = new mongoose.model("User", UserSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://cslectures.herokuapp.com//auth/google/cslectures",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      googleId: profile.id,
      username: profile.displayName,
      email: profile.emails[0].value
    }, function(err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "https://cslectures.herokuapp.com/auth/facebook/csLectures",
    profileFields: ['id', 'displayName', 'photos', 'emails']
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      facebookId: profile.id,
      userName: profile.displayName,
      email: profile.emails[0].value

    }, function(err, user) {
      return cb(err, user);
    });
  }
));


const QuestionSchema = {
  lectureNumber: {
    type: Number,
    require: true
  },
  part: {
    type: Number,
    require: true
  },
  link: {
    type: String,
    require: true
  },
  answer: [{
    text: {
      type: String,
      require: true
    },
    userId: Number,
    name: String,
    isInstructor: Boolean
  }],
  telegramId: {
    type: Number,
    require: true
  },
  question: {
    type: String,
    require: true
  },
  minutes: Number,
  seconds: Number,
  isAskedByBot: Boolean,
  isAnswered: Boolean
};

const LectureSchema = {
  lectureNumber: {
    type: Number,
    require: true
  },
  title: String,
  slides: String,
  part: [{
    number: {
      type: Number,
      require: true
    },
    link: {
      type: String,
      require: true
    }
  }]

};
const Question = mongoose.model("Question", QuestionSchema);
const Lecture = mongoose.model("Lecture", LectureSchema);

app.get('/', function(req, res) {
  Lecture.find({}, function(err, lectures) {
    res.render('home', {
      lectures: lectures
    })
  });
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));



app.get('/auth/google/cslectures', passport.authenticate('google', {
    failureRedirect: '/instructor_login'
  }),
  function(req, res) {
    res.redirect('/');
  });


app.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope: ['email']
  }));

app.get('/auth/facebook/csLectures',
  passport.authenticate('facebook', {
    failureRedirect: '/instructor_login'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/instructor_login', function(req, res) {
  res.render('login');
});
app.post('/instructor_login', function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if(err) {
      console.log(err);
    } else {
      passport.authenticate('local');
      res.redirect('/');
    }
  });
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});
app.get('/instructor_register', function(req, res) {
  res.render('register');
});
app.post('/instructor_register', function(req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if(err) {
      console.log(err);
      res.redirect("/instructor_register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect('/');
      });
    }
  })
});
app.post('/lectures/:lectureNumber', function(req, res) {
  const requestedNumber = req.params.lectureNumber;

  const question = new Question({
    lectureNumber: req.body.lecture,
    part: req.body.part,
    question: req.body.question,
    answer: [],
    link: req.body.link + "?start=" + (parseInt(req.body.minutes) * 60 + parseInt(req.body.seconds)),
    telegramId: process.env.TELEGRAM_ID,
    minutes: req.body.minutes,
    seconds: req.body.seconds,
    isAskedByBot: false,
    isAnswered: false
  });
  question.save(function(err) {
    if(!err) {
      res.redirect('/lectures/' + requestedNumber + '#part' + req.body.part);
    } else {
      console.log(err);
    }
  });

});


app.get('/lectures/:lectureNumber', function(req, res) {
  const requestedNumber = req.params.lectureNumber;
  userName = "";
  if(req.isAuthenticated()) {
    userName = req.user.username;

  }
  Lecture.find({}, function(err, lectures) {
    Question.find({
      lectureNumber: requestedNumber
    }, function(err, questions) {
      Lecture.findOne({
        lectureNumber: requestedNumber
      }, function(err, lecture) {
        res.render("lecture", {
          number: requestedNumber,
          questions: questions,
          lecture: lecture,
          lectures: lectures,
          userName: userName
        });

      });
    });
  });
});

app.post('/compose', function(req, res) {
  let isInstructor = false;
  let name = req.body.name;
  if(req.isAuthenticated()) {
    isInstructor = true;
    name = req.user.username;
  }
  Question.updateOne({
    _id: req.body._id
  }, {
    $push: {
      answer: {
        text: req.body.answer,
        name: name,
        isInstructor: isInstructor
      }
    }
  }, function(err) {
    if(!err) res.redirect('/lectures/' + req.body.lectureNumber)
  });

});

// app.get('*', function(req, res) {
//   res.render('404')
// });

let port = process.env.PORT;
if(port == null || port === "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port " + port);
});
