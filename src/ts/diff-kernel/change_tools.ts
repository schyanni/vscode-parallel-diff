import { ChangeObject } from "../common/change_object";

export function ApplyForwardChange(input: string, changeObjects: ChangeObject[]): string {
    let index: number = 0;
    let result: string = '';
    changeObjects.forEach((changeObject: ChangeObject) => {
        if (changeObject.added) {
            result += changeObject.value;
            index += changeObject.count;
        } else if (changeObject.removed) {
            //
        } else {
            result += changeObject.value;
            index += changeObject.count;
        }
    });
    return result;
}

export function ApplyBackwardChange(input: string, changeObjects: ChangeObject[]) : string {
    let index: number = 0;
    let result: string = '';
    changeObjects.forEach((changeObject: ChangeObject) => {
        if(changeObject.removed) {
            result += changeObject.value;
            index += changeObject.count;
        } else if(changeObject.added) {
            //
        } else {
            result += changeObject.value;
            index += changeObject.count;
        }
    })
    return result;
}