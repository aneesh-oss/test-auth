/**
 * Feel free to explore, or check out the full documentation
 * https://docs.newrelic.com/docs/synthetics/new-relic-synthetics/scripting-monitors/writing-scripted-browsers
 * for details.
 */

const assert = require('assert');

const basicAuth = 'Basic ' + Buffer.from($secure.loginuser + ':' + $secure.loginpassword).toString('base64');
const url = 'https://basic-auth-1rp8.onrender.com/login'; // Replace with your actual URL

async function performApiCheck(retries, networkRetries) {
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': basicAuth
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const degraded = data.collectorsState.Degraded;

        if (degraded >= 400) {
            throw new Error(`Degraded collectors are: ${degraded}`);
        }

        console.log('There are less than 400 degraded collectors.');
        return true;
    } catch (err) {
        if (err.name === 'FetchError' && networkRetries > 0) {
            console.log(`Network error, retrying... Attempts left: ${networkRetries}`);
            return performApiCheck(retries, networkRetries - 1);
        } else if (retries > 0) {
            console.log(`Assertion failed, retrying... Attempts left: ${retries}`);
            return performApiCheck(retries - 1, networkRetries);
        } else {
            console.error('API check failed:', err);
            throw new Error('API is not working correctly');
        }
    }
}

async function performSyntheticCheck(attempts) {
    try {
        await performApiCheck(3, 3);
        console.log('Synthetic check succeeded.');
    } catch (error) {
        if (attempts > 1) {
            console.log(`Synthetic check failed, retrying... Attempts left: ${attempts - 1}`);
            return performSyntheticCheck(attempts - 1);
        } else {
            console.error('Final synthetic check failed:', error);
            throw new Error('Synthetic check failed after multiple attempts');
        }
    }
}

// Start the synthetic 



// /**
//  * Feel free to explore, or check out the full documentation
//  * https://docs.newrelic.com/docs/synthetics/new-relic-synthetics/scripting-monitors/writing-scripted-browsers
//  * for details.
//  */

// const assert = require('assert');

// const basicAuth = 'Basic ' + Buffer.from($secure.loginuser + ':' + $secure.loginpassword).toString('base64');
// const url = ''; // Update with your actual URL

// function performApiCheck(retries, networkRetries) {
//     return new Promise((resolve, reject) => {
//         $http.get(url, {
//             headers: {
//                 'Authorization': basicAuth
//             }
//         }, function (err, response) {
//             if (err) {
//                 if (networkRetries > 0) {
//                     console.log(`Network error, retrying... Attempts left: ${networkRetries}`);
//                     return resolve(performApiCheck(retries, networkRetries - 1));
//                 } else {
//                     console.error('Network error persists:', err);
//                     return reject('Network error, API is not reachable');
//                 }
//             }

//             if (!response || !response.body) {
//                 return reject('Response body is undefined');
//             }

//             console.log('Response Body:', response.body);

//             let data;
//             try {
//                 data = JSON.parse(response.body);
//             } catch (parseError) {
//                 console.error('Error parsing JSON:', parseError);
//                 return reject('Error parsing JSON response');
//             }

//             const degraded = data.collectorsState.Degraded;

//             try {
//                 assert.ok(degraded < 400, `Degraded collectors are: ${degraded}`);
//                 console.log('There are less than 400 degraded collectors.');
//                 return resolve(true);
//             } catch (assertionError) {
//                 if (retries > 0) {
//                     console.log(`Assertion failed, retrying... Attempts left: ${retries}`);
//                     return resolve(performApiCheck(retries - 1, networkRetries));
//                 } else {
//                     console.error('API check failed:', assertionError);
//                     return reject('API is not working correctly');
//                 }
//             }
//         });
//     });
// }

// function performSyntheticCheck(attempts) {
//     return performApiCheck(3, 3)
//         .then(result => {
//             console.log('Synthetic check succeeded.');
//         })
//         .catch(error => {
//             if (attempts > 1) {
//                 console.log(`Synthetic check failed, retrying... Attempts left: ${attempts - 1}`);
//                 return performSyntheticCheck(attempts - 1);
//             } else {
//                 console.error('Final synthetic check failed:', error);
//                 throw new Error('Synthetic check failed after multiple attempts');
//             }
//         });
// }

// // Start the synthetic check with 3 attempts
// performSyntheticCheck(3);
