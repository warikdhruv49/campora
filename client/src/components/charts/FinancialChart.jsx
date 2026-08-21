import { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { cn } from '../../utils/cn.js';

const DEFAULT_OPTIONS = {
  layout: {
    background: { type: 'solid', color: 'transparent' },
    textColor: '#5c6878',
    fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
  },
  grid: {
    vertLines: { color: 'rgba(148, 160, 176, 0.05)' },
    horzLines: { color: 'rgba(148, 160, 176, 0.07)' },
  },
  rightPriceScale: {
    borderColor: '#1c2530',
    scaleMargins: { top: 0.12, bottom: 0.08 },
  },
  timeScale: {
    borderColor: '#1c2530',
    rightOffset: 4,
    barSpacing: 8,
    minBarSpacing: 2,
  },
  crosshair: {
    mode: CrosshairMode.Normal,
    vertLine: {
      color: '#3a4657',
      width: 1,
      style: 3,
      labelBackgroundColor: '#232c38',
    },
    horzLine: {
      color: '#3a4657',
      width: 1,
      style: 3,
      labelBackgroundColor: '#232c38',
    },
  },
  handleScroll: true,
  handleScale: { axisPressedMouseMove: false },
  localization: { locale: 'en-IN' },
};

export default function FinancialChart({
  data,
  seriesType = 'area',
  color = '#00d492',
  height = 340,
  valueFormatter = (v) => v.toFixed(2),
  tooltipLabel = 'Value',
  className,
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const tooltipRef = useRef(null);
  const formatterRef = useRef(valueFormatter);
  formatterRef.current = valueFormatter;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const chart = createChart(container, {
      ...DEFAULT_OPTIONS,
      width: container.clientWidth,
      height,
    });
    chartRef.current = chart;

    const series =
      seriesType === 'histogram'
        ? chart.addHistogramSeries({
            priceLineVisible: false,
            lastValueVisible: false,
          })
        : chart.addAreaSeries({
            lineColor: color,
            topColor: `${color}2e`,
            bottomColor: `${color}00`,
            lineWidth: 2,
            priceLineColor: color,
            priceLineStyle: 2,
            lastValueVisible: false,
            priceLineVisible: false,
          });
    seriesRef.current = series;

    chart.subscribeCrosshairMove((param) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      if (!param.time || !param.point || !seriesRef.current) {
        tooltip.style.display = 'none';
        return;
      }
      const pointData = param.seriesData.get(seriesRef.current);
      if (!pointData) {
        tooltip.style.display = 'none';
        return;
      }
      const value = pointData.value ?? pointData.close ?? 0;
      const prev = dataRef.current[0];
      let changePct = null;
      if (prev && prev.value !== undefined && prev.value !== 0) {
        changePct = ((value - prev.value) / Math.abs(prev.value)) * 100;
      }
      tooltip.innerHTML = `
        <div class="text-2xs text-txt-muted mb-0.5">${param.point ? new Date(param.time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</div>
        <div class="num text-sm font-semibold text-txt-primary">${formatterRef.current(value)}</div>
        ${changePct !== null ? `<div class="num text-2xs mt-0.5" style="color:${changePct >= 0 ? '#00d492' : '#ff5b66'}">${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%</div>` : ''}
      `;
      tooltip.style.display = 'block';

      const containerWidth = container.clientWidth;
      const tooltipWidth = tooltip.offsetWidth;
      let left = param.point.x - tooltipWidth / 2;
      left = Math.max(8, Math.min(left, containerWidth - tooltipWidth - 8));
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${Math.max(8, param.point.y - tooltip.offsetHeight - 16)}px`;
    });

    const resizeObserver = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      if (width > 0) chart.applyOptions({ width: Math.floor(width) });
    });
    resizeObserver.observe(container);
    setReady(true);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesType]);

  const dataRef = useRef([]);
  useEffect(() => {
    dataRef.current = data || [];
    if (!ready || !seriesRef.current) return;
    const sorted = [...dataRef.current].sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
    seriesRef.current.setData(sorted);
    chartRef.current.timeScale().fitContent();
  }, [data, ready]);

  return (
    <div className={cn('relative', className)} style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />
      <div
        ref={tooltipRef}
        className="absolute z-10 pointer-events-none hidden bg-base-950/95 border border-stroke-strong rounded-lg px-3 py-2 shadow-panel backdrop-blur"
        style={{ display: 'none' }}
      >
        {tooltipLabel}
      </div>
    </div>
  );
}
