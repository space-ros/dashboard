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
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import { Log, PhysicalLocation, Result } from 'sarif';
import { RowItem } from './tableStore';
import { Details } from './details';
import { ResultTableStore } from './resultTableStore';
import { List, ListItem, ListSubheader } from '@mui/material';

interface DropMenuProps {
    builds: Array<string>;
}

@observer export class DropMenu extends Component<DropMenuProps> {
    private leftBuild = observable.box('')
    private rightBuild = observable.box('')
    private selectedRightResult = observable.box()
    private selectedLeftResult = observable.box()
    private leftDetailsPaneHeight = observable.box(300)
    private rightDetailsPaneHeight = observable.box(300)

    @observable rules : string[] = []
    @action
    appendRules(val: string){
        this.rules.push(val);
    }

    @observable rResults : Result[] = []
    @action
    appendRightResults(val: Result){
        this.rResults.push(val);
    }

    @observable lResults : Result[] = []
    @action
    appendLeftResults(val: Result){
        this.lResults.push(val);
    }
    @action
    emptyResults(){
        this.lResults = [];
        this.rResults = [];
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
        // console.log('recived msg', event.data);
        // if (event.data.command === 'removed'){
        //     for (const {uri, uriUpgraded, webviewUri} of event.data.added) {
        //         const response = await fetch(webviewUri);
        //         const log = await response.json() as Log;
        //         log._uri = uri;
        //         log._uriUpgraded = uriUpgraded;
        //         this.appendLLogs(log);
        //         // console.log(log);
        //         for(const r of log.runs){
        //             if(r.results){
        //                 // console.log(r.results[0]);
        //                 for(const result of r.results){
        //                     // TODO uncomment to show locations
        //                     // locations depends on the runs object which we lost for results displayed here
        //                     result.locations = undefined;
        //                     this.appendLeftResults(result as LogResult);
        //                 }
        //             }
        //         }
        //     }
        // }
        // if (event.data.command === 'added'){
        //     for (const {uri, uriUpgraded, webviewUri} of event.data.added) {
        //         const response = await fetch(webviewUri);
        //         const log = await response.json() as Log;
        //         log._uri = uri;
        //         log._uriUpgraded = uriUpgraded;
        //         this.appendRLogs(log);
        //         // console.log(log);
        //         for(const r of log.runs){
        //             if(r.results){
        //                 // console.log(r.results[0]);
        //                 for(const result of r.results){
        //                     // TODO uncomment to show locations
        //                     // locations depends on the runs object which we lost for results displayed here
        //                     result.locations = undefined;
        //                     this.appendRightResults(result as LogResult);
        //                 }
        //             }
        //         }
        //     }
        // }
        if (event.data.command === 'rawresults'){
            for (const r of event.data.left) {
                this.appendLeftResults(r as LogResult);
            }
            for (const r of event.data.right) {
                this.appendRightResults(r as LogResult);
            }
        }
    }

    // private resultTableStore = new ResultTableStore('File', result => result._relativeUri, this.lResults, , this.selection)

    render() {
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
                this.emptyResults();
                this.selectedLeftResult.set(undefined);
                this.selectedRightResult.set(undefined);
            }
        };

        const { builds } = this.props;
        return(
            <>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        '& > :not(style)': {
                            m: 1,
                            width: '100%',
                            maxHeight: 60,
                        },
                        marginBottom: 5,
                    }}
                >
                    <>
                        <div>
                            Past Builds
                        </div>
                        <MenuList
                            id="right-menu"
                            aria-labelledby="long-button"
                            sx={{overflow: 'auto',
                                maxHeight: 300}}
                        >
                            {builds.map((build) => (
                                <MenuItem data-my-value={build} selected={build === this.rightBuild.get()} onClick={handleClickRight}>
                                    <Typography variant="inherit" noWrap>
                                        {build.substring(build.lastIndexOf('/')+1)}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </MenuList>
                    </>
                    <>
                        <Button sx={{maxHeight: '30px', minHeight: '16px'}} variant={'contained'} onClick={handleCompare} size={'small'} disabled={this.rightBuild.get().length<1}>
                        compare to latest
                        </Button>
                    </>
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
                        <div>
                            <Typography variant="inherit" sx={{marginBottom: 5}} color={'green'} noWrap>
                                Solved issues
                            </Typography>
                        </div>
                        <MenuList
                            id="left-menu"
                            aria-labelledby="long-button"
                            sx={{overflow: 'auto',
                                maxHeight: 300}}
                        >
                            {this.lResults.map((result) => (
                                <MenuItem data-my-value={result} onClick={() => this.selectedLeftResult.set(result)}>
                                    <Typography variant="caption">
                                        {result.ruleId}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </MenuList>

                        <div className="svResizer">
                            <ResizeHandle size={this.leftDetailsPaneHeight} />
                        </div>
                        <Details result={this.selectedLeftResult.get()} height={this.leftDetailsPaneHeight} />
                    </div>
                    <div className="svListPane">
                        <div>
                            <Typography variant="inherit" sx={{marginBottom: 5}} color={'red'} noWrap>
                                New issues
                            </Typography>
                        </div>
                        <MenuList
                            id="right-menu"
                            aria-labelledby="long-button"
                            sx={{overflow: 'auto',
                                maxHeight: 300}}
                        >
                            {this.rResults.map((result) => (
                                <MenuItem data-my-vue={result} onClick={() => this.selectedRightResult.set(result)}>
                                    <Typography variant="caption">
                                        {result.ruleId}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </MenuList>

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
        addEventListener('message', this.onMessageLog);
    }

    componentWillUnmount() {
        removeEventListener('message', this.onMessageLog);
    }
}
