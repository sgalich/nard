// Global project variables
// var domain = 'https://onlinenard.com/';    // Truly domain
var domain = 'localhost:3000/';


// Two Maps comparison
// https://stackoverflow.com/a/35951373
function areShallowMapsEqual(map1, map2) {
    var testVal;
    if (map1.size !== map2.size) {
        return false;
    };
    for (var [key, val] of map1) {
        testVal = map2.get(key);
        // in cases of an undefined value, make sure the key
        // actually exists on the object so there are no false positives
        if (testVal !== val || (testVal === undefined && !map2.has(key))) {
            return false;
        };
    };
    return true;
};

// Generate a pseudo link to share with a friend
function generateSharePage(length) {
    let sharePage = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        let newChar = characters.charAt(Math.floor(Math.random() * charactersLength));
        sharePage += newChar;
    }
    return sharePage;
};