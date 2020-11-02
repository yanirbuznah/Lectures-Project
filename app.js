const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const _ = require("lodash");


const MyDate = new Date();

mongoose.connect("mongodb+srv://admin:oWoEhiQnXX8RAfl5@cluster0.xd9fc.mongodb.net/computerStructureDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});


const LectureSchema = {
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
  answer: {
    type: String,
    require: true
  },
  telegramId: {
    type: String,
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
  // var MyDateString;
  // MyDateString = MyDate.getFullYear() + '-' + ('0' + (MyDate.getMonth() + 1)).slice(-2) +
  //   '-' + ('0' + MyDate.getDate()).slice(-2);
  //
  res.render('compose');
});

app.post('/compose', function(req, res) {
  const lecture = new Lecture({
    lectureNumber: req.body.lecture,
    part: req.body.part,
    date: MyDate,
    question: req.body.question,
    answer: req.body.answer,
    link: req.body.link,
    telegramId: req.body.telegramId,
    minutes: req.body.minutes,
    seconds: req.body.seconds,
    isAskedByBot: req.body.asked,
    isAnswered: req.body.isAnswered
  });
  lecture.save(function(err) {
    if(!err) {
      res.redirect('/');
    }
    console.log(err);
  });

});

app.get('/lectures/:lectureNumber', function(req, res) {
  const requestedNumber = req.params.lectureNumber;

  Lecture.find({
    lectureNumber: requestedNumber
  }, function(err, lectures) {
    res.render("lecture", {
      number: requestedNumber,
      lectures: lectures
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
