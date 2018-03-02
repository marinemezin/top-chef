var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

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


var get_a_data = function (i, datas) {
    return Promise.resolve(datas[i]);
}

var isUrlExisting = function (data) {
    var url = 'https://www.lafourchette.com/search-refine/';
    var url_new = url + transformURL(data.title);
    return new Promise(
        function (resolve, reject) {
            var options = {
                url: url_new,
                headers: {
                    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.168 Safari/537.36',
                    'Cookies': 'AHrlqAAAAAMAlcG5qzKVYy4ALtotww=='
                }
            };
            request(options, function (error, response, html) {
                var reason = new Error("URL doesn't exist");
                if (!error) {
                    var $ = cheerio.load(html);
                    var result = $('.noResultHeader-title').text();
                    if ((result == "") && ($('h1').text() == "400 Bad request")) {
                        reject(reason);
                    }
                    else if (result == "") {
                        resolve(data);
                    }
                    else {
                        //console.log("else");
                        reject(reason);
                    }
                }
                else {
                    reject(reason);
                }
            });
        }
    );
};

function findZipcodeFR(address) {
    var countInteger = 0;
    var zipcode = "";
    for (var i = 0; i < address.length; i++){
        try {
            if ((Number.isInteger(Number(address[i]))) && (address[i] != ' ')) {
                countInteger++;
                zipcode += address[i];
            }
            else {
                zipcode = "";
                countInteger = 0;
            }
            if (countInteger == 5) {
                return zipcode;
            }
        }
        catch (error) {
        }
    }
    return null;
}

var get_right_url = function (data) {
    var url = 'https://www.lafourchette.com/search-refine/';
    var url_new = url + transformURL(data.title);
    return new Promise(
        function (resolve, reject) {
            var options = {
                url: url_new,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.168 Safari/537.36',
                    'Cookies': 'AHrlqAAAAAMAlcG5qzKVYy4ALtotww=='
                }
            };
            request(options, function (error, response, html) {
                var reason = new Error("No corresponding restaurant");
                if (!error) {
                    var realURL = "";
                    var $ = cheerio.load(html);
                    $('.resultItem').each(function () {
                        var address = $(this).children('.resultItem-information').children('.resultItem-address').text();
                        address = enleverEspace(address);
                        var zipcode = findZipcodeFR(address);
                        if (zipcode == data.zipcode) {
                            var otherUrl = 'https://www.lafourchette.com';
                            otherUrl += $(this).children('.resultItem-information').children().children().attr('href');
                            data.url = otherUrl;
                            resolve(data);
                        }
                    });
                    reject(reason);
                }
            });
        });
};

var get_promotion = function (data) {
    return new Promise(
        function (resolve, reject) {
            var options = {
                url: data.url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.168 Safari/537.36',
                    'Cookies': 'AHrlqAAAAAMAlcG5qzKVYy4ALtotww=='
                }
            };
            request(options, function (error, response, html) {
                var reason = new Error("No corresponding restaurant");
                if (!error) {
                    var $ = cheerio.load(html);
                    var result = $('.saleTypeTitle--specialOffer').first().children('span').text();
                    console.log("Affichage : " + result);
                    if (result == "Promotions") {
                        var reduction = $('.saleType--specialOffer').first().children('h3').text();
                        var conditions_reduction = $('.saleType--specialOffer').first().children('p').text();
                        data.promo = reduction;
                        data.conditions_reductions = conditions_reduction;
                        resolve(data);
                    }
                    reject(reason);
                }
            });
        });
};

function getDeal() {
    var jsonData = fs.readFileSync('output.json', "utf8");
    var datas = JSON.parse(jsonData);
    var json = { "starred_restaurants": [] };
    var countok = 0;
    var number = 0;
    var url = 'https://www.lafourchette.com/search-refine/';
    for (var i = 0; i < datas.length; i++) {
        var url_new = url + transformURL(datas[i].title);
        number++;
        get_a_data(i, datas)
            .then(isUrlExisting) //404 here
            .then(get_right_url) //291 here
            .then(get_promotion) //24 here
            .then(function (fulfilled) {
                json.starred_restaurants.push(fulfilled);
                countok++;
                fs.writeFile('lafourchette.json', JSON.stringify(json.starred_restaurants, null, 4), 'utf8', function (error) { });
                console.log(countok + number);
            })
            .catch(function (error) {
                //console.log(error.message);
            });
    }
}

module.exports.getDeal = getDeal;