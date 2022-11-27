const {TwitterApi} = require('twitter-api-v2');
const http = require('https');
const userSearchList = '"#crypto" (-is:retweet from:Bitboy_Crypto OR from:WatcherGuru OR from:aantonop OR from:APompliano OR from:ErikVoorhees OR from:VitalikButerin OR from:IvanOnTech OR from:MessariCrypto OR from:TheCryptoDog OR from:PaikCapital OR from:girlgone_crypto OR from:KennethBosak OR from:CryptoDiffer OR from:CryptoWendyO OR from:cz_binance OR from:ethereumJoseph OR from:ASvanevik OR from:lopp OR from:AltcoinGordon)';
const userIdList = ['954005112174862336', '1387497871751196672', '1469101279', '339061487', '61417559', '295218901', '390627208', '412587524', '887748030304329728', '1220850904351399936', '1150790822813560833', '4693571508', '963815487481303040', '935742315389444096', '902926941413453824', '2362854624', '42584365', '23618940', '1354400126857605121'];
const tags = ['#Crypto', '#Altcoins', '#Cryptocurrency', '#CryptoExchange', '#Ethereum', '#Bitcoin', '@Bitcoin', '@Ethereum', '@Binance', '@SBF_FTX', '@Bitboy_Crypto', '@kucoincom', '$ETH', '$BTC', '#DOGE', '$DOGE', '@cz_binance', '@VitalikButerin'];

const ICXUserId = '1502160779339976709';
const alekUserId = '733947308728061952';
const derekUserId = '721093933384777728';
const labsUserId = '1502432568204947459';
const honeypotUserId = '1368376334594961409';

var jsonData;
var mainIntArray = [];

let req = http.get("https://bot.uniqued.io/credentials.json", function(res) {
	let data = '',
		json_data;

	res.on('data', function(stream) {
		data += stream;
	});
	res.on('end', function() {
		json_data = JSON.parse(data);

		// will output a Javascript object
		//console.log(json_data);
                jsonData = json_data;
                for (let i = 0; i < 5; i++) {
                    let randInt = getRandomInt(jsonData.length);
                   // if(i == 0) {
                   //     mainIntArray.push(randInt);
                   // } else if(mainIntArray.includes(randInt)) {
                    if(mainIntArray.includes(randInt)) {
                        //randInt = getRandomInt(jsonData.length);
                        i--;
                    } else {
                        mainIntArray.push(randInt);
                        if(i >= 4) {
                            initializeBot(0);
                        }
                    }
                }
	});
});

req.on('error', function(e) {
    console.log(e.message);
});

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
                else if(boolFlagInt2 >= 10 && boolFlagInt2 < 20) {tweetSend += ' @HoneypotLabs';}
                else if(boolFlagInt2 >= 20 && boolFlagInt2 < 30) {tweetSend += ' @RefugeLabs';}
                console.log('Sending Tweet - Tweet Text: ' + tweetSend);
                client.v2.tweet(tweetSend);
            }).catch((err) => {
                console.log(err)
            })
        }
        let boolFlagInt4 = getRandomInt(100);
        if(boolFlagInt4 < 40) {
            followerAdd(client, userIdList[getRandomInt(userIdList.length)]);
        }
    }).catch((err) => {
        console.log(err)
    })
}

function followerAdd(userClient, user) {
    userClient.v2.followers(user
    ).then((val) => {
        //console.log(val);
        let randomArraySize = getRandomIntBetween(2, 5);
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
                        if(index == array.length - 1) {
                            followerRemove(userClient, userID.data.id);
                        }
                    });
                });
            }
        }
    }).catch((err) => {
        console.log(err)
    })
}

function followerRemove(userClient, userID) {
    userClient.v2.followers(userID
    ).then((val) => {
        let randomArraySize = getRandomIntBetween(2, 5);
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
                });
            }
        }
    }).catch((err) => {
        console.log(err)
    })
}
function initializeBot(userIndex) {
    //let boolFlagInt = getRandomInt(100);
    //let boolFlag = true;
/*    if(boolFlagInt > 40) {
        //boolFlag = false;
        boolFlag = true;
    }*/
    //let timeout1 = getRandomIntBetween(8000, 30000);
    //let timeout2 = getRandomIntBetween(8000, 30000);
    //let timeout3 = getRandomIntBetween(8000, 30000);
    let timeout4 = getRandomIntBetween(8000, 30000);
    setTimeout(() => {
        retweetUser(jsonData[mainIntArray[userIndex]], ICXUserId);
        //if(boolFlag) {retweetUser(jsonData[userIndex], ICXUserId);}
/*        setTimeout(() => {
            console.log("Delayed for " + (timeout1/1000) + " seconds.");
            if(boolFlag) {retweetUser(jsonData[userIndex], derekUserId);}
            setTimeout(() => {
                console.log("Delayed for " + (timeout2/1000) + " seconds.");
                if(boolFlag) {retweetUser(jsonData[userIndex], labsUserId);}
                setTimeout(() => {
                    console.log("Delayed for " + (timeout3/1000) + " seconds.");
                    //if(boolFlag) {retweetUser(jsonData[userIndex], honeypotUserId);}*/
                    userIndex++;
                    if(userIndex < mainIntArray.length) {
                        initializeBot(userIndex);
                    }
                //}, timeout1)
            //}, timeout2)
        //}, timeout3)*/
    }, timeout4)
}
//initializeBot(0);
//initializeBot(1);
