"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_1 = require("threads/worker");
function fork_d_path(old_string, new_string, path) {
    let horizontal = {
        x: path.x + 1, y: path.y, horizontal: true,
        snake_length: 0, d_length: path.d_length + 1
    };
    let vertical = {
        x: path.x, y: path.y + 1, horizontal: false,
        snake_length: 0, d_length: path.d_length + 1
    };
    while (horizontal.x < old_string.length && horizontal.y < new_string.length
        && old_string[horizontal.x] == new_string[horizontal.y]) {
        horizontal.x++;
        horizontal.y++;
        horizontal.snake_length++;
    }
    while (vertical.x < old_string.length && vertical.y < new_string.length
        && old_string[vertical.x] == new_string[vertical.y]) {
        vertical.x++;
        vertical.y++;
        vertical.snake_length++;
    }
    return new Array(horizontal, vertical);
}
(0, worker_1.expose)(fork_d_path);
