"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
const change_tools_1 = require("./diff-kernel/change_tools");
function verify(old_string, new_string, changes) {
    let built_string = (0, change_tools_1.ApplyForwardChange)(old_string, changes);
    return built_string == new_string;
}
exports.verify = verify;
