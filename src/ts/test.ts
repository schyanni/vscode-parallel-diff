import { greedy_diff } from './diff-kernel/basic_kernel'
import { default_diff } from './diff-default/default_kernel'
import { ChangeObject } from './common/change_object'
import { ParallelOptions } from './common/parallel_options'
import { GenerateString, ChangeString } from './util/generate_string'
import { AreEqual } from './util/verify'
import { ApplyBackwardChange, ApplyForwardChange } from './diff-kernel/change_tools'
import { inner_loop_parallel_diff } from './diff-kernel/inner_loop_parallel_kernel'

let left: string = GenerateString(12);
let right: string = ChangeString(left, 0.2);
let options: ParallelOptions = { threads: 1, repeats: 1, report: console.log }


console.log('-------------------------')
console.log(`Original String:`)
console.log(left);
console.log('-------------------------')
console.log('Changed String:')
console.log(right);

console.log("------------------------");
console.log("Default implementation:");
console.log("");
default_diff(left, right, options)
    .then((value) => {
        let changes: ChangeObject[] = value;
        console.log("------------------------");
        console.log(`Can change old string into new string: ${right == ApplyForwardChange(left, changes)}`);
        console.log(`Can change new string into old string: ${left == ApplyBackwardChange(right, changes)}`);
    })
    .then(() => {
        console.log("------------------------");
        console.log("Greedy Diff implementation:")
        console.log("");
    })
    .then(() => greedy_diff(left, right, options))
    .then((value) => {
        let changes: ChangeObject[] = value;
        console.log("------------------------");
        console.log(`Can change old string into new string: ${right == ApplyForwardChange(left, changes)}`);
        console.log(`Can change new string into old string: ${left == ApplyBackwardChange(right, changes)}`);
    })
    .then(() => {
        console.log("------------------------");
        console.log("Simple parallel implementation:")
        console.log("");
    })
    .then(() => inner_loop_parallel_diff(left, right, options))
    .then((value) => {
        let changes: ChangeObject[] = value;
        console.log("------------------------");
        console.log(`Can change old string into new string: ${right == ApplyForwardChange(left, changes)}`);
        console.log(`Can change new string into old string: ${left == ApplyBackwardChange(right, changes)}`);
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