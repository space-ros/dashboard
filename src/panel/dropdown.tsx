import * as React from 'react';
import { IObservableValue, observable, action } from 'mobx';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { IndexStore } from './indexStore';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import ContentCut from '@mui/icons-material/ContentCut';
import { ResultTable } from './resultTable';
import { Checkrow, Icon, Popover, renderMessageTextWithEmbeddedLinks, ResizeHandle, Tab, TabPanel } from './widgets';
import { decodeFileUri } from '../shared';
import { ReportingDescriptor, Run, Result as LogResult } from 'sarif';
import { IndexStoreRemoved } from './indexStoreRemoved';
import { IndexStoreRemovedd } from './indexStoreRemovedd';
import { IndexStoreAdded } from './indexStoreAdded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import { Log, PhysicalLocation, Result } from 'sarif';
import { RowItem } from './tableStore';
import { Details } from './details';
import { SimpleStore } from './simpleStore';
import { ResultTableStore } from './resultTableStore';
import { List, ListItem, ListSubheader } from '@mui/material';

interface DropMenuProps {
    builds: Array<string>;
    compareStoreRemoved : IndexStoreRemoved;
    compareStoreAdded : IndexStoreAdded;
}

@observer export class DropMenu extends Component<DropMenuProps> {
    private leftBuild = observable.box('')
    private rightBuild = observable.box('')
    private selectedRightResult = observable.box()
    private leftDetailsPaneHeight = observable.box(300)
    private rightDetailsPaneHeight = observable.box(300)

    @observable rules : string[] = []
    @action
    appendRules(val: string){
        this.rules.push(val);
    }

    @observable rawResults : Result[] = []
    @action
    appendrawResults(val: Result){
        this.rawResults.push(val);
    }

    @observable lResults : Result[] = []
    @action
    appendLResult(val: Result){
        this.lResults.push(val);
    }

    @observable rlogs : Log[] = []
    @action
    appendRLogs(val: Log){
        this.rlogs.push(val);
    }
    @observable llogs : Log[] = []
    @action
    appendLLogs(val: Log){
        this.llogs.push(val);
    }

    @observable rlogsIndices : number[] = []
    @action
    appendRLogsIndices(val: number){
        this.rlogsIndices.push(val);
    }
    @observable llogsIndices : number[] = []
    @action
    appendLLogsIndices(val: number){
        this.llogsIndices.push(val);
    }

    private rightLogs = observable.box()
    private leftLogs = observable.box()
    @observable rlogsobs = [] as Log[];

    private renderCell = (result: Result) => {
        const customRenderers = {
            'File':     result => <span title={result._uri}>{result._uri?.file ?? '—'}</span>,
            'Line':     result => <span>{result._region?.startLine ?? '—'}</span>,
            'Message':  result => <span>{renderMessageTextWithEmbeddedLinks(result._message, result, vscode.postMessage)}</span>,
            'Rule':     result => <>
                <span>{result._rule?.name ?? '—'}</span>
                <span className="svSecondary">{result.ruleId}</span>
            </>,
        } as Record<string, (result: Result) => React.ReactNode>;

        const renderer = customRenderers['File'];
        return renderer(result);
    }

    private onMessageLog = async (event: MessageEvent) => {
        if (!event.data) return; // Ignore mysterious empty message
        console.log('recived msg', event.data);
        if (event.data.command === 'removed'){
            for (const {uri, uriUpgraded, webviewUri} of event.data.added) {
                const response = await fetch(webviewUri);
                const log = await response.json() as Log;
                log._uri = uri;
                log._uriUpgraded = uriUpgraded;
                this.appendLLogs(log);
                for(const r of log.runs){
                    if(r.results){
                        for(const result of r.results){
                            this.appendLResult(result);
                        }
                    }
                }
                // this.rightLogs.set(this.rightLogs.get().concat(log));
            }
        }
        if (event.data.command === 'added'){
            for (const {uri, uriUpgraded, webviewUri} of event.data.added) {
                const response = await fetch(webviewUri);
                const log = await response.json() as Log;
                log._uri = uri;
                log._uriUpgraded = uriUpgraded;
                this.appendRLogs(log);
                // this.leftLogs.set(this.leftLogs.get().concat(log));
            }
            this.rightLogs.set(this.rlogsobs);
        }
        let count = 0;
        for (let index = 0; index < this.rlogsobs.length; index++) {
            if(this.rlogsobs[index].runs[0].results){
                for(const result of this.rlogsobs[index].runs[0].results)
                {
                    this.appendLResult(result);
                    if(result.ruleId){
                        console.log(count);
                        count = count +1;
                        this.appendRules(result.ruleId);
                        // this.rules.set(this.rules.get().concat(result.message.text));
                    }
                }
            }

        }
        if (event.data.command === 'results'){
            for (const {uri, uriUpgraded, webviewUri} of event.data.left) {
                const response = await fetch(webviewUri);
                const log = await response.json() as Log;
                log._uri = uri;
                log._uriUpgraded = uriUpgraded;
                this.appendLLogs(log);
                for(const r of log.runs){
                    if(r.results){
                        for(const result of r.results){
                            this.appendLResult(result);
                        }
                    }
                }
            }
            for (const {uri, uriUpgraded, webviewUri} of event.data.right) {
                const response = await fetch(webviewUri);
                const log = await response.json() as Log;
                log._uri = uri;
                log._uriUpgraded = uriUpgraded;
                this.appendRLogs(log);
            }
            for(const index of event.data.lindices){
                this.appendLLogsIndices(index);
            }
            for(const index of event.data.rindices){
                this.appendRLogsIndices(index);
            }
        }
        if (event.data.command === 'rawresults'){
            for (const r of event.data.left) {
                this.appendrawResults(r as LogResult);
            }
        }
    }

