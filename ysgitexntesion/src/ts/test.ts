import { greedy_diff } from './diff-kernel/basic_kernel'
import { default_diff } from './diff-default/default_kernel'
import { ChangeObject } from './common/change_object'
//import { Change } from 'diff'

let left: string = 'abcd ich bin daheim'
let right: string = 'abcc ich bi diheim'

let changeObjects: ChangeObject[] = greedy_diff(left, right);
let changes : ChangeObject[] = default_diff(left, right);

console.log("My implementation: ")
console.log(JSON.stringify(changeObjects))

console.log()
console.log("Reference implementation:")
console.log(JSON.stringify(changes))