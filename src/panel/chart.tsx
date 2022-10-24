// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { observer } from 'mobx-react';
import * as React from 'react';
import { PureComponent, ReactNode } from 'react';
import { Result } from 'sarif';
import { renderMessageTextWithEmbeddedLinks } from './widgets';
import { ResultTableStore } from './resultTableStore';
import { Table } from './table';
import { Column } from './tableStore';
import * as d3 from 'd3';

interface ChartProps<G> {
    store: ResultTableStore<G>;
}
@observer export class Chart<G> extends PureComponent<ChartProps<G>> {
    private ref!: SVGSVGElement;
    private PieChart = () => {
        const { store } = this.props;
        const {rows} = store;
        let names: string[];
        if (typeof(rows[0].title) == 'object'){
            console.log(typeof(rows[0].title))
            names = d3.map(rows, d => d.title.id);
        }else{
            names = d3.map(rows, d => d.title);
        }
        let values: number[] = d3.map(rows, d => d.items.length);

        if (names.length > 10){
            names = names.slice(0, 9);
            names.push('Others');
    
            const remainValues = values.slice(10, values.length).reduce((a,b) => a+b, 0);
            values = values.slice(0, 9);
            values.push(remainValues);
        }

        const I = d3.range(names.length).filter(i => !isNaN(values[i]));
        const width = 620; // outer width, in pixels
        const height = 620; // outer height, in pixels
        const innerRadius = 0; // inner radius of pie, in pixels (non-zero for donut)
        const outerRadius = Math.min(width, height) / 2; // outer radius of pie, in pixels
        const labelRadius = (innerRadius * 0.2 + outerRadius * 0.8); // center radius of labels
        const stroke = innerRadius > 0 ? "none" : "white";
        const padAngle = stroke === "none" ? 1 / outerRadius : 0;
        const strokeWidth = 1; // width of stroke separating wedges
        const strokeLinejoin = "round"; // line join of stroke separating wedges

        // Chose a default color scheme based on cardinality.
        let colors = d3.schemeSpectral[names.length];
        colors = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), names.length);
 
        // Construct scales.
        const color = d3.scaleOrdinal(names, colors);
 
        // Compute titles.
        const title = (i:number) => `${names[i]}\n${values[i]}`;
    
        // Construct arcs.
        const arcs = d3.pie().padAngle(padAngle).sort(null).value(i => values[i])(I);
        const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
        const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);
        
    const svg = d3.select(this.ref)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic; display: block; margin: auto;");
  
    svg.append("g")
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-linejoin", strokeLinejoin)
      .selectAll("path")
      .data(arcs)
      .join("path")
        .attr("fill", d => color(names[d.data]))
        .attr("d", arc)
      .append("title")
        .text(d => title(d.data));
  
    svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
      .selectAll("text")
      .data(arcs)
      .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
      .selectAll("tspan")
      .data(d => {
        const lines = `${title(d.data)}`.split(/\n/);
        return (d.endAngle - d.startAngle) > 0.25 ? lines : lines.slice(0, 1);
      })
      .join("tspan")
        .attr("x", 0)
        .attr("y", (_, i) => `${i * 1.1}em`)
        .attr("font-weight", (_, i) => i ? null : "bold")
        .text(d => d);
  
        return Object.assign(svg.node(), {scales: {color}});
    }

      componentDidMount() {
          // activate   
        this.PieChart();
      }
        render() {
            return (<div className="svg">
            <svg className="container" ref={(ref: SVGSVGElement) => this.ref = ref}></svg>
            </div>);
  }

}
