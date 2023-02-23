"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyBackwardChange = exports.ApplyForwardChange = void 0;
function ApplyForwardChange(old_string, changeObjects) {
    let result = '';
    changeObjects.forEach((changeObject) => {
        if (changeObject.added) {
            result += changeObject.value;
        }
        else if (changeObject.removed) {
            //
        }
        else {
            result += changeObject.value;
        }
    });
    return result;
}
exports.ApplyForwardChange = ApplyForwardChange;
function ApplyBackwardChange(new_string, changeObjects) {
    let result = '';
    changeObjects.forEach((changeObject) => {
        if (changeObject.removed) {
            result += changeObject.value;
        }
        else if (changeObject.added) {
            //
        }
        else {
            result += changeObject.value;
        }
    });
    return result;
}
exports.ApplyBackwardChange = ApplyBackwardChange;
