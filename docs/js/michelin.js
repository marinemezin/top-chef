//var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
//var app = express();
//app.get('/scrape', function (req, res) {
function get(){
    url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var title;
            var json = { title: "" };
            $('.poi_card-display-title').filter(function () {
                var data = $(this);
                title = data.text();
                console.log(title);
                json.title = title;
            })
            /*fs.writeFile('output.json', JSON.stringify(json, null, 4), function (err) {

                console.log('File successfully written! - Check your project directory for the output.json file');

            })*/
        }

    })
}
//app.listen('8081');
//console.log('Magic happens on port 8081');
module.exports.get = get /*app*/;

/*function get() {
    const rp = require('request-promise');
    var request = require('request');
    const cheerio = require('cheerio');
    url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';
    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html
    request(url, function (error, response, html) {
        // First we'll check to make sure no errors occurred when making the request
        console.log(html);
        if (!error) {
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
            var $ = cheerio.load(html);
            console.log("je suis 2");
            // Finally, we'll define the variables we're going to capture
            var name, release, rating;
            var json = { name: "" };
            // We'll use the unique header class as a starting point.
            $('.poi_card-display-title').filter(function () {
                console.log("je suis 3");
                // Let's store the data we filter into a variable so we can easily see what's going on.
                var data = $(this);
                // In examining the DOM we notice that the title rests within the first child element of the header tag. 
                // Utilizing jQuery we can easily navigate and get the text by writing the following code:
                title = data.children().first().text();
                // We will repeat the same process as above.  This time we notice that the release is located within the last element.
                // Writing this code will move us to the exact location of the release year.
                release = data.children().last().children().text();
                // Once we have our title, we'll store it to the our json object.
                json.title = title;
                // Once again, once we have the data extract it we'll save it to our json object
                json.release = release;
                console.log("je suis 4");
            })
            // Since the rating is in a different section of the DOM, we'll have to write a new jQuery filter to extract this information.
        }

    })
}
module.exports.get = get;*/