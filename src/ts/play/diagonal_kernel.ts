import { ChangeObject } from "../common/change_object";
import { MergeSameChangeActions } from "../diff-kernel/path_tools";

interface DCoordinate {
  d: number,
  x: number,
  y: number
}

interface LineScanSegment {
  d: number,
  k: number,
  x: number,
  length: number,
  horizontal? : boolean | undefined
}

interface SegmentUpdate {
  k: number,
  d: number,
  x: number,
  horizontal: boolean
}


let old_str: string;
let new_str: string;

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

function PrintOldString(segment: LineScanSegment, old_string: string): string {
  return old_string.substring(segment.x, segment.x + segment.length);
}

function PrintNewString(segment: LineScanSegment, new_string: string): string {
  let y = segment.x - segment.k;
  return new_string.substring(y, y + segment.length);
}

class Diagonal {
  line_scan: LineScanSegment[];
  k: number;
  updates: SegmentUpdate[];

  constructor(k: number) {
    this.k = k;
    this.line_scan = line_scan(k);
    this.updates = [];
    let old_strs: string[] = [];
    let new_strs: string[] = [];
    this.line_scan.forEach(s => {
      old_strs.push(PrintOldString(s, old_str));
      new_strs.push(PrintNewString(s, new_str));
    })
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

function extract_change(diagonals: Map<number, Diagonal>, k: number, d: number): ChangeObject[] {
  let changes: ChangeObject[] = [];
  let x = old_str.length-1;
  while (d >= 0) {
    let diag = diagonals.get(k) ?? new Diagonal(NaN);
    let segments = diag.get_segments();
    let segment = segments.find(s => { return s.x <= x && x < s.x + s.length && s.d == d}) ?? {d: NaN, k: NaN, x: NaN, length: NaN};

    if (segment.length > 1) {
      changes.push({ count: segment.length - 1, value: old_str.substring(segment.x + 1, segment.x + segment.length) });
    }

    if(segment.horizontal == true) {
      changes.push({count: 1, value: old_str[segment.x], removed: true});
      k = k-1;
      x = segment.x -1;
    } else if (segment.horizontal == false) {
      let y = segment.x - k;
      changes.push({count: 1, value: new_str[y], added: true});
      k = k + 1;
      x = segment.x
    } else {
      throw new Error(`Segment can only have at d=0 an unset horizontal. Is now at d=${d}`);
    }

    d = d-1;
  }

  // handle case d=0;

  changes = changes.reverse();
  changes.shift();
  return changes;
}


function kernel(old_string: string, new_string: string): ChangeObject[] {
  old_str = "0" + old_string;
  new_str = "0" + new_string;

  let min_d = Math.abs(old_str.length - new_str.length);
  let diagonals: Map<number, Diagonal> = new Map<number, Diagonal>();

  let diag = new Diagonal(0);
  diagonals.set(0, diag);

  for (let d: number = 1; d <= min_d; ++d) {
    diagonals.set(-d, new Diagonal(-d));
    diagonals.set(d, new Diagonal(d));
  }

  let target_diag = diagonals.get(old_str.length - new_str.length) ?? new Diagonal(NaN);
  let updates: SegmentUpdate[] = [{ d: 0, k: 0, x: 0, horizontal: true }];
  let next_updates: SegmentUpdate[] = [];
  for (let d: number = 0; d < old_str.length + new_str.length; ++d) {
    updates.forEach(update => {
      let diag = diagonals.get(update.k);
      if (diag == undefined) {
        diag = new Diagonal(update.k);
        diagonals.set(update.k, diag);
      }
      let new_updates = diag.apply_update(update);
      next_updates = next_updates.concat(new_updates);
    });

    updates = next_updates;
    next_updates = [];
    if (target_diag.get_d() <= d) {
      break;
    }
  }
  console.log(`Found distance: ${target_diag.get_d()}`)
  let changes = extract_change(diagonals, old_str.length - new_str.length, target_diag.get_d());
  return MergeSameChangeActions(changes);
}


let changes = kernel("hello there", "henlotheres");
console.log("hello there")
console.log("henlotheres")
console.log(JSON.stringify(changes));
