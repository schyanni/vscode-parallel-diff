"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreEqual = void 0;
function AreEqual(expected, actual) {
    if (expected.length != actual.length) {
        console.warn(`They do not have the same length! Expected: ${expected.length} and Actual: ${actual.length}`);
        return false;
    }
    function are_equal(expected, actual) {
        if (expected.value !== actual.value) {
            return false;
        }
        if (expected.count !== actual.count) {
            return false;
        }
        if (expected.added !== actual.added) {
            return false;
        }
        if (expected.removed !== actual.removed) {
            return false;
        }
        return true;
    }
    let is_ok = true;
    for (let i = 0; i < expected.length; ++i) {
        if (!are_equal(expected[i], actual[i])) {
            console.warn(`At index ${i}: Expected is: ${JSON.stringify(expected[i])}, but Actual is: ${JSON.stringify(actual[i])}`);
            is_ok = false;
        }
    }
    return is_ok;
}
exports.AreEqual = AreEqual;
