/*
 * LightningChartJS example that showcases 2D points dynamic coloring based on an arbitrary user data set.
 */
// Import LightningChartJS
const lcjs = require('@lightningchart/lcjs')

// Extract required parts from LightningChartJS.
const { lightningChart, emptyLine, PalettedFill, LUT, regularColorSteps, emptyFill, Themes } = lcjs

// Import data-generators from 'xydata'-library.
const { createProgressiveTraceGenerator } = require('@lightningchart/xydata')

// Create a XY Chart.
const chart = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
    .ChartXY({
        theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
    })
    .setTitle('2D points value palette coloring')
    .setCursorMode('show-all-interpolated')

const theme = chart.getTheme()

const palette = new PalettedFill({
    lookUpProperty: 'value',
    lut: new LUT({
        units: 'trace dist (y)',
        interpolate: true,
        percentageValues: true,
        steps: regularColorSteps(0, 1, theme.examples.intensityColorPalette).map((step, i, steps) =>
            // Make last step transparent.
            i === steps.length - 1 ? { ...step, color: step.color.setA(0) } : step,
        ),
    }),
})

createProgressiveTraceGenerator()
    .setNumberOfPoints(1000)
    .generate()
    .toPromise()
    .then((tracePoints) => {
        const points = chart
            .addPointLineAreaSeries({
                dataPattern: null,
                lookupValues: true,
            })
            .setName('Outliers')
            .setPointSize(3.0)
            .setPointFillStyle(palette)
            .setStrokeStyle(emptyLine)

        // Generate points for outlier series.
        const outlierPoints = []
        tracePoints.forEach((p) =>
            outlierPoints.push(
                ...new Array(Math.round(Math.random() * 50)).fill(0).map((_, i) => {
                    const outlierY = p.y + (Math.random() * 2 - 1) * 10
                    return {
                        x: p.x,
                        y: outlierY,
                        // `value` is used to lookup color from palette. Manual calculation allows any kind of data set to be used.
                        value: Math.abs(outlierY - p.y),
                    }
                }),
            ),
        )
        points.appendJSON(outlierPoints, { x: 'x', y: 'y', lookupValue: 'value' })

        const line = chart
            .addPointLineAreaSeries({
                dataPattern: 'ProgressiveX',
            })
            .setName('Trace stroke')
            .appendJSON(tracePoints)
            .setStrokeStyle((style) => style.setThickness(5))
            .setAreaFillStyle(emptyFill)

        chart
            .addLegendBox()
            .add(chart)
            // Dispose example UI elements automatically if they take too much space. This is to avoid bad UI on mobile / etc. devices.
            .setAutoDispose({
                type: 'max-width',
                maxWidth: 0.2,
            })
    })
