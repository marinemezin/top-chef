var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var ok = 0;

function page_exist(url, callback) {
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var result = $('.noResultHeader-title').text();
            return result;
        }
    });
}

function get_url_restaurants(url, callback) {
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            $('.resultItem').each(function () {
                var address = 'https://www.lafourchette.com';
                address += $(this).children('.resultItem-avatar').children('a').attr('href');
                console.log(adress);
            });
        }
    });
}


function getDeal() {
    var jsonData = fs.readFileSync('output.json',"utf8");
    var datas = JSON.parse(jsonData);
    //console.log(datas);
    var url = 'https://www.lafourchette.com/search-refine/';
    for (var i = 0; i < datas.length; i++){
        var url_new = url + transformURL(datas[i].title);
        //console.log(url_new);
        page_exist(url_new, function (result) {
            if (result == "") {
                get_url_restaurants(url_new, function (realURL) {
                });
            }
        });
    }
}

function transformURL(chain) {
    var result = "";
    for (let i = 0; i < chain.length; i++) {
        if (chain[i] == ' ') {
            result += "%20";
        }
        else if (chain[i] == 'â') {
            result += "%C3%A2";
        }
        else {
            result += chain[i];
        }
    }
    return result;
}

module.exports.getDeal = getDeal;