import { observer } from 'mobx-react';
import * as React from 'react';
import { PureComponent } from 'react';
import * as d3 from 'd3';
import { BuildSummary } from 'sarif';
import { observable } from 'mobx';
import { TextField } from '@mui/material';

@observer export class BurndownChart extends PureComponent {
    private ref!: SVGSVGElement;
    @observable issuesPerDay = 2;
    @observable pointsPerIssue_ = {step : 2};
    @observable buildSummaries = [] as BuildSummary[];

    private onMessage = async (event: MessageEvent) => {
        if (!event.data) return; // Ignore mysterious empty message
        if (event.data.command === 'buildSummary'){
            this.buildSummaries.push(event.data.buildSummery);
        }
        d3.selectAll('g').remove();
        d3.selectAll('path').remove();
        d3.selectAll('text').remove();
        d3.selectAll('points').remove();
        d3.selectAll('circle').remove();
        this.lineChart(this.issuesPerDay);
    }

    private lineChart = (issuesPerDay: number) => {
        // const defined, // for gaps in data
        const marginTop = 40; // top margin, in pixels
        const marginRight = 30; // right margin, in pixels
        const marginBottom = 30; // bottom margin, in pixels
        const marginLeft = 40; // left margin, in pixels
        const width = 1284; // outer width, in pixels
        const height = 500; // outer height, in pixels
        const xType = d3.scaleUtc; // type of x-scale
        const xRange = [marginLeft, width - marginRight]; // [left, right]
        const yType = d3.scaleLinear; // type of y-scale
        const yRange = [height - marginBottom, marginTop]; // [bottom, top]
        // const yFormat, // a format specifier string for the y-axis
        const yLabel = 'Issues'; // a label for the y-axis
        // zDomain, // array of z-values

        // sort this.buildSummaries by date here
        const X = this.buildSummaries.map(build => build.date).flat();
        const issuesPerBuild = this.buildSummaries.map(build => build.issues).flat();
        const Y = issuesPerBuild;

        // Issues per build
        const idealY : number[] = issuesPerBuild.map((a, index) => a-issuesPerDay*index);

        for (let index = 0; index < issuesPerBuild.length; index++) {
            const daysDiff = Math.ceil(Math.abs(X[0] - X[index])/(1000 * 60 * 60 * 24));
            const expectedValue = issuesPerBuild[index] - (daysDiff*issuesPerDay);
            idealY[index] = expectedValue;
        }

        // Compute default domains.
        const xDomain = d3.extent(X);
        const yDomain = [0, d3.max(Y)];

        // Construct scales and axes.
        const xScale = xType(xDomain, xRange);
        const yScale = yType(yDomain, yRange);
        const xAxis = d3.axisBottom(xScale).ticks(15);
        const yAxis = d3.axisLeft(yScale).ticks(10);

        const dataset = [] as Array<[number, number]>;
        for (let index = 0; index < X.length; index++) {
            dataset.push([X[index], Y[index]]);
        }
        const idealDataset = [] as Array<[number, number]>;
        for (let index = 0; index < X.length; index++) {
            idealDataset.push([X[index], idealY[index]]);
        }
        dataset.sort(function(a, b){
            return a[0] - b[0];
        });
        idealDataset.sort(function(a, b){
            return a[0] - b[0];
        });

        const svg = d3.select(this.ref)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

        svg.append('g')
            .attr('transform', `translate(0,${height - marginBottom})`)
            .call(xAxis);

        svg.append('g')
            .attr('transform', `translate(${marginLeft},0)`)
            .call(yAxis)
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line').clone()
                .attr('x2', width - marginLeft - marginRight)
                .attr('stroke-opacity', 0.1))
            .call(g => g.append('text')
                .attr('x', -marginLeft)
                .attr('y', 10)
                .attr('fill', 'currentColor')
                .attr('text-anchor', 'start')
                .text(yLabel));

        svg.append('path')
            .datum(dataset)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2.5)
            .attr('d', d3.line()
                .x(d => xScale(d[0]))
                .y(d => yScale(d[1]))
            );

        svg.append('path')
            .datum(idealDataset)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2.5)
            .attr('d', d3.line()
                .x(d => xScale(d[0]))
                .y(d => yScale(d[1]))
            );

        svg.selectAll('names')
            .data(dataset)
            .enter()
            .append('text')
            .attr('text-anchor', 'end')
            .attr('font-weight', 500)
            .attr('x', function(d) {return xScale(d[0]);})
            .attr('y', function(d) {return yScale(d[1]);})
            .text(function(d) {return 'build #'+ dataset.indexOf(d);});

        svg.selectAll('names')
            .data(idealDataset)
            .enter()
            .append('text')
            .attr('text-anchor', 'end')
            .attr('font-weight', 500)
            .attr('x', function(d) {return xScale(d[0]);})
            .attr('y', function(d) {return yScale(d[1]);})
            .text(function(d) {return 'build #'+ idealDataset.indexOf(d);});

        svg.selectAll('points')
            .data(dataset)
            .enter()
            .append('circle')
            .attr('fill', 'red')
            .attr('stroke', 'none')
            .attr('cx', function(d) {return xScale(d[0]);})
            .attr('cy', function(d) {return yScale(d[1]);})
            .attr('r', 3);

        svg.selectAll('points')
            .data(idealDataset)
            .enter()
            .append('circle')
            .attr('fill', 'green')
            .attr('stroke', 'none')
            .attr('cx', function(d) {return xScale(d[0]);})
            .attr('cy', function(d) {return yScale(d[1]);})
            .attr('r', 3);

        // Handmade legend
        svg.append('circle').attr('cx', width-140).attr('cy',50).attr('r', 5).style('fill', 'green');
        svg.append('circle').attr('cx', width-140).attr('cy',30).attr('r', 5).style('fill', 'red');
        svg.append('text').attr('x', width-120).attr('y', 50).text('Ideal Issues').style('font-size', '14px').attr('font-weight', 500).attr('alignment-baseline','middle');
        svg.append('text').attr('x', width-120).attr('y', 30).text('Actual Issues').style('font-size', '14px').attr('font-weight', 500).attr('alignment-baseline','middle');

        svg.append('text')
            .attr('class', 'x label')
            .attr('text-anchor', 'end')
            .attr('x', width)
            .attr('y', height - 6)
            .text('Time (days)');

        return Object.assign(svg.node(), {value: null});
    }

    render() {
        return (<div className="svg">
            <svg className="container" ref={(ref: SVGSVGElement) => this.ref = ref}></svg>
            <TextField
                label='Excpected burndown per day'
                value={this.issuesPerDay}
                onChange={(e) => {
                    d3.selectAll('g').remove();
                    d3.selectAll('path').remove();
                    d3.selectAll('text').remove();
                    d3.selectAll('points').remove();
                    d3.selectAll('circle').remove();
                    this.issuesPerDay = Number(e.target.value);
                    this.lineChart(Number(e.target.value));
                }}></TextField>
        </div>);
    }

    componentDidMount() {
        vscode.postMessage({ command: 'burndown' });
        addEventListener('message', this.onMessage);
    }
    componentWillUnmount() {
        removeEventListener('message', this.onMessage);
    }
}