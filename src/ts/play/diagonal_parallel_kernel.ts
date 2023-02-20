import { ChangeObject } from '../common/change_object';
import { ParallelOptions } from '../common/parallel_options';
import { LineScanSegment, SegmentUpdate, Diagonal_Worker } from './diagonal_worker'
import { spawn, ModuleThread, Worker } from 'threads'
import { ObservablePromise } from 'threads/dist/observable-promise';

async function diagonal_kernel(old_string: string, new_string: string, options: ParallelOptions): Promise<LineScanSegment[][]> {
  let workers: ModuleThread<Diagonal_Worker>[] = [];
  for (let i = 0; i < options.threads; ++i) {
    spawn<Diagonal_Worker>(new Worker("./diagonal_worker")).then(
      module_thread => { module_thread.set_strings(old_string, new_string); return module_thread; }).then(
        module_thread => workers.push(module_thread)
      );
  }
  // wait for all workers to spawn
  Promise.all(workers);

  // initialize with minimal diaognals
  let worker_map: Map<number, number> = new Map<number, number>();
  let target_k = old_string.length - new_string.length;
  let target_x = old_string.length - 1;
  let done: boolean = false;

  function map_k_to_worker(k: number): number {
    if (k >= 0) {
      return (2 * k) % options.threads;
    }
    return ((-2 * k) - 1) % options.threads;
  }

  async function add_diagonal(k: number): Promise<void> {
    let index = worker_map.get(k);
    if (Number.isNaN(index)) {
      index = map_k_to_worker(k);
      worker_map.set(k, index);
      return workers[index].add_diagonal(k);
    } else {
      return;
    }
  }

  async function apply_update(update: SegmentUpdate): Promise<void> {
    if (done) {
      return; // some other thread was done.
    }

    let index = worker_map.get(update.k) ?? NaN;
    let worker = workers[index];
    if (update.k == target_k && update.x > target_x) {
      done = true; // we are done
      return;
    }

    worker.apply_update([update]).then(
      (updates) => updates.forEach(
        u => add_diagonal(u.k).then(() => apply_update(u))
      ));
  }

  let initial_update: SegmentUpdate = { d: 0, k: 0, x: 0, horizontal: true };
  let index = map_k_to_worker(0);
  worker_map.set(0, index);
  await add_diagonal(0).then(() => apply_update(initial_update));

  let all_diagonals: Promise<LineScanSegment[]>[] = [];
  workers.forEach(worker => {
    all_diagonals.concat()
  })
}


export async function diagonal_parallel_diff(old_string: string, new_string: string, parallel_options?: ParallelOptions | undefined): Promise<ChangeObject[]> {
  let loptions: ParallelOptions = { threads: 1, repeats: 1 }
  if (typeof (parallel_options) != undefined && parallel_options != undefined) {
    loptions = parallel_options;
  }

  old_string = "0" + old_string;
  new_string = "0" + new_string;
}
