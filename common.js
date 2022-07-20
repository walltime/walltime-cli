const axios = require('axios');
const crypto = require('crypto');
const Message = require('bitcoinjs-message');
const btc = require('bitcoinjs-lib');

const DEFAULT_EXPIRATION_SEC = 60 * 60 * 3; // 3h
const JSON_ERROR = { status : { success : false }};

module.exports = {
    DEPOSIT_HARD_LIMIT : 500010,
    DEPOSIT_HARD_MINIMUM : 20,
    NETWORK_XBT_FEE_HARD_LIMIT_MAX : 0.001,
    NETWORK_XBT_FEE_HARD_LIMIT_MIN : 0.0001,
    nonce : function() {
        return crypto.randomBytes(32).toString('hex');
    },
    apiInfo : apiInfo,
    followTheRabbit : followTheRabbit,
    callCommand : function (uuid, address, decryptedKey, nonce,
                            command, version, params, verbose, json, testnet) {
        return new Promise(function (resolve, reject) {
            try {
                process.on('SIGINT', function () {
                    console.log('');
                    console.log('**********');
                    console.log('*** INTERRUPTED! You can try to get the server reply anytime:');
                    console.log('**********');
                    console.log('============================');
                    console.log('walltime follow -' + (testnet ? 't' : '') + 'v ' + nonce);
                    console.log('============================');
                    console.log('FAQ: Why this command is taking too long?');
                    console.log('-----------------------------------------');
                    console.log('Some errors, specially related with repeated nonce, wrong credentials etc. Walltime server will simply ignore without return an error to the final user. It is possible that the command was lost, or it is in the queue to be processed (in case of high load on server, or if the server is temporarily down). Each request has a timeout that can be defined by the user. In this version, the timeout is set hardcoded to 3h. You can use the command "follow" to try to get the asynchronous reply from server now or later.');
                    process.exit();
                });

                var globalResult;

                if (verbose) {
                    console.log('Retrieving endpoint information...');
                }

                apiInfo(testnet).then(result => {
                    globalResult = result;

                    if (verbose) {
                        console.log('Sending message to queue...');
                    }

                    var keyPair = btc.ECPair.fromWIF(decryptedKey);
                    var expiration = new Date();

                    expiration.setSeconds(expiration.getSeconds() + DEFAULT_EXPIRATION_SEC);
                    var data = JSON.stringify({
                        'expiration': expiration.toISOString(),
                        'nonce': nonce,
                        'version': 'v1',
                        'command': command,
                        'user': uuid,
                        'body': JSON.stringify(params)
                    });

                    var rawSignature = Message.sign(data, keyPair.privateKey, true);
                    var signature = rawSignature.toString('base64');

                    var body = JSON.stringify({
                        'bitcoin-address': address,
                        'bitcoin-signature': signature,
                        'data': data
                    });

                    if (verbose) {
                        console.log('Message to send:', body);
                    }

                    return insertOnQueue(globalResult.queueUrl, body);
                }).then(a => {
                    if (verbose) {
                        console.log('Sent!');
                        console.log(a);
                        process.stdout.write('Following the rabbit');
                    }

                    return followTheRabbit(globalResult.responsePrefix + nonce, verbose);
                }).then(a => {
                    if (verbose) {
                        console.log();
                    }

                    if (json) {
                        console.log(JSON.stringify(a, null, 2));
                        resolve();
                    } else {
                        if (!a.status || !a.status.success) {
                            console.error(a.status && a.status.description);
                            console.error('CODE:', a.status && a.status.code);
                            reject(a);
                        } else {
                            resolve(a);
                        }
                    }
                }).catch(error => {
                    if (verbose) {
                        console.error('ERROR:', error);
                    }

                    if (json) {
                        console.log(JSON.stringify(JSON_ERROR));
                    }

                    reject(error);
                });
            } catch (err) {
                reject(err);
            }
        });
    },
    metaInfo : metaInfo
};

function metaInfo(env) {
    var tokenToAvoidCache = crypto.randomBytes(32).toString('hex');
    return axios.get('https://s3.amazonaws.com/data-' + env
            + '-walltime-info/' + env + '/dynamic/meta.json?now=' + tokenToAvoidCache);
}

function apiInfo(testnet) {
    var url;

    if (testnet) {
        url = 'https://walltime.info/testnet/data/dynamic/api.json';
    } else {
        url = 'https://walltime.info/data/dynamic/api.json';
    }

    return new Promise(function (resolve, reject) {
        axios.get(url)
            .then(response => {
                var queueUrl = response.data['api-queue-url'];
                var responsePrefix = response.data['api-response-url-prefix'];

                if (testnet) {
                    queueUrl = queueUrl.replace(/production/g, 'testnet');
                    responsePrefix = responsePrefix.replace(/production/g, 'testnet');
                }

                resolve({
                    queueUrl: queueUrl,
                    responsePrefix: responsePrefix
                });
            })
            .catch(error => {
                reject(error);
            });
    });
}

function insertOnQueue(queueUrl, message) {
    return axios({
        method: 'post',
        url: queueUrl,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: 'MessageBody=' + encodeURIComponent(message)
    });
}

function followTheRabbit(url, verbose, resolveParam) {
    return new Promise(function (resolve, reject) {
        axios.get(url)
            .then(response => {
                resolveParam(response.data);
            }).catch(error => {
                if (verbose) {
                    process.stdout.write('.');
                }

                setTimeout(function () {
                    followTheRabbit(url, verbose, resolveParam || resolve);
                }, 1000);
            });
    });
}
