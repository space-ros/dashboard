// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { observer } from 'mobx-react';
import * as React from 'react';
import { PureComponent, ReactNode } from 'react';
import { Result } from 'sarif';
import { renderMessageTextWithEmbeddedLinks } from './widgets';
import { ResultTableStore } from './resultTableStore';
import { IndexStore } from './indexStore';
import * as d3 from 'd3';
import { Row, RowGroup } from './tableStore';

interface BurnDownChartProps<G> {
    baselineStores: [IndexStore];
    store: ResultTableStore<G>;
}
@observer export class BurnDownChart<G> extends PureComponent<BurnDownChartProps<G>> {
    private ref!: SVGSVGElement;
    private pointsPerFrotnight : number = 20;
    private pointsPerIssue : number = 2;
    
    private LineChart = () => {
      const { store, baselineStores } = this.props;
      const {rows} = store;
      const currentIssuesCount = rows.reduce((accumulator, row) => {
        return accumulator + row.items.length;
      }, 0);
      const baselineIssuesCount : Array<number> = new Array<number>();
      baselineStores.forEach(store => {
        baselineIssuesCount.push(store.resultTableStoreByRule.rows.reduce((accumulator, row) => {
            return accumulator + row.items.length;
          }, 0));
      });
      const issues = baselineIssuesCount.concat(currentIssuesCount);

      const curve = d3.curveLinear; // method of interpolation between points
      const marginTop = 40; // top margin, in pixels
      const marginRight = 30; // right margin, in pixels
      const marginBottom = 30; // bottom margin, in pixels
      const marginLeft = 40; // left margin, in pixels
      const width = 700; // outer width, in pixels
      const height = 500; // outer height, in pixels
      const xType = d3.scaleUtc; // type of x-scale
      const xRange = [marginLeft, width - marginRight]; // [left, right]
      const yType = d3.scaleLinear; // type of y-scale
      const yRange = [height - marginBottom, marginTop]; // [bottom, top]
      const yLabel = "Sum of Tasks Estimates (days)"; // a label for the y-axis
      const strokeLinecap= "round"; // stroke line cap of line
      const strokeLinejoin = "round"; // stroke line join of line
      const strokeWidth = 1.5; // stroke width of line
      const strokeOpacity = 1; // stroke opacity of line

      // Timeline
      let X: number[] = [1, 15, 30, 45, 60, 75, 90];

      // Issues per build
      const pointsPerBuild : number[] = issues.map(a => a*this.pointsPerIssue);
      let idealY : number[] = issues.map(a => a-this.pointsPerFrotnight);
      let Y = pointsPerBuild;
      // let Y: number[] = d3.map(rows, d => d.items.length);
      // Y is Sum of Tasks Estimates
      // X is Timeline

      const I = d3.range(X.length);
      const defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
      const D = d3.map(rows, defined);

      // Compute default domains.
      const xDomain = d3.extent(X);
      const yDomain = [0, d3.max(Y)];

      // Construct scales and axes.
      const xScale = xType(xDomain, xRange);
      const yScale = yType(yDomain, yRange);
      const xAxis = d3.axisBottom(xScale).ticks(width / 40).tickSizeOuter(0);
      const yAxis = d3.axisLeft(yScale).ticks(height / 40);

      // Construct a line generator.
      const line = d3.line()
          .defined(i => D[i])
          .curve(curve)
          .x(i => xScale(X[i]))
          .y(i => yScale(Y[i]));

        const line2 = d3.line()
          .defined(i => D[i])
          .curve(curve)
          .x(i => xScale(X[i]))
          .y(i => yScale(idealY[i]));

      const svg = d3.select(this.ref)
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [0, 0, width, height])
          .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

      svg.append("g")
          .attr("transform", `translate(0,${height - marginBottom})`)
          .call(xAxis);

      svg.append("g")
          .attr("transform", `translate(${marginLeft},0)`)
          .call(yAxis)
          .call(g => g.select(".domain").remove())
          .call(g => g.selectAll(".tick line").clone()
              .attr("x2", width - marginLeft - marginRight)
              .attr("stroke-opacity", 0.1))
          .call(g => g.append("text")
              .attr("x", -marginLeft)
              .attr("y", 10)
              .attr("fill", "currentColor")
              .attr("text-anchor", "start")
              .text(yLabel));

      svg.append("path")
          .attr("fill", "none")
          .attr("stroke", "red")
          .attr("stroke-width", strokeWidth)
          .attr("stroke-linecap", strokeLinecap)
          .attr("stroke-linejoin", strokeLinejoin)
          .attr("stroke-opacity", strokeOpacity)
          .attr("d", line(I));
          
          svg.append("path")
          .attr("fill", "none")
          .attr("stroke-width", strokeWidth)
          .attr("stroke-linecap", strokeLinecap)
          .attr("stroke-linejoin", strokeLinejoin)
          .attr("stroke-opacity", strokeOpacity)
          .attr("stroke", "green")
          .attr("d", line2(I));

          // Handmade legend
          svg.append("circle").attr("cx", 630).attr("cy",130).attr("r", 6).style("fill", "green")
          svg.append("circle").attr("cx", 630).attr("cy",160).attr("r", 6).style("fill", "red")
          svg.append("text").attr("x", 620).attr("y", 130).text("Ideal Issues remaining").style("font-size", "15px").attr("alignment-baseline","middle")
          svg.append("text").attr("x", 620).attr("y", 160).text("Actual Issues remaining").style("font-size", "15px").attr("alignment-baseline","middle")

          svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height - 6)
            .text("Time (days)");

            svg.append("text")
              .attr("class", "y label")
              .attr("text-anchor", "end")
              .attr("y", 6)
              .attr("dy", ".75em")
              .attr("transform", "rotate(-90)")
              .text("Issues");

        return Object.assign(svg.node(), {value: null});
      }
    
      componentDidMount() {
          // activate   
        this.LineChart();
      }
      render() {
          return (<div className="svg">
          <svg className="container" ref={(ref: SVGSVGElement) => this.ref = ref}></svg>
          </div>);
      }

}
