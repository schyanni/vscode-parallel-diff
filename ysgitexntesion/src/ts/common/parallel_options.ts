export interface ParallelOptions {
    threads: number;
    repetition: number;
    verify_solution?: boolean | undefined;
    report?: ((message: string) => void) | undefined;
    kernel_time?: number | undefined;
    reconstruction_time?: number | undefined;
    total_time?: number | undefined;
}
