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

/*function isUrlExisting(url, callback) {
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
                if (/*on a trouvé le bon item/true){
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
    for (var i = 0; i < /*datas.length/2; i++) {
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
}*/


var get_a_data = function (i, datas) {
    return Promise.resolve(datas[i]);
}

var isUrlExisting = function (data) {
    var url = 'https://www.lafourchette.com/search-refine/';
    var url_new = url + transformURL(data.title);
    return new Promise(
        function (resolve, reject) {
            request(url_new, function (error, response, html) {
                var reason = new Error("URL doesn't exist");
                if (!error) {
                    var $ = cheerio.load(html);
                    var result = $('.noResultHeader-title').text();
                    if ((result == "") && ($('h1').text() == "400 Bad request")) {
                        //console.log("if");
                        reject(reason);
                    }
                    else if (result == "") {
                        //console.log("else if");
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
            request(url_new, function (error, response, html) {
                var reason = new Error("No corresponding restaurant");
                if (!error) {
                    var realURL = "";
                    var $ = cheerio.load(html);
                    $('.resultItem').each(function () {
                        var address = $(this).children('.resultItem-information').children('.resultItem-address').text();
                        address = enleverEspace(address);
                        var zipcode = findZipcodeFR(address);
                        //console.log(zipcode + ":" + data.zipcode + ":" + data.title);
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

function getDeal() {
    var jsonData = fs.readFileSync('output.json', "utf8");
    var datas = JSON.parse(jsonData);
    var countok = 0;
    var number = 0;
    var url = 'https://www.lafourchette.com/search-refine/';
    for (var i = 0; i < datas.length; i++) {
        var url_new = url + transformURL(datas[i].title);
        number++;
        get_a_data(i, datas)
            .then(isUrlExisting)
            .then(get_right_url)
            //.then trouver les promotions
            .then(function (fulfilled) {
                //console.log(fulfilled.title);
                countok++;
                console.log(countok + ":" + number);
            })
            .catch(function (error) {
                //console.log(error.message);
            });
    }
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

//https://scotch.io/tutorials/javascript-promises-for-dummies

//http://www.tamasoft.co.jp/en/general-info/unicode-decimal.html
//https://www.w3schools.com/tags/ref_urlencode.asp