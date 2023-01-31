import { diffChars } from 'diff'
import { ChangeObject } from '../diff-kernel/change_object';

export function default_diff(left: string, right: string) : ChangeObject[] {
    return diffChars(left, right);
}

