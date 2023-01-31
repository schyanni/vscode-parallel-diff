import { ChangeObject } from "./diff-kernel/change_object";
import { ApplyChange } from "./diff-kernel/change_tools";

export function verify(old_string: string, new_string: string, changes: ChangeObject[]) : boolean {
    let built_string:string = ApplyChange(old_string, changes);
    return built_string == new_string;
}