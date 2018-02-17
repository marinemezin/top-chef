var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

function transformURL(chain) {
    var result = "";
    for (let i = 0; i < chain.length; i++) {
        if (chain.charCodeAt(i) == 32) {
            result += "%20";
        }
        else if (chain.charCodeAt(i) == 224) { //à
            result += "%C3%A0";
        }
        else if (chain.charCodeAt(i) == 226) { //â
            result += "%C3%A2";
        }
        else if (chain.charCodeAt(i) == 231) { //ç
            result += "%C3%A7";
        }
        else if (chain.charCodeAt(i) == 232) { //è
            result += "%C3%A8";
        }
        else if (chain.charCodeAt(i) == 233) { //é
            result += "%C3%A9";
        }
        else if (chain.charCodeAt(i) == 201) { //Eé
            result += "%C3%89";
        }
        else if (chain.charCodeAt(i) == 234) { //ê
            result += "%C3%AA";
        }
        else if (chain.charCodeAt(i) == 238) { //î
            result += "%C3%AE";
        }
        else if (chain.charCodeAt(i) == 207) { //Î
            result += "%C3%8E";
        }
        else if (chain.charCodeAt(i) == 244) { //ô
            result += "%C3%B4";
        }
        else if (chain.charCodeAt(i) == 150) { //-
            result += "%E2%80%93";
        }
        else if (chain.charCodeAt(i) == 39) { //'
            result += "%27";
        }
        else {
            result += chain[i];
        }
    }
    return result;
}

function isUrlExisting(url, callback) {
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var result = $('.noResultHeader-title').text();
            if ((result == "") && ($('h1').text() == "400 Bad request")) {
                //console.log("if");
                callback(false);
            }
            else if (result == "") {
                //console.log("else if");
                callback(true);
            }
            else {
                //console.log("else");
                callback(false);
            }
        }
        else {
            callback(false);
        }
    });
};

function get_url_restaurants(url, callback) {
    console.log(url);
    request(url, function (error, response, html) {
        if (!error) {
            var realURL = "";
            var $ = cheerio.load(html);
            $('.resultItem').each(function () {
                //tester si on a correspondance avec le code postal
                if (/*on a trouvé le bon item*/true){
                    var address = 'https://www.lafourchette.com';
                    address += $(this).children('.resultItem-information').children().children().attr('href');
                    callback(address);
                }
            });
            callback(realURL);
        }
    });
}

function getDeal() {
    var jsonData = fs.readFileSync('output.json', "utf8");
    var datas = JSON.parse(jsonData);
    var count = 0;
    var number = 0;
    var url = 'https://www.lafourchette.com/search-refine/';
    for (var i = 0; i < /*datas.length*/2; i++) {
        var url_new = url + transformURL(datas[i].title);
        number++;
        isUrlExisting(url_new, function (result) {
            if (result == true) { //407 pages chargent
                get_url_restaurants(url_new, function (realURL) {
                    if (realURL != "") {
                        //on a trouvé le bon URL
                        //trouver les promotions
                        count++;
                        console.log(count);
                    }
                });
            }
        });
    }

    /*
    0->false
    1->true
    2->true
    3->true
    4->false
    5->true
    6->true
    7->true
    8->true
    9->true
    10->true
    */

    /*var title = datas[3].title;
    var url_new = url + transformURL(title);
    //var url_new = 'https://www.lafourchette.com/search-refine/Le%20P%C3%AAch%C3%A9%20Gourmand';
    console.log(url_new);
    console.log(url + title);
    isUrlExisting(url_new, function (result) {
        console.log(result);
        if (result) {
            console.log("yeaaah");
        }
        else {
            console.log("URL doesn't exist");
        }
    });*/
}

module.exports.getDeal = getDeal;


/*var testingFullPage = function () {
    var url = 'https://www.lafourchette.com/search-refine/Agap%C3%A9';
    isUrlExisting(url)
        .then(goInsidePage)
        .then(function (fullfilled) {
            console.log(fullfilled);
        })
        .catch(function (error) {
            console.log(error.message);
        });
};*/


/*function getDeal2() {
    testingFullPage();
}*/