    // private resultTableStore = new ResultTableStore('File', result => result._relativeUri, this.lResults, , this.selection)

    render() {
        const handleRightResultClickLeft = (event: React.MouseEvent<HTMLElement>) => {
            const { myValue } = event.currentTarget.dataset;
            rightResult = myValue;
            if(myValue){
                this.selectedRightResult.set(myValue);
            }
        };
        const handleClickLeft = (event: React.MouseEvent<HTMLElement>) => {
            const { myValue } = event.currentTarget.dataset;
            if (myValue){
                this.leftBuild.set(myValue);
            }
        };
        const handleClickRight = (event: React.MouseEvent<HTMLElement>) => {
            const { myValue } = event.currentTarget.dataset;
            if(myValue){
                this.rightBuild.set(myValue);
            }
        };

        const handleCompare = (event: React.MouseEvent<HTMLElement>) => {
            if(this.rightBuild.get().length>0){
                vscode.postMessage({ command: 'compare', build: this.rightBuild.get() });
            }
        };

        let rightResult = undefined;

        const selectedRowLeft = this.props.compareStoreRemoved.selection.get();
        const selectedLeft = selectedRowLeft instanceof RowItem && selectedRowLeft.item;
        const selectedRowRight = this.props.compareStoreAdded.selection.get();
        const selectedRight = selectedRowRight instanceof RowItem && selectedRowRight.item;

        const { builds, compareStoreAdded, compareStoreRemoved } = this.props;
        return(
            <>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        '& > :not(style)': {
                            m: 1,
                            width: 300,
                            height: 128,
                        },
                    }}
                >
                    {/* <MenuList
                        id="left-menu"
                        aria-labelledby="long-button"
                    >
                        {builds.map((build) => (
                            <MenuItem data-my-value={build} selected={build === this.leftBuild.get()} onClick={handleClickLeft}>
                                <Typography variant="inherit" noWrap>
                                    {build.substring(build.lastIndexOf('/'))}
                                </Typography>
                            </MenuItem>
                        ))}
                    </MenuList> */}
                    <MenuList
                        id="right-menu"
                        aria-labelledby="long-button"
                        sx={{overflow: 'auto',
                            maxHeight: 300}}
                    >
                        {builds.map((build) => (
                            <MenuItem data-my-value={build} selected={build === this.rightBuild.get()} onClick={handleClickRight}>
                                <Typography variant="inherit" noWrap>
                                    {build.substring(build.lastIndexOf('/'))}
                                </Typography>
                            </MenuItem>
                        ))}
                    </MenuList>
                    <Button variant={'contained'} onClick={handleCompare} size={'small'} disabled={this.rightBuild.get().length<1}>
                        View diff
                    </Button>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        '& > :not(style)': {
                            m: 1,
                            width: 300,
                            height: 600,
                        },
                    }}
                >
                    <div className="svListPane" >
                        <List
                            sx={{
                                width: '100%',
                                maxWidth: 360,
                                bgcolor: 'background.paper',
                                position: 'relative',
                                overflow: 'auto',
                                maxHeight: 300,
                                '& ul': { padding: 0 },
                            }}
                            subheader={<li />}
                        >
                            {this.rlogsIndices.map((sectionId) => (
                                <li key={`section-${this.rlogs[sectionId]._uri}`} onClick={()=>{}}>
                                    <ListItem key={`item-${sectionId}`}>{`${sectionId}${this.rlogs[sectionId]._uri}`}</ListItem>
                                </li>
                            ))}
                        </List>
                        <div className="svResizer">
                            <ResizeHandle size={this.leftDetailsPaneHeight} />
                        </div>
                        <Details result={selectedLeft} height={this.leftDetailsPaneHeight} />
                    </div>
                    <div className="svListPane">

                        {/* {this.llogsIndices.map((sectionId) => (
                                this.llogs[sectionId].runs[0].results.map((result) => {
                                    <li>
                                        <ListItem onClick={handleRightResultClickLeft} key={`item-${sectionId}`}>{`${sectionId}${this.llogs[sectionId].runs[0].results[0].ruleId}`}</ListItem>
                                        <li key={`section_-${this.llogs[sectionId]._uri}`}>
                                            <ListItem>{result.ruleId}</ListItem>
                                        </li>;
                                        <li key={`section-${this.llogs[sectionId]._uri}`}>
                                            {this.renderCell(result)}
                                        </li>;
                                    </li>;
                                })
                            ))} */}
                        {/* {this.llogsIndices.map((sectionId) => (
                                <li key={`section-${this.llogs[sectionId]._uri}`}>
                                    <ListItem onClick={handleRightResultClickLeft} key={`item-${sectionId}`}>{`${sectionId}${this.llogs[sectionId].runs[0].results[0].ruleId}`}</ListItem>
                                </li>
                            ))} */}
                        {/* {this.lResults.map((result, i) => (
                                <li key={`section-${result.ruleId}`}>
                                    <ListItem onClick={handleRightResultClickLeft} key={`item-${result.ruleId}`}>{`${i}: ${result.ruleId}`}</ListItem>
                                </li>
                            ))} */}
                        <MenuList
                            id="right-menu"
                            aria-labelledby="long-button"
                            sx={{overflow: 'auto',
                                maxHeight: 300}}
                        >
                            {this.rawResults.map((result) => (
                                <MenuItem data-my-value={result} onClick={() => this.selectedRightResult.set(result)}>
                                    <Typography variant="inherit" noWrap>
                                        {result.ruleId}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </MenuList>


                        {/* <ol>

                                <input type="checkbox" checked={this.siwtch.get()}>
                                </input>
                                <span>empty logs</span>
                                {this.rightLogs.get() ? (
                                    this.rightLogs.get().map((log, i) => {
                                        <span>not empty logs</span>;
                                        <span>{log.runs[0].results[0].ruleId}</span>;
                                        const runs = log.runs;
                                        {
                                            runs.map((run, ii) => {
                                                const results = run.results;
                                                {results ? (results.map((result, i) => {
                                                    <span title={result._uri}>'File':  {result._uri?.file ?? '—'}</span>;
                                                    <span>'Line':  {result._region?.startLine ?? '—'}</span>;
                                                })
                                                ):(null);}
                                            });
                                        }
                                    })

                                ): (null)
                                }
                                {
                                    this.llogsIndices.map((index) => <li>{this.llogs[index]._uri}</li>)
                                }
                            </ol> */}
                        {/* {this.rightLogs.get().length > 0 ? (
                                <div className="svLogsPane">
                                    {this.rightLogs.get().map((log, i) => {
                                        const {pathname} = new URL(log.uri);
                                        return <div key={i} className="svListItem">
                                            <div>{pathname.file}</div>
                                            <div className="ellipsis svSecondary">{decodeFileUri(log.uri)}</div>
                                            <Icon name="close" title="Close Log"
                                                onClick={() => vscode.postMessage({ command: 'closeLog', uri: log.uri })} />
                                        </div>;
                                    })}
                                </div>
                            ):(null)
                            } */}
                        <div className="svResizer">
                            <ResizeHandle size={this.rightDetailsPaneHeight} />
                        </div>
                        <Details result={this.selectedRightResult.get()} height={this.rightDetailsPaneHeight} />
                    </div>
                </Box>

            </>
        );
    }
    componentDidMount() {
        addEventListener('message', this.props.compareStoreRemoved.onMessage);
        addEventListener('message', this.props.compareStoreAdded.onMessage);
        addEventListener('message', this.onMessageLog);
    }

    componentWillUnmount() {
        removeEventListener('message', this.props.compareStoreRemoved.onMessage);
        removeEventListener('message', this.props.compareStoreAdded.onMessage);
        removeEventListener('message', this.onMessageLog);
    }
}
