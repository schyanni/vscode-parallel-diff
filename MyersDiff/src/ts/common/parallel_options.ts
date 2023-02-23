export interface ParallelOptions {
    threads: number;
    repeats: number;
    verify_solution?: boolean | undefined;
    reporting_file?: string | undefined;
}