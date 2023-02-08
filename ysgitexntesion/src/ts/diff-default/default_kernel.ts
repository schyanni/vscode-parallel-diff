import { diffChars } from 'diff'
import { ChangeObject } from '../common/change_object';
import { ParallelOptions } from '../common/parallel_options';

export function default_diff(left: string, right: string, parallel_options?: ParallelOptions | undefined) : ChangeObject[] {
    return diffChars(left, right);
}

