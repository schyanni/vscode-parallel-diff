import { ChangeObject } from "./change_object";

export function ApplyChange(input: string, changeObjects: ChangeObject[]): string {
    let index: number = 0;
    let result: string = '';
    changeObjects.forEach((changeObject: ChangeObject) => {
        if (changeObject.added) {
            result += changeObject.value;
            index += changeObject.value.length;
        } else if (changeObject.removed) {
            //
        } else {
            result += changeObject.value;
            index += changeObject.value.length;
        }
    });
    return result;
}