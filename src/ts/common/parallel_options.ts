export interface ParallelOptions {
    threads: number;
    repeats: number;
    verify_solution?: boolean | undefined;
    report?: ((message: string) => void) | undefined;
}