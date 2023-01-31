import { diffChars, Change } from 'diff'

export function default_diff(left: string, right: string) : Change[] {
    return diffChars(left, right);
}

