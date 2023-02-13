import { expose } from "threads/worker";

export interface d_path_element {
    x: number;
    y: number;
    horizontal: boolean;
    snake_length: number;
    d_length: number;
}

async function fork_d_path(old_string: string, new_string: string, path: d_path_element): Promise<d_path_element[]> {
    let horizontal: d_path_element = {
        x: path.x + 1, y: path.y, horizontal: true,
        snake_length: 0, d_length: path.d_length + 1
    };
    let vertical: d_path_element = {
        x: path.x, y: path.y + 1, horizontal: false,
        snake_length: 0, d_length: path.d_length + 1
    };

    while (horizontal.x < old_string.length && horizontal.y < new_string.length
        && old_string[horizontal.x] == new_string[horizontal.y]) {
        horizontal.x++;
        horizontal.y++;
        horizontal.snake_length++;
    }

    while (vertical.x < old_string.length && vertical.y < new_string.length
        && old_string[vertical.x] == new_string[vertical.y]) {
        vertical.x++;
        vertical.y++;
        vertical.snake_length++;
    }

    return [horizontal, vertical];
}

export type fork_d_path_function = typeof fork_d_path;

expose (fork_d_path);