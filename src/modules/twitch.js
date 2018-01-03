var Emoties
let rp = require('request-promise')
var request = require('request');
var fse = require('fs-extra');
var ready = 0
let pathSubs = './src/modules/needful/subscriber.json';
let pathGlob = './src/modules/needful/global.json'
async function firstRun() {
    let subscriber = await fse.readJson(pathSubs)
    let global = await fse.readJson(pathGlob)

    Emoties = makeArray(subscriber, global);
    delete subscriber;
    delete global;
    ready++ 
}
firstRun()

function makeArray(streamers, global) {
    let arr1 = [];
    let counter = 0
    for (var subscriber in streamers) {
        let partner = streamers[subscriber].emotes
        arr1.push({
            "items": partner.length,
            "first": partner[0],
            "emotes": partner
        })
    }
    for (var subscriber in global) {
        arr1.push({
            "items": 1,
            "first": global[subscriber]
        })
    }
    return arr1.sort(function (a, b) {
        if (a.items > b.items) {
            return -1;
        }
        if (a.items < b.items) {
            return +1;
        }
        return 0;
    });

}


module.exports.getUrl = function (string) {
    let h = getId(string);
    if (h > 0) {
        return `https://static-cdn.jtvnw.net/emoticons/v1/${h}/1.0`
    } else {
        return 0
    }

}


function getId(string) {
    try {
        let lower = string.toLowerCase();
        outer: for (var i = 0; i < Emoties.length; i++) {
            let lower1 = Emoties[i].first.code.toLowerCase()
            let repeatedString = search(lower1, lower)
            if (lower1 == lower) {
                return Emoties[i].first.id
                break outer;
            } else if (Emoties[i].items !== 1 && repeatedString.length > 1) {
                for (let n = 0; Emoties[i].emotes.length > n; n++) {
                    let j = Emoties[i].emotes[n].code.toLowerCase();
                    if (j == lower) {
                        return Emoties[i].emotes[n].id
                        break outer;
                    }
                }
            }
        }
        return -1
    } catch (e) {
        console.error(e);
    }

}

module.exports.updateStreamers = async function () {
    try {
        ready = 0
        let g = await rp({
            uri: "https://twitchemotes.com/api_cache/v3/global.json",
            method: "GET",
            json: true,
            simple: false,
            resolveWithFullResponse: true
        })
        await fse.writeJson(pathGlob, g.body)
        let s = await rp({
            uri: "https://twitchemotes.com/api_cache/v3/subscriber.json",
            method: "GET",
            json: true,
            simple: false,
            resolveWithFullResponse: true
        })
        await fse.writeJson(pathSubs, s.body)
        await firstRun();
    } catch (e) {
        console.error(e);
    }
}

function search(string1, string2) {
    let toRet = '';
    for (var str1 in string1) {
        let symbol = string1[str1];
        for (var str2 in string2) {
            if (string2[str2] == symbol) {
                toRet += symbol
                break;
            }
        }
    }
    return toRet
}