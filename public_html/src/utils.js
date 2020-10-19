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