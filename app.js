const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const _ = require("lodash");
const async = require('async');
var popupS = require('popups');


const MyDate = new Date();

mongoose.connect("mongodb+srv://admin:oWoEhiQnXX8RAfl5@cluster0.xd9fc.mongodb.net/computerStructureDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});


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
    userId: Number
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

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


app.get('/', function(req, res) {
  Lecture.find({}, function(err, lectures) {
    res.render('home', {
      lectures: lectures
    })
  });

});
//
// app.post('/', function(req, res) {
//   const placeName = _.capitalize(req.body.placeName) || _.capitalize(req.header.placeName);
//
//   Place.find({
//     placeName: placeName
//   }, function(err, foundPlace) {
//     if(err) res.send(err);
//     else {
//       if(foundPlace) {
//         res.redirect('/places/' + foundPlace[0].placeName)
//       }
//     }
//   });
//
// });


app.get('/compose', function(req, res) {

  res.render('compose');
});

app.post('/compose', function(req, res) {
  const question = new Question({
    lectureNumber: req.body.lecture,
    part: req.body.part,
    question: req.body.question,
    answer: [],
    link: req.body.link + "?start=" + (parseInt(req.body.minutes) * 60 + parseInt(req.body.seconds)),
    telegramId: req.body.telegramId,
    minutes: req.body.minutes,
    seconds: req.body.seconds,
    isAskedByBot: false,
    isAnswered: false
  });
  question.save(function(err) {
    if(!err) {
      popupS.alert({
        content: 'Hello World!'
      });
      res.redirect('/');
    }
    console.log(err);
  });

});


app.get('/lectures/:lectureNumber', function(req, res) {
  const requestedNumber = req.params.lectureNumber;

  Question.find({
    lectureNumber: requestedNumber
  }, function(err, questions) {
    Lecture.findOne({
      lectureNumber: requestedNumber
    }, function(err, lecture) {
      res.render("lecture", {
        number: requestedNumber,
        questions: questions,
        lecture: lecture
      });

    });
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
