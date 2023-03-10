import { ChangeObject } from '../common/change_object';
import { ParallelOptions } from '../common/parallel_options';
import { Diagonal_Worker_Type } from './diagonal_worker'
import { LineScanSegment, SegmentUpdate, Diagonal, set_string } from './diagonal';
import { spawn, ModuleThread, Worker } from 'threads'
import { performance } from 'perf_hooks'

async function diagonal_kernel(old_string: string, new_string: string, options: ParallelOptions): Promise<LineScanSegment[][]> {
  let workers: ModuleThread<Diagonal_Worker_Type>[] = [];
  for (let i = 0; i < options.threads; ++i) {
    await spawn<Diagonal_Worker_Type>(new Worker("./diagonal_worker")).then(
      module_thread => { module_thread.set_strings(old_string, new_string); return module_thread; }).then(
        module_thread => workers.push(module_thread)
      );
  }
  // wait for all workers to spawn
  //await Promise.all(workers);

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
    if (index == undefined || Number.isNaN(index)) {
      index = map_k_to_worker(k);
      worker_map.set(k, index);
      return workers[index].add_diagonal(k);
    } else {
      return;
    }
  }

  async function apply_update_to_diagonal(update: SegmentUpdate): Promise<void> {
    if (done) {
      return; // some other thread was done.
    }
    if (update.k == target_k && update.x > target_x) {
      done = true; // we are done
      return;
    }

    let index = worker_map.get(update.k) ?? NaN;
    let worker = workers[index];
    worker.apply_update([update]).then(
      async (updates) => updates.forEach(
        async (u) => add_diagonal(u.k).then(async () => apply_update_to_diagonal(u))
      ));
  }

  let initial_update: SegmentUpdate = { d: 0, k: 0, x: 0, horizontal: true };
  add_diagonal(0).then(async () => apply_update_to_diagonal(initial_update));

  while(!done) {
    
  }

  let all_diagonals: Promise<LineScanSegment[][]>[] = [];
  workers.forEach(worker => {
    all_diagonals.push(worker.get_diagonals())
  });

  let result: LineScanSegment[][] = [];
  await Promise.all(all_diagonals).then(value => value.forEach(group => result.concat(group)));
  return result;
}

function map_diagonals(diagonals: LineScanSegment[][]): Map<number, Diagonal> {
  let map = new Map<number, Diagonal>();
  diagonals.forEach(diagonal => {
    if (diagonal.length > 0) {
      map.set(diagonal[0].k, new Diagonal(diagonal[0].k, diagonal));
    }
  });
  return map;
}

function extract_change(diagonals: Map<number, Diagonal>, k: number, d: number, old_str: string, new_str: string): ChangeObject[] {
  let changes: ChangeObject[] = [];
  let x = old_str.length - 1;
  while (d >= 0) {
    let diag = diagonals.get(k) ?? new Diagonal(NaN);
    let segments = diag.get_segments();
    let segment = segments.find(s => { return s.x <= x && x < s.x + s.length && s.d == d }) ?? { d: NaN, k: NaN, x: NaN, length: NaN };

    if (segment.length > 1) {
      changes.push({ count: segment.length - 1, value: old_str.substring(segment.x + 1, segment.x + segment.length) });
    }

    if (segment.horizontal == true) {
      changes.push({ count: 1, value: old_str[segment.x], removed: true });
      k = k - 1;
      x = segment.x - 1;
    } else if (segment.horizontal == false) {
      let y = segment.x - k;
      changes.push({ count: 1, value: new_str[y], added: true });
      k = k + 1;
      x = segment.x
    } else {
      throw new Error(`Segment can only have at d=0 an unset horizontal. Is now at d=${d}`);
    }

    d = d - 1;
  }

  // handle case d=0;

  changes = changes.reverse();
  changes.shift();
  return changes;
}


export async function diagonal_parallel_diff(old_string: string, new_string: string, parallel_options?: ParallelOptions | undefined): Promise<ChangeObject[]> {
  let loptions: ParallelOptions = { threads: 1, repetition: 1 }
  if (typeof (parallel_options) != undefined && parallel_options != undefined) {
    loptions = parallel_options;
  }

  old_string = "0" + old_string;
  new_string = "0" + new_string;

  let start: any = performance.now();
  let diagonals = await diagonal_kernel(old_string, new_string, loptions);
  let middle: any = performance.now();
  set_string(old_string, new_string);
  let map = map_diagonals(diagonals);
  let k: number = old_string.length - new_string.length;
  let d: number = map.get(k)?.get_d() ?? NaN;
  let changes = extract_change(map, k, d, old_string, new_string);
  let stop: any = performance.now();

  if (parallel_options != undefined) {
    parallel_options.kernel_time = (middle as number) - (start as number);
    parallel_options.reconstruction_time = (stop as number) - (middle as number);
    parallel_options.total_time = (stop as number) - (start as number);
  }
  return changes;

}

let old_st = "helan";
let new_st = "human";
diagonal_parallel_diff(old_st, new_st).then((changes) => console.log(JSON.stringify(changes)));
