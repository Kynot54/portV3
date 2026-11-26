import "./three-eras.css";

/*
 * "Three eras": one hairline runs analog (sine) → digital (square) → AI
 * (a small network). Pure SVG + CSS: the waves scroll by translating paths
 * drawn one loop-length too long inside clip paths, so the loop is seamless.
 * Decorative only (aria-hidden). Under prefers-reduced-motion everything
 * stops on a composed still frame (see three-eras.css).
 */

const CY = 110; // centre line
const AMP = 34; // wave amplitude
const LOOP = 240; // scroll distance = two wave periods
const PERIOD = 120;

const ANALOG = { from: 40, to: 480 };
const DIGITAL = { from: 480, to: 780 };
const HUB = { x: 840, y: CY };
const MIDS = [50, 90, 130, 170].map((y) => ({ x: 960, y }));
const OUTS = [80, 140].map((y) => ({ x: 1100, y }));

function sinePath(x0: number, x1: number): string {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 4) {
    const y = CY - AMP * Math.sin(((x - x0) / PERIOD) * 2 * Math.PI);
    pts.push(`${pts.length ? "L" : "M"}${x} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

function squarePath(x0: number, x1: number): string {
  let d = `M${x0} ${CY - AMP}`;
  let high = true;
  for (let x = x0 + PERIOD / 2; x <= x1; x += PERIOD / 2) {
    d += ` H${x} V${high ? CY + AMP : CY - AMP}`;
    high = !high;
  }
  return d;
}

// Crest positions for the travelling points on the analog wave (one per loop).
const crests = (x0: number, x1: number) => {
  const xs: number[] = [];
  for (let x = x0 + PERIOD / 4; x <= x1; x += LOOP) xs.push(x);
  return xs;
};

export function ThreeEras() {
  const a0 = ANALOG.from - LOOP;
  const d0 = DIGITAL.from - LOOP;
  return (
    <div className="three-eras" aria-hidden="true">
      <svg
        viewBox="0 0 1200 200"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        <defs>
          <clipPath id="te-clip-analog">
            <rect
              x={ANALOG.from}
              y="0"
              width={ANALOG.to - ANALOG.from}
              height="200"
            />
          </clipPath>
          <clipPath id="te-clip-digital">
            <rect
              x={DIGITAL.from}
              y="0"
              width={DIGITAL.to - DIGITAL.from}
              height="200"
            />
          </clipPath>
        </defs>

        <g clipPath="url(#te-clip-analog)">
          <g className="te-analog">
            <path className="te-line te-wave" d={sinePath(a0, ANALOG.to)} />
            {crests(a0, ANALOG.to).map((x) => (
              <circle
                key={x}
                className="te-point"
                cx={x}
                cy={CY - AMP}
                r="3.2"
              />
            ))}
          </g>
        </g>

        <g clipPath="url(#te-clip-digital)">
          <g className="te-digital">
            <path className="te-line te-wave" d={squarePath(d0, DIGITAL.to)} />
          </g>
        </g>

        <g className="te-net">
          <path className="te-line" d={`M${DIGITAL.to} ${CY} H${HUB.x}`} />
          {MIDS.map((m, i) => (
            <g key={m.y} className={`te-mid te-mid-${i}`}>
              <path
                className="te-line"
                d={`M${HUB.x} ${HUB.y} L${m.x} ${m.y}`}
              />
              {OUTS.map((o) => (
                <path
                  key={o.y}
                  className="te-line"
                  d={`M${m.x} ${m.y} L${o.x} ${o.y}`}
                />
              ))}
              <circle className="te-node" cx={m.x} cy={m.y} r="5" />
            </g>
          ))}
          <circle
            className="te-node te-node-strong"
            cx={HUB.x}
            cy={HUB.y}
            r="9"
          />
          {OUTS.map((o) => (
            <circle
              key={o.y}
              className="te-node te-node-strong"
              cx={o.x}
              cy={o.y}
              r="6"
            />
          ))}
          {/* Points travel hub → node 1 and node 2 → output 2 (straight edges: transform only). */}
          <circle className="te-point te-p1" cx={HUB.x} cy={HUB.y} r="3.2" />
          <circle
            className="te-point te-p2"
            cx={MIDS[2].x}
            cy={MIDS[2].y}
            r="3.2"
          />
        </g>
      </svg>
    </div>
  );
}
