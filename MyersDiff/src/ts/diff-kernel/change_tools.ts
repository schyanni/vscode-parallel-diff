import { ChangeObject } from "../common/change_object";

export function ApplyForwardChange(old_string: string, changeObjects: ChangeObject[]): string {
    let result: string = '';
    changeObjects.forEach((changeObject: ChangeObject) => {
        if (changeObject.added) {
            result += changeObject.value;
        } else if (changeObject.removed) {
            //
        } else {
            result += changeObject.value;
        }
    });
    return result;
}

export function ApplyBackwardChange(new_string: string, changeObjects: ChangeObject[]) : string {
    let result: string = '';
    changeObjects.forEach((changeObject: ChangeObject) => {
        if(changeObject.removed) {
            result += changeObject.value;
        } else if(changeObject.added) {
            //
        } else {
            result += changeObject.value;
        }
    })
    return result;
}