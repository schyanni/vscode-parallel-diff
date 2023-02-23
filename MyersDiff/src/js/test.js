"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basic_kernel_1 = require("./diff-kernel/basic_kernel");
const default_kernel_1 = require("./diff-default/default_kernel");
const spawn_diff_1 = require("./diff-kernel/spawn_diff");
const generate_string_1 = require("./util/generate_string");
const change_tools_1 = require("./diff-kernel/change_tools");
const inner_loop_parallel_kernel_1 = require("./diff-kernel/inner_loop_parallel_kernel");
const matrix_diff_1 = require("./diff-kernel/matrix_diff");
const spawn_parallel_diff_1 = require("./diff-kernel/spawn_parallel_diff");
let left = "Hello there, General Kenobi";
let right = "guguseli there, Generalissimo Keno";
left = (0, generate_string_1.GenerateString)(12);
right = (0, generate_string_1.ChangeString)(left, 0.2);
//left = "haha"
//right = "hehe"
let options = { threads: 4, repetition: 1, report: console.log };
console.log('-------------------------');
console.log(`Original String:`);
console.log(left);
console.log('-------------------------');
console.log('Changed String:');
console.log(right);
console.log("------------------------");
console.log("Default implementation:");
console.log("");
(0, default_kernel_1.default_diff)(left, right, options)
    .then((value) => {
    let changes = value;
    console.log("------------------------");
    console.log(`Can change old string into new string: ${right == (0, change_tools_1.ApplyForwardChange)(left, changes)}`);
    console.log(`Can change new string into old string: ${left == (0, change_tools_1.ApplyBackwardChange)(right, changes)}`);
    console.log(`Number of changes: ${changes.length}`);
    //console.log(JSON.stringify(changes));
})
    .then(() => {
    console.log("------------------------");
    console.log("Greedy Diff implementation:");
    console.log("");
})
    .then(() => (0, basic_kernel_1.greedy_diff)(left, right, options))
    .then((value) => {
    let changes = value;
    console.log("------------------------");
    console.log(`Can change old string into new string: ${right == (0, change_tools_1.ApplyForwardChange)(left, changes)}`);
    console.log(`Can change new string into old string: ${left == (0, change_tools_1.ApplyBackwardChange)(right, changes)}`);
    console.log(`Number of changes: ${changes.length}`);
    //console.log(JSON.stringify(changes));
})
    .then(() => {
    console.log("------------------------");
    console.log("Simple parallel implementation:");
    console.log("");
})
    .then(() => (0, inner_loop_parallel_kernel_1.inner_loop_parallel_diff)(left, right, options))
    .then((value) => {
    let changes = value;
    console.log("------------------------");
    console.log(`Can change old string into new string: ${right == (0, change_tools_1.ApplyForwardChange)(left, changes)}`);
    console.log(`Can change new string into old string: ${left == (0, change_tools_1.ApplyBackwardChange)(right, changes)}`);
    console.log(`Number of changes: ${changes.length}`);
    //console.log(JSON.stringify(changes));
})
    .then(() => {
    console.log("------------------------");
    console.log("Serial Matrix implementation:");
    console.log("");
})
    .then(() => (0, matrix_diff_1.matrix_diff)(left, right, options))
    .then((value) => {
    let changes = value;
    console.log("------------------------");
    console.log(`Can change old string into new string: ${right == (0, change_tools_1.ApplyForwardChange)(left, changes)}`);
    console.log(`Can change new string into old string: ${left == (0, change_tools_1.ApplyBackwardChange)(right, changes)}`);
    console.log(`Number of changes: ${changes.length}`);
    //console.log(JSON.stringify(changes));
})
    .then(() => {
    console.log("------------------------");
    console.log("Serial Fork-spawn implementation:");
    console.log("");
})
    .then(() => (0, spawn_diff_1.spawn_diff)(left, right, options))
    .then((value) => {
    let changes = value;
    console.log("------------------------");
    console.log(`Can change old string into new string: ${right == (0, change_tools_1.ApplyForwardChange)(left, changes)}`);
    console.log(`Can change new string into old string: ${left == (0, change_tools_1.ApplyBackwardChange)(right, changes)}`);
    console.log(`Number of changes: ${changes.length}`);
    //console.log(JSON.stringify(changes));
})
    .then(() => {
    console.log("------------------------");
    console.log("Parallel Fork-spawn implementation:");
    console.log("");
})
    .then(() => (0, spawn_parallel_diff_1.spawn_parallel_diff)(left, right, options))
    .then((value) => {
    let changes = value;
    console.log("------------------------");
    console.log(`Can change old string into new string: ${right == (0, change_tools_1.ApplyForwardChange)(left, changes)}`);
    console.log(`Can change new string into old string: ${left == (0, change_tools_1.ApplyBackwardChange)(right, changes)}`);
    console.log(`Number of changes: ${changes.length}`);
    //console.log(JSON.stringify(changes));
})
    .catch(() => {
    console.error("something went wrong");
});
// inner_loop_parallel_diff(left, right, options).then((value) => {
//     let changes: ChangeObject[] = value;
//     console.log("------------------------");
//     console.log("Simple Parallel implementation:")
//     console.log(`Can change old string into new string: ${right == ApplyForwardChange(left, changes)}`);
//     console.log(`Can change new string into old string: ${left == ApplyBackwardChange(right, changes)}`);
// }).catch(() => {
//     console.error("something went wrong")
// });
