import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Song } from '../types';
import { AlertCircle, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface SetlistDurationChartProps {
  songs: (Song & { order: number })[];
  targetDurationMin: number;
}

export default function SetlistDurationChart({ songs, targetDurationMin }: SetlistDurationChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredSong, setHoveredSong] = useState<(Song & { startMinStr: string; endMinStr: string }) | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 100 });

  const totalDurationSec = songs.reduce((sum, s) => sum + s.durationSec, 0);
  const targetDurationSec = targetDurationMin * 60;
  const isOvertime = totalDurationSec > targetDurationSec;
  const isTooShort = totalDurationSec < targetDurationSec * 0.8; // under 80% of target

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // Watch for container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ width: Math.max(width, 300), height: 100 });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || songs.length === 0) return;

    // Clear previous elements
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 20 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Define scales
    const maxVal = Math.max(targetDurationSec, totalDurationSec) * 1.15; // 15% buffer
    const xScale = d3.scaleLinear().domain([0, maxVal]).range([0, width]);

    // Background track
    g.append('rect')
      .attr('width', width)
      .attr('height', 24)
      .attr('rx', 12)
      .attr('ry', 12)
      .attr('fill', '#020617') // deep slate-950
      .attr('stroke', '#1e293b') // slate-800
      .attr('stroke-width', 1.5);

    // Calculate stacked data
    let currentSum = 0;
    const stackedData = songs.map((song) => {
      const start = currentSum;
      const end = currentSum + song.durationSec;
      currentSum = end;
      return {
        ...song,
        start,
        end,
      };
    });

    // Color generator for songs (shades of ambers and goldens)
    const colorScale = d3.scaleOrdinal<string>()
      .domain(songs.map((_, i) => i.toString()))
      .range(['#f59e0b', '#d97706', '#b45309', '#fbbf24', '#f59e0b', '#eab308']);

    // Draw stacked bars
    g.selectAll('.song-bar')
      .data(stackedData)
      .enter()
      .append('rect')
      .attr('class', 'song-bar')
      .attr('x', (d) => xScale(d.start))
      .attr('y', 2)
      .attr('width', (d) => xScale(d.end) - xScale(d.start))
      .attr('height', 20)
      .attr('rx', (d, i) => {
        if (i === 0 && songs.length === 1) return 10;
        if (i === 0) return 10;
        return 0;
      })
      .attr('ry', (d, i) => {
        if (i === 0 && songs.length === 1) return 10;
        if (i === 0) return 10;
        return 0;
      })
      .attr('fill', (d, i) => colorScale(i.toString()))
      .attr('opacity', 0.85)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 1)
          .attr('y', 0)
          .attr('height', 24);

        setHoveredSong({
          ...d,
          startMinStr: formatTime(d.start),
          endMinStr: formatTime(d.end),
        });
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 0.85)
          .attr('y', 2)
          .attr('height', 20);

        setHoveredSong(null);
      });

    // If Overtime, draw a subtle warning cross-hatch or red outline for the overtime segment
    if (isOvertime) {
      const overtimeStart = targetDurationSec;
      const overtimeWidth = xScale(totalDurationSec) - xScale(overtimeStart);

      // Overtime shaded zone
      g.append('rect')
        .attr('x', xScale(overtimeStart))
        .attr('y', 0)
        .attr('width', overtimeWidth)
        .attr('height', 24)
        .attr('fill', 'url(#overtime-hatch)')
        .attr('opacity', 0.5)
        .style('pointer-events', 'none');

      // Glowing border on the overtime segment
      g.append('rect')
        .attr('x', xScale(overtimeStart))
        .attr('y', 0)
        .attr('width', overtimeWidth)
        .attr('height', 24)
        .attr('fill', 'none')
        .attr('stroke', '#ef4444') // red-500
        .attr('stroke-width', 2)
        .attr('rx', 12)
        .attr('ry', 12)
        .style('pointer-events', 'none');
    }

    // Define Overtime hatching pattern
    const defs = svg.append('defs');
    const pattern = defs
      .append('pattern')
      .attr('id', 'overtime-hatch')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 8)
      .attr('height', 8);

    pattern
      .append('path')
      .attr('d', 'M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1.5);

    // Target Duration vertical marker line
    g.append('line')
      .attr('x1', xScale(targetDurationSec))
      .attr('y1', -10)
      .attr('x2', xScale(targetDurationSec))
      .attr('y2', 36)
      .attr('stroke', isOvertime ? '#ef4444' : '#10b981') // red-500 or emerald-500
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,3');

    // Target Label top flag
    g.append('text')
      .attr('x', xScale(targetDurationSec))
      .attr('y', -14)
      .attr('text-anchor', 'middle')
      .attr('fill', isOvertime ? '#ef4444' : '#10b981')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace')
      .text(`TARGET LIMIT: ${targetDurationMin}M`);

    // Draw scale ticks below
    const timeTicks = [0, targetDurationSec / 2, targetDurationSec, maxVal];
    g.selectAll('.tick-label')
      .data(timeTicks)
      .enter()
      .append('text')
      .attr('class', 'tick-label')
      .attr('x', (d) => xScale(d))
      .attr('y', 42)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b') // slate-500
      .attr('font-size', '9px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace')
      .text((d) => {
        if (d === targetDurationSec) return `${targetDurationMin}m`;
        return `${Math.round(d / 60)}m`;
      });

  }, [songs, targetDurationMin, dimensions, totalDurationSec, targetDurationSec, isOvertime]);

  return (
    <div ref={containerRef} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4" id="setlist-duration-chart-root">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            <span>Interactive Pacing & Target Calibration (D3)</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">Visualize track durations sequentially against your allocated gig length.</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Total Playtime:</span>
          <span className={`font-bold ${isOvertime ? 'text-red-400' : isTooShort ? 'text-amber-400' : 'text-emerald-400'}`}>
            {formatTime(totalDurationSec)}
          </span>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="h-28 flex flex-col items-center justify-center border border-slate-800 border-dashed rounded-xl text-slate-500 text-xs">
          Add songs to the setlist to render the duration calibration chart.
        </div>
      ) : (
        <div className="relative">
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="overflow-visible"
          />

          {/* Hover tooltip built dynamically */}
          <div className="min-h-[48px] bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs transition-all mt-2">
            {hoveredSong ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <div>
                    <span className="font-semibold text-slate-200">#{hoveredSong.order} {hoveredSong.title}</span>
                    <span className="text-[10px] text-slate-500 ml-2">({hoveredSong.isOriginal ? 'Original' : 'Cover'})</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
                  <div>
                    <span className="text-slate-600 mr-1">Duration:</span>
                    <span className="text-slate-300 font-bold">{formatTime(hoveredSong.durationSec)}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 mr-1">Flow Range:</span>
                    <span className="text-amber-500 font-semibold">{hoveredSong.startMinStr} - {hoveredSong.endMinStr}</span>
                  </div>
                </div>
              </>
            ) : (
              <span className="text-slate-500 italic text-[11px]">Hover over any colored song block above to audit its timeline placement.</span>
            )}
          </div>
        </div>
      )}

      {/* Dynamic threshold advice banners */}
      {songs.length > 0 && (
        <div className="pt-2">
          {isOvertime ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400 text-xs">
              <AlertTriangle className="shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold block mb-0.5">Setlist is Too Long ({formatTime(totalDurationSec - targetDurationSec)} Over Limit)</span>
                <p className="leading-relaxed text-red-300/90">Your set is exceeding the target gig time. Ensure you have 3-5 minutes buffers for setup, transition adjustments, and unexpected live delays. Consider pruning or substituting shorter tracks.</p>
              </div>
            </div>
          ) : isTooShort ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-400 text-xs">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold block mb-0.5">Setlist is Too Short (Under 80% Target Capacity)</span>
                <p className="leading-relaxed text-amber-300/90">Your current setlist is only filling {Math.round((totalDurationSec / targetDurationSec) * 100)}% of your scheduled set. Consider adding another original track or a high-energy cover to keep the performance robust.</p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 text-emerald-400 text-xs">
              <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold block mb-0.5">Setlist Calibrated Perfectly ({Math.round((totalDurationSec / targetDurationSec) * 100)}% Filled)</span>
                <p className="leading-relaxed text-emerald-300/90">Outstanding set timing balance! This setup guarantees ample margins for onstage storytelling, gear checks, transitions, and allows room for an exciting encore request.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
