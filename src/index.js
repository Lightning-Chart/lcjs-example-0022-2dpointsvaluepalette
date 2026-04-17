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
        theme: (() => {
    const t = Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined
    const smallView = Math.min(window.innerWidth, window.innerHeight) < 500
    if (!window.__lcjsDebugOverlay) {
        window.__lcjsDebugOverlay = document.createElement('div')
        window.__lcjsDebugOverlay.style.cssText = 'position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);color:#fff;padding:4px 8px;z-index:99999;font:12px monospace;pointer-events:none'
        if (document.body) document.body.appendChild(window.__lcjsDebugOverlay)
        setInterval(() => {
            if (!window.__lcjsDebugOverlay.parentNode && document.body) document.body.appendChild(window.__lcjsDebugOverlay)
            window.__lcjsDebugOverlay.textContent = window.innerWidth + 'x' + window.innerHeight + ' dpr=' + window.devicePixelRatio + ' small=' + (Math.min(window.innerWidth, window.innerHeight) < 500)
        }, 500)
    }
    return t && smallView ? lcjs.scaleTheme(t, 0.5) : t
})(),
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
        const line = chart
            .addLineSeries({})
            .setName('Trace stroke')
            .appendJSON(tracePoints)
            .setStrokeStyle((style) => style.setThickness(5))
        const points = chart
            .addPointSeries()
            .setName('Outliers')
            .setPointSize(3.0)
            .setPointFillStyle(palette)
            .setPointStrokeStyle(emptyLine)

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
        points.appendJSON(outlierPoints)
    })
