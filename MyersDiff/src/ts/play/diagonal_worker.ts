import { expose } from 'threads/worker'
import { LineScanSegment, SegmentUpdate } from './diagonal'

// Module Data ----------------------------------------

let old_str: string;
let new_str: string;

let diagonals: Map<number, Diagonal> = new Map<number, Diagonal>();

// Module functions -----------------------------------
function line_scan(k: number): LineScanSegment[] {
  let scan: LineScanSegment[] = [];

  let x: number;
  let y: number;
  let segment: LineScanSegment;
  if (k < 0) {
    x = 0;
    y = x - k;
  } else if (k > 0) {
    y = 0;
    x = k + y;
  } else {
    x = 0;
    y = 0;
  }

  while (x < old_str.length && y < new_str.length) {
    segment = { d: x + y + 2, k: k, x: x, length: 0 };
    do {
      ++x;
      ++y;
      ++segment.length;
    } while (x < old_str.length && y < new_str.length && old_str[x] == new_str[y]);
    scan.push(segment);
  }

  return scan;
}

class Diagonal {
  line_scan: LineScanSegment[];
  k: number;
  updates: SegmentUpdate[];

  constructor(k: number, segments: LineScanSegment[]) {
    this.k = k;
    this.line_scan = segments;
    this.updates = [];
  }

  private find(x: number): LineScanSegment | undefined {
    return this.line_scan.find((s) => {
      return s.x <= x && x < s.x + s.length;
    });
  }

  public apply_update(update: SegmentUpdate): SegmentUpdate[] {
    let segment = this.find(update.x);
    let outgoing: SegmentUpdate[] = [];
    if (segment != undefined) {
      if (update.d < segment.d) {
        segment.d = update.d;
        segment.horizontal = update.horizontal;
        let x: number = segment.x + segment.length - 1;
        let y: number = x - this.k;

        // horizontal update
        if (x < old_str.length) {
          let update: SegmentUpdate = { k: segment.k + 1, d: segment.d + 1, x: x + 1, horizontal: true };
          outgoing.push(update);
        }

        // vertical update
        if (y < new_str.length) {
          let update: SegmentUpdate = { k: segment.k - 1, d: segment.d + 1, x: x, horizontal: false };
          outgoing.push(update);
        }
      }
    }

    return outgoing;
  }

  public get_d(): number {
    return this.line_scan[this.line_scan.length - 1].d;
  }

  public get_segments_with_d(d: number): LineScanSegment[] {
    return this.line_scan.filter(s => { return s.d == d; });
  }

  public get_segments(): LineScanSegment[] {
    return this.line_scan;
  }
}


const diagonal_worker = {
  set_strings(old_string: string, new_string: string): void {
    old_str = old_string;
    new_str = new_string;
  },
  add_diagonal(k: number): void {
    if (!diagonals.has(k)) {
      let diagonal = new Diagonal(k, line_scan(k));
      diagonals.set(k, diagonal);
    }
  },
  apply_update(updates: SegmentUpdate[]): SegmentUpdate[] {
    let outgoing: SegmentUpdate[] = [];
    updates.forEach(update => {
      let diag = diagonals.get(update.k);
      if (diag != undefined) {
        outgoing = outgoing.concat(diag.apply_update(update));
      }
    })
    return outgoing;
  },
  get_diagonals(): LineScanSegment[][] {
    let result: LineScanSegment[][] = [];
    diagonals.forEach((value: Diagonal) => {
      result.push(value.get_segments());
    });
    return result;
  }
}

export type Diagonal_Worker_Type = typeof diagonal_worker;
expose(diagonal_worker);


