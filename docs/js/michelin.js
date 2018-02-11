var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

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

//Find urls of restaurants on ONE page (not the 615 restaurants only the 18 restaurants on the current page)
function get_urls_in_resultpage(url, callback) {
    var urls_array = [];
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            $('a[class=poi-card-link]').each(function (i, element) {
                urls_array.push('https://restaurant.michelin.fr' + $(element).attr('href'));
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
                "url": url
            };
            callback(restaurant);
        }
    });
}

//Find the number of expected restaurant
/*function get_number_restaurants(url) {
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            get_number_pages(url, function (number) {
                for (let i = 1; i <= number; i++) {
                    if (i != 1) {
                        url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-' + i;
                    }
                    get_urls_in_resultpage(url, function (urls_array) {
                        urls_array.forEach(function (element) {
                            count++;
                        });
                    });
                }
            });
        }
    });
}*/

function get() {
    var url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';
    var number_results = 615;
    var json = { "starred_restaurants": [] };
    var counter = 0;
    get_number_pages(url, function (number) {
        for (let i = 1; i <= number; i++) {
            if (i != 1) {
                url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-' + i;
            }
            get_urls_in_resultpage(url, function (urls_array) {
                urls_array.forEach(function (element) {
                    get_page(element, function (restaurant) {
                        json.starred_restaurants.push(restaurant);
                        counter++;
                        if (counter == number_results) {
                            fs.writeFile('output.json', JSON.stringify(json.starred_restaurants, null, 4), 'utf8', function (error) { });
                        }
                    });
                });
            });
        }
    });
}

function enleverEspace(title) {
    let newTitle = "";
    let count = 0;
    for (let i = 2; i < title.length; i++) {
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


/*request(url, function (error, response, html) {
                if (!error) {
                    var $ = cheerio.load(html);
                    $('.poi-card-link').each(function () {
                        var title, numberStars, postal_code, city;
                        var json = { title: "", numberStars: "", postal_code: "", city: "" };
                        //Titre
                        title = $(this).children('.poi_card-details').children('.poi_card-description').children('.poi_card-display-title').text();
                        title = enleverEspace(title);
                        json.title = title;
                        //Nombre d'étoile
                        var classStars = $(this).children('.poi_card-picture').children('.poi_card-display-guide').children('.guide').children('span');
                        var myString = title + " ; ";
                        if (classStars.hasClass('icon-cotation1etoile')) {
                            myString += "1 etoile\n";
                            json.numberStars = 1;
                        }
                        else if (classStars.hasClass('icon-cotation2etoiles')) {
                            myString += "2 etoiles\n";
                            json.numberStars = 2;
                        }
                        else if (classStars.hasClass('icon-cotation3etoiles')) {
                            myString += "3 etoiles\n";
                            json.numberStars = 3;
                        }
                        //Href
                        let href = 'https://restaurant.michelin.fr' + $(this).attr('href');
                        //console.log(href + '\n');
                        //New request
                        var citi = "";
                        var postalCode = "";
                        request(href, function (error, response, html) {
                            if (!error) {
                                var $$ = cheerio.load(html);
                                var postalCode = $$('.locality-block').first().children('.postal-code').text();
                                var citi = $$('.locality-block').first().children('.locality').text();
                                json.postal_code = postalCode;
                                json.city = citi;
                                //fs.appendFile('result.json', JSON.stringify(json, null, 4), function (err) { });
                                bigArrayJson.push(json);
                                return bigArrayJson;
                            }
                        })
                        //fs.appendFile('result.json', JSON.stringify(json, null, 4), function (err) { });
                    })
                }
            })*/