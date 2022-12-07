const { Client } = require("pg");
const date = require('date-and-time');

const {TwitterApi} = require('twitter-api-v2');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const http = require('https');
var userSearchList;
var userIdList = [];
var tags = [];
const myPassword = fs.readFileSync('/home/botcontroller1/TwitBot/.password', 'utf8');
const databaseUrl = fs.readFileSync('/home/botcontroller1/TwitBot/.databaseurl', 'utf8');
const ICXUserId = '1502160779339976709';
const alekUserId = '733947308728061952';
const derekUserId = '721093933384777728';
const labsUserId = '1502432568204947459';
const honeypotUserId = '1368376334594961409';
const brazillianAngelUserId = '1561904804053393408';

var jsonData;
var mainIntArray = [];

const decryptWithAES = (ciphertext, passphrase) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};

function getUserSearchList() {
    let req = http.get("https://bot.uniqued.io/userSearchList.html", function(res) {
	let data = '',
		json_data;

	res.on('data', function(stream) {
		data += stream;
	});
	res.on('end', function() {
                var decryptedData = decryptWithAES(data, myPassword);
                myData = decryptedData.replace(/\\"/g, '"');
                userSearchList = myData.slice(1, -3)
                getIdList();
	});
    });
    req.on('error', function(e) {
        console.log(e.message);
    });
}
function getIdList() {
    let req = http.get("https://bot.uniqued.io/userIDList.html", function(res) {
	let data = '',
		json_data;

	res.on('data', function(stream) {
		data += stream;
	});
	res.on('end', function() {
                var decryptedData = decryptWithAES(data, myPassword);
                userIdListString = decryptedData.slice(2, -4);
                userIdListString = userIdListString.replace(/'/g, "");
                userIdList = userIdListString.split(', ');
                getTagList();
	});
    });
    req.on('error', function(e) {
        console.log(e.message);
    });
}
function getTagList() {
    let req = http.get("https://bot.uniqued.io/tagsList.html", function(res) {
	let data = '',
		json_data;

	res.on('data', function(stream) {
		data += stream;
	});
	res.on('end', function() {
                var decryptedData = decryptWithAES(data, myPassword);
                tagsListString = decryptedData.slice(2, -4);
                tagsListString = tagsListString.replace(/'/g, "");
                tags = tagsListString.split(', ');
                startProgram();
	});
    });
    req.on('error', function(e) {
        console.log(e.message);
    });
}

getUserSearchList();

function startProgram() {
    let req = http.get("https://bot.uniqued.io/credentials.html", function(res) {
	let data = '',
		json_data;

	res.on('data', function(stream) {
		data += stream;
	});
	res.on('end', function() {
                var decryptedData = decryptWithAES(data, myPassword);
		json_data = JSON.parse(decryptedData);
                jsonData = json_data;
                let randInt = getRandomInt(jsonData.length);
                initializeBot(randInt);
	});
});
req.on('error', function(e) {
    console.log(e.message);
});
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function getRandomIntBetween(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function compare(a, b) {
  if (a.public_metrics.reply_count > b.public_metrics.reply_count) return -1;
  if (b.public_metrics.reply_count > a.public_metrics.reply_count) return 1;
  return 0;
}
function selectTags(numberOfTags) {
    var returnArray = [];
    for (let i = 0; i < numberOfTags; i++) {
        let nextTag = tags[getRandomInt(tags.length)];
        if(!returnArray.includes(nextTag)) {
            returnArray.push(nextTag);
        } else {
            i--;
        }
    }
        return returnArray;
}
function retweetUser(userData, user) {
    var client = new TwitterApi({
        appKey: userData.appKey,
        appSecret: userData.appSecret,
        accessToken: userData.accessToken,
        accessSecret: userData.accessSecret,
    });
    client.v2.me(
    ).then((userID) => {
        console.log('Bot Initialized - ID: ' + userID.data.id + ' Name: ' + userID.data.name + ' Username: ' + userID.data.username);
        let boolFlagInt = getRandomInt(250);
        if(boolFlagInt < 30) {
            client.v2.search(userSearchList, {
                'media.fields': 'url',
                'tweet.fields': [
                    'referenced_tweets', 'author_id', 'public_metrics'
                ],
            }).then((val) => {
                let tweetSend = '';
                let randomInt = getRandomInt(val._realData.data.length);
                let tagArray = selectTags(getRandomIntBetween(2, 4));
                let tweetString = tagArray.join(' ');
                let tweetText = val._realData.data[randomInt].text;
                let externalTweetLink = 'https://twitter.com/' + val._realData.data[randomInt].author_id + '/status/' + val._realData.data[randomInt].id;
                //console.log(val._realData.data[randomInt]);
                let boolFlagInt1 = getRandomInt(20);
                if(boolFlagInt1 < 10) {tweetSend += externalTweetLink;}
                else {tweetSend += tweetText;}
                tweetSend += ' ' + tweetString;
                let boolFlagInt2 = getRandomInt(50);
                if(boolFlagInt2 < 10) {tweetSend += ' @ICXTrading';}
                else if(boolFlagInt2 >= 10 && boolFlagInt2 < 20) {tweetSend += ' @AngelsOfCrypto';}
                else if(boolFlagInt2 >= 20 && boolFlagInt2 < 30) {tweetSend += ' @RefugeLabs';}
                else if(boolFlagInt2 >= 40) {tweetSend += ' @BrazillianAngel';}
                console.log('Sending Tweet - Tweet Text: ' + tweetSend);
                client.v2.tweet(tweetSend);
                updateDatabase(userData.appKey, true);
            }).catch((err) => {
                updateDatabase(userData.appKey, false);
                fs.appendFileSync('/home/botcontroller1/TwitBot/accountFailures.log', userData.appKey + '\n');
                console.log(err)
            })
        }
        let boolFlagInt4 = getRandomInt(100);
        let boolFlagInt10 = getRandomInt(100);
        if(boolFlagInt4 < 40) {
            followerAdd(client, userIdList[getRandomInt(userIdList.length)]);
        }
        if(boolFlagInt4 > 95) {
            client.v2.userTimeline(honeypotUserId, {
            }).then((val) => {
                let boolFlagInt5 = getRandomInt(3);
                client.v2.retweet(userID.data.id, val._realData.data[boolFlagInt5].id)
                client.v2.like(userID.data.id, val._realData.data[boolFlagInt5].id)
                updateDatabase(userData.appKey, true);
            }).catch((err) => {
               updateDatabase(userData.appKey, false);
               fs.appendFileSync('/home/botcontroller1/TwitBot/accountFailures.log', userData.appKey + '\n');
                console.log(err)
            })
        }
        else if(boolFlagInt10 > 50) {
            client.v2.userTimeline(brazillianAngelUserId, {
            }).then((val) => {
                let boolFlagInt11 = getRandomInt(5);
                client.v2.retweet(userID.data.id, val._realData.data[boolFlagInt11].id)
                client.v2.like(userID.data.id, val._realData.data[boolFlagInt11].id)
                updateDatabase(userData.appKey, true);
            }).catch((err) => {
               updateDatabase(userData.appKey, false);
               fs.appendFileSync('/home/botcontroller1/TwitBot/accountFailures.log', userData.appKey + '\n');
                console.log(err)
            })
        }
    }).catch((err) => {
        updateDatabase(userData.appKey, false);
        fs.appendFileSync('/home/botcontroller1/TwitBot/accountFailures.log', userData.appKey + '\n');
        console.log(err)
    })
}
function followerAdd(userClient, user) {
    userClient.v2.followers(user
    ).then((val) => {
        //console.log(val);
        let randomArraySize = getRandomIntBetween(2, 10);
        var userIdArray = [];
        for (let i = 0; i < randomArraySize; i++) {
            let nextId = val.data[getRandomInt(val.data.length)].id;
            if(!userIdArray.includes(nextId)) {
                userIdArray.push(nextId);
            } else {
                i--;
            }
            if(i == randomArraySize - 1) {
                userIdArray.forEach(function (element, index, array) {
                    console.log('Adding Follower - ' + element);
                    userClient.v2.me(
                    ).then((userID) => {
                        userClient.v2.follow(userID.data.id, element);
                        let randFlag = getRandomInt(100);
                        if(randFlag > 20) {
                            userClient.v2.userTimeline(element, {
                            }).then((timelineVal) => {
                                if(timelineVal._realData.data.length > 0) {
                                    userClient.v2.like(userID.data.id, timelineVal._realData.data[0].id)
                                    .then((likeVal) => {
                                        console.log('Tweet Liked Successfully!');
                                    }).catch((err) => {
                                        console.log(err)
                                    })
                                }else{
                                    console.log('No Tweets Found To Like');
                                }
                            }).catch((err) => {
                                console.log(err)
                            })
                        }
                        if(index == array.length - 1) {
                            followerRemove(userClient, userID.data.id);
                        }
                    });
                });
            }
        }
    }).catch((err) => {
        updateDatabase(userClient._requestMaker.consumerToken, false);
        fs.appendFileSync('/home/botcontroller1/TwitBot/accountFailures.log', userClient._requestMaker.consumerToken + '\n');
        console.log(err)
    })
}

function followerRemove(userClient, userID) {
    userClient.v2.followers(userID
    ).then((val) => {
        let upperBound = 9;
        if(val.data.length > 4000) {
            upperBount = 13
        }
        let randomArraySize = getRandomIntBetween(2, upperBound);
        var userIdArray = [];
        for (let i = 0; i < randomArraySize; i++) {
            let nextId = val.data[getRandomInt(val.data.length)].id;
            if(!userIdArray.includes(nextId)) {
                userIdArray.push(nextId);
            } else {
                i--;
            }
            if(i == randomArraySize - 1) {
                userIdArray.forEach(function (element, index, array) {
                    console.log('Removing Follower - ' + element);
                    userClient.v2.unfollow(userID, element);
                    if(index == array.length - 1) {
                        updateDatabase(userClient._requestMaker.consumerToken, true);
                    }
                });
            }
        }
    }).catch((err) => {
        updateDatabase(userClient._requestMaker.consumerToken, false);
        fs.appendFileSync('/home/botcontroller1/TwitBot/accountFailures.log', userClient._requestMaker.consumerToken + '\n');
        console.log(err)
    })
}
function initializeBot(userIndex) {
    let timeout4 = getRandomIntBetween(8000, 30000);
    setTimeout(() => {
        retweetUser(jsonData[userIndex], ICXUserId);
    }, timeout4)
}
async function updateDatabase(apiKey, isActive) {
  const client = new Client({
    connectionString: databaseUrl,
    application_name: "TwitBot"
  });

  try {
    await client.connect();
    let statement = "CREATE TABLE IF NOT EXISTS account_tracking (apikey STRING, active BOOL, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
    let result = await client.query(statement);
    statement = "SELECT * FROM account_tracking WHERE apikey = '" + apiKey + "'";
    result = await client.query(statement);
    if (result.rowCount > 0) {
        statement = "UPDATE account_tracking SET active = " + isActive + " WHERE apikey = '" + apiKey + "'";
        result = await client.query(statement);
    } else {
        statement = "INSERT INTO account_tracking (active, apikey) VALUES (" + isActive + ", '" + apiKey + "')";
        result = await client.query(statement);
    }
    /*statement = "SELECT * FROM account_tracking"
    result = await client.query(statement);
    if (result.rowCount > 0) {
        for(let i = 0; i < result.rows.length; i++) {
           console.log('API Key: ' + result.rows[i].apikey + ' Active: ' + result.rows[i].active + ' Timestamp: ' + date.format(result.rows[i].timestamp,'DD/MM/YYYY HH:mm:ss'));
        }
    }*/
    await client.end();
  } catch (err) {
    console.log(`error connecting: ${err}`);
  }
}
