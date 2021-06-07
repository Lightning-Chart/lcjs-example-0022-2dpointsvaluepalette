/*
 * LightningChartJS example that showcases 2D points dynamic coloring based on an arbitrary user data set.
 */
// Import LightningChartJS
const lcjs = require("@arction/lcjs");

// Extract required parts from LightningChartJS.
const {
  lightningChart,
  SolidLine,
  PointShape,
  PalettedFill,
  LUT,
  ColorRGBA,
  Themes,
} = lcjs;

// Import data-generators from 'xydata'-library.
const { createProgressiveTraceGenerator } = require("@arction/xydata");

// Create a XY Chart.
const chart = lightningChart()
  .ChartXY({
    // theme: Themes.dark
  })
  .setTitle("2D points value palette coloring")
  .setPadding({ right: 20 });

const palette = new PalettedFill({
  lookUpProperty: "value",
  lut: new LUT({
    units: "trace dist (y)",
    interpolate: true,
    steps: [
      { value: 0, color: ColorRGBA(255, 255, 127) },
      { value: 2, color: ColorRGBA(255, 0, 0) },
      { value: 10, color: ColorRGBA(255, 0, 0, 0) },
    ],
  }),
});

createProgressiveTraceGenerator()
  .setNumberOfPoints(1000)
  .generate()
  .toPromise()
  .then((tracePoints) => {
    const points = chart
      .addPointSeries({
        pointShape: PointShape.Circle,
      })
      .setName("Outliers")
      .setPointSize(3.0)
      .setPointFillStyle(palette)
      // IMPORTANT: Individual point values must be explicitly enabled for dynamic coloring.
      .setIndividualPointValueEnabled(true);

    // Generate points for outlier series.
    const outlierPoints = [];
    tracePoints.forEach((p) =>
      outlierPoints.push(
        ...new Array(Math.round(Math.random() * 50)).fill(0).map((_, i) => {
          const outlierY = p.y + (Math.random() * 2 - 1) * 10;
          return {
            x: p.x,
            y: outlierY,
            // `value` is used to lookup color from palette. Manual calculation allows any kind of data set to be used.
            value: Math.abs(outlierY - p.y),
          };
        })
      )
    );
    points.add(outlierPoints);

    const line = chart
      .addLineSeries({
        dataPattern: {
          pattern: "ProgressiveX",
        },
      })
      .setName("Trace stroke")
      .add(tracePoints)
      .setStrokeStyle((style) => style.setThickness(5));

    chart.addLegendBox().add(chart);
  });
