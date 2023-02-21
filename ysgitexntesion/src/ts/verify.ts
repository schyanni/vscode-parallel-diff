import { ChangeObject } from "./common/change_object";
import { ApplyForwardChange } from "./diff-kernel/change_tools";

export function verify(old_string: string, new_string: string, changes: ChangeObject[]) : boolean {
    let built_string:string = ApplyForwardChange(old_string, changes);
    return built_string == new_string;
}