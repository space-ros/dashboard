import { observer } from 'mobx-react';
import * as React from 'react';
import { PureComponent } from 'react';
import { ResultTableStore } from './resultTableStore';
import * as d3 from 'd3';
import { BuildSummary } from 'sarif';
import { observable } from 'mobx';

interface BurndownChartProps<G> {
    store: ResultTableStore<G>;
}
@observer export class BurndownChart<G> extends PureComponent<BurndownChartProps<G>> {
    private ref!: SVGSVGElement;
    private pointsPerFrotnight  = 20;
    private pointsPerIssue  = 2;
    @observable buildSummaries = [] as BuildSummary[];

    private onMessage = async (event: MessageEvent) => {
        if (!event.data) return; // Ignore mysterious empty message
        if (event.data.command === 'buildSummary'){
            this.buildSummaries.push(event.data.buildSummery);
            console.log('recived a new build summary', event.data.buildSummery);
        }
        d3.selectAll('g').remove();
        d3.selectAll('path').remove();
        d3.selectAll('text').remove();
        this.lineChart();
    }

    private lineChart = () => {
        const { store } = this.props;
        const {rows} = store;
        const title  = 'Three Months Burn Down'; // given d in data, returns the title text
        const curve = d3.curveLinear; // method of interpolation between points
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
        const yLabel = 'Sum of Tasks Estimates (days)'; // a label for the y-axis
        // zDomain, // array of z-values
        const strokeLinecap= 'round'; // stroke line cap of line
        const strokeLinejoin = 'round'; // stroke line join of line
        const strokeWidth = 1.5; // stroke width of line
        const strokeOpacity = 1; // stroke opacity of line
        const mixBlendMode = 'multiply'; // blend mode of lines
        const voronoi = false; // show a Voronoi overlay? (for debugging)


        // Timeline
        // const X: number[] = [1, 15, 30, 45, 60, 75, 90];

        // sort this.buildSummaries by date here
        const X = this.buildSummaries.map(build => build.date).flat();
        const issuesPerBuild = this.buildSummaries.map(build => build.issues).flat();
        // const issuesPerBuild : number[] = [90, 80, 59, 55, 42, 23, 8];

        // Issues per build
        const pointsPerBuild : number[] = issuesPerBuild.map(a => a*this.pointsPerIssue);
        const idealY : number[] = issuesPerBuild.map(a => a-this.pointsPerFrotnight);
        const Y = pointsPerBuild;
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
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', strokeWidth)
            .attr('stroke-linecap', strokeLinecap)
            .attr('stroke-linejoin', strokeLinejoin)
            .attr('stroke-opacity', strokeOpacity)
            .attr('d', line(I));

        svg.append('path')
            .attr('fill', 'none')
            .attr('stroke-width', strokeWidth)
            .attr('stroke-linecap', strokeLinecap)
            .attr('stroke-linejoin', strokeLinejoin)
            .attr('stroke-opacity', strokeOpacity)
            .attr('stroke', 'green')
            .attr('d', line2(I));

        // svg.selectAll('myCircles')
        //     .data([X, Y])
        //     .enter()
        //     .append('circle')
        //     .attr('fill', 'red')
        //     .attr('stroke', 'none')
        //     .attr('cx', function(d) {return xScale(d[0]);})
        //     .attr('cy', function(d) {return yScale(d[1]);})
        //     .attr('r', 3);

        // Handmade legend
        svg.append('circle').attr('cx', 630).attr('cy',130).attr('r', 6).style('fill', 'green');
        svg.append('circle').attr('cx', 630).attr('cy',160).attr('r', 6).style('fill', 'red');
        svg.append('text').attr('x', 620).attr('y', 130).text('Ideal Issues remaining').style('font-size', '15px').attr('alignment-baseline','middle');
        svg.append('text').attr('x', 620).attr('y', 160).text('Actual Issues remaining').style('font-size', '15px').attr('alignment-baseline','middle');

        svg.append('text')
            .attr('class', 'x label')
            .attr('text-anchor', 'end')
            .attr('x', width)
            .attr('y', height - 6)
            .text('Time (days)');

        svg.append('text')
            .attr('class', 'y label')
            .attr('text-anchor', 'end')
            .attr('y', 6)
            .attr('dy', '.75em')
            .attr('transform', 'rotate(-90)')
            .text('Issues');

        return Object.assign(svg.node(), {value: null});
    }

    render() {
        return (<div className="svg">
            <svg className="container" ref={(ref: SVGSVGElement) => this.ref = ref}></svg>
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