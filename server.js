var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// NOTE: I haven't been able to figure out the note functionality. As for pseudocode for that part, I would want to create functions for finding, creating, and deleting notes (using .findOne, .create, and .remove respectively)
// After creating the functions, I would incorporate the proper div (to insert the note functionality into) in my index page

// BIG SECOND NOTE: I had a lot of trouble getting this working with HB. Hope this works, but I got a 'basic version' working with an index.html file. I checked the HW directions and it actually doesn't say that HB is required, but then our professor said it was and that he would need to add it to the directions (if you CTRL+F search for handlebars or HB, you'll see its listed as a dependency but not required to use)

// I've tried to get HB working and have created the foundation for my HB pages, but unfortunately without success getting it up and running my ability to debug is severely limited.


var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();


// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
//mongoose.connect("mongodb://localhost/week18Populater", { useNewUrlParser: true });

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

/* mongoose.connect("mongodb://localhost/mongoHeadlines", { useNewUrlParser: true }); */

var path = require("path");


app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, "./public/index.html"));
});

/* app.get("/", function(req, res) {
  res.render("home");
}); */


/* app.get("/saved", function(req, res) {
  res.render("saved");
}); */

// A GET route for scraping the Syracuse website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    axios.get("http://www.syracuse.com/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $(".article__details--headline").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("a")
          .text();
          // .trim();
        result.link = $(this)
          .children("a")
          .attr("href");

        /* result.summary = $(this)
          .children("summary")
          .text()
          .trim(); */
  
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
            console.log("Syracuse Scrape is Done!");
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            return res.json(err);
          });
      });
  
      // If we were able to successfully scrape and save an Article, send a message to the client
      res.send("Syracuse Scrape is Complete!");
    });
  });
  
  // Route for getting all Articles from the db
  app.get("/articles", function(req, res) {
   db.Article.find({})
   .then(function(dbArticle){
     res.json(dbArticle);
   })
   .catch(function(err){
     res.json(err);
   });
    // TODO: Finish the route so it grabs all of the articles
  });
  
  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    db.Note.findOne({_id: req.params.id})
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err){
      res.json(err);
    });
  });
  
  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body)
    .then(function(dbNote){
      return db.Article.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new: true});
    })
    .then(function(dbArticle){
      res.json(dbArticle);
    } )
    .catch(function(err){
      res.json(err);
    });
  });
   
  
  // Start the server
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  