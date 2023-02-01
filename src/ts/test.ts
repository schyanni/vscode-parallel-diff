import { greedy_diff } from './diff-kernel/basic_kernel'
import { default_diff } from './diff-default/default_kernel'
import { ChangeObject } from './common/change_object'
import { ParallelOptions } from './common/parallel_options'
import { GenerateString, ChangeString } from './util/generate_string'
import { verify } from './verify'
import { AreTheSame } from './util/verity'
import { ApplyBackwardChange, ApplyForwardChange } from './diff-kernel/change_tools'

let left: string = GenerateString(200);
let right: string = ChangeString(left, 0.2);
let options: ParallelOptions = {threads:1, repeats:1, report: console.log}

let changeObjects: ChangeObject[] = greedy_diff(left, right, options);
let changes : ChangeObject[] = default_diff(left, right, options);
console.log('-------------------------')
console.log(`Original String:`)
console.log(left);
console.log('-------------------------')
console.log('Changed String:')
console.log(right);
console.log('-------------------------')

console.log("My implementation: ")
console.log(JSON.stringify(changeObjects))

console.log()
console.log("Reference implementation:")
console.log(JSON.stringify(changes))

console.log()
console.log('-------------------------')
console.log(`Generate same output: ${AreTheSame(changes, changeObjects)}`)

console.log()
console.log('-------------------------')
console.log(`Reference can change old_string into new_string: ${right == ApplyForwardChange(left, changes)}`)
console.log(`Reference can change new_string into old_string: ${left == ApplyBackwardChange(right, changes)}`)
console.log()
console.log(`My implementation can change old_string into new_string: ${right == ApplyForwardChange(left, changeObjects)}`)
console.log(`My implementation can change new_string into old_string: ${left == ApplyBackwardChange(right, changeObjects)}`)