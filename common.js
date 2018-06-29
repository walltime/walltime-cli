const axios = require('axios');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const ee = require('easy-encryption');

module.exports = {
    DEFAULT_EXPIRATION_SEC : 60 * 60 * 3, // 3h
    apiInfo: function (testnet) {
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
    },

    insertOnQueue : insertOnQueue,
    followTheRabbit : followTheRabbit
};

function insertOnQueue(queueUrl, message) {
    var sqs = new AWS.SQS({region: 'us-east-1',
        accessKeyId: "AKIAJWV7ZINCVN3ZE6KQ",
        secretAccessKey: "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"});

    var params = {
        MessageBody: message,
        QueueUrl: queueUrl,
        DelaySeconds: 0
    };

    return new Promise(function (resolve, reject) {
        sqs.sendMessage(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
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