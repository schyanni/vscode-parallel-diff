
export interface LineScanSegment {
  d: number,
  k: number,
  x: number,
  length: number,
  horizontal?: boolean | undefined
}

export interface SegmentUpdate {
  k: number,
  d: number,
  x: number,
  horizontal: boolean
}

let old_str: string;
let new_str: string;

export function set_string(old_string: string, new_string: string) {
  old_str = old_string;
  new_str = new_string;
}

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



export class Diagonal {
  line_scan: LineScanSegment[];
  k: number;
  updates: SegmentUpdate[];

  constructor(k: number, segments?: LineScanSegment[] | undefined) {
    this.k = k;
    if (segments == undefined) {
      this.line_scan = line_scan(k);
    } else {
      this.line_scan = segments;
    }
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
