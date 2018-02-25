var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var count = 0;

//Find the total number of pages
function get_number_pages(url, callback) {
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var number = $('.mr-pager-item').eq(-4).text();
            callback(number);
        }
    });
}


function get_number_restaurants(url, callback) {
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var number_restaurants_1 = $('.pane-ft-b2c-poi-search-ft-b2c-poi-search-title').children('div').text();
            var number_restaurants = number_restaurants_1.substr(97, 3);
            callback(number_restaurants);
        }
    });
}

//Find urls of restaurants on ONE page (not the 615 restaurants only the 18 restaurants on the current page)
function get_urls_in_resultpage(url, callback) {
    var urls_array = [];
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            $('a[class=poi-card-link]').each(function (i, element) {
                urls_array.push('https://restaurant.michelin.fr' + $(element).attr('href'));
                //count++;
                //console.log(count);
            });
            callback(urls_array);
        }
    });
}

//Get informations about ONE restaurant
function get_page(url, callback) {
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var title = $('.poi_intro-display-title').first().text();
            var adress = $('.thoroughfare').first().text();
            var zipcode = $('.postal-code').first().text();
            var city = $('.locality').first().text();
            var description = $('.poi_intro-display-cuisines, .opt-upper__cuisines-info').first().text();
            var number_stars = $('.michelin-poi-distinctions-list').children('li').first().children('.content-wrapper').text()[0];
            var chef = $('.field--name-field-chef').children('.field__items').children('.field__item').first().text()

            var restaurant = {
                "title": enleverEspace(title),
                "address": adress,
                "zipcode": zipcode,
                "city": city,
                "description": enleverEspace(description),
                "stars":number_stars,
                "chef": chef,
                "url": url,
                "promo": "",
                "conditions_reductions" : ""
            };
            callback(restaurant);
        }
    });
}


function get() {
    var url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';
    var json = { "starred_restaurants": [] };
    var counter = 0;
    get_number_restaurants(url, function (number_rest) {
        var number_restaurants = number_rest;
        get_number_pages(url, function (number) {
            for (var i = 1; i <= number; i++) {
                if (i != 1) {
                    url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-' + i;
                }
                get_urls_in_resultpage(url, function (urls_array) {
                    urls_array.forEach(function (element) {
                        get_page(element, function (restaurant) {
                            json.starred_restaurants.push(restaurant);
                            counter++;
                            if (counter == number_restaurants) {
                                fs.writeFile('output.json', JSON.stringify(json.starred_restaurants, null, 4), 'utf8', function (error) { });
                            }
                        });
                    });
                });
            }
        });
    });
}



function enleverEspace(title) {
    var newTitle = "";
    var count = 0;
    for (var i = 2; i < title.length; i++) {
        if (title[i] != ' ') {
            if (count == 1) {
                newTitle += " ";
            }
            newTitle += title[i];
            count = 0;
        }
        if (title[i] == ' ') {
            count++;
        }
    }
    return newTitle;
}

module.exports.get = get;