// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Component, Fragment } from 'react';
import { ReportingDescriptor, Result } from 'sarif';
import 'vscode-codicons/dist/codicon.css';
import '../shared/extension';
import { Details } from './details';
import { FilterKeywordContext } from './filterKeywordContext';
import './index.scss';
import { IndexStore } from './indexStore';
import { ResultTable } from './resultTable';
import { RowItem } from './tableStore';
import { Checkrow, Icon, Popover, ResizeHandle, Tab, TabPanel } from './widgets';
import { decodeFileUri } from '../shared';
import { Chart } from './chart';
import { FormDialog } from './dialog';
import { BurndownChart } from './burndownChart';
export { React };
export * as ReactDOM from 'react-dom';
export { IndexStore as Store } from './indexStore';
export { DetailsLayouts } from './details.layouts';
import { DropMenu } from './dropdown';

@observer export class Index extends Component<{ store: IndexStore, builds: Array<string> }> {
    private showFilterPopup = observable.box(false)
    private detailsPaneHeight = observable.box(300)
    private chartsMode = observable.box(false)

    render() {
        const {store, builds} = this.props;

        if (!store.logs.length) {
            return <div className="svZeroData">
                <div onClick={() => vscode.postMessage({ command: 'open' })}>
                    Open SARIF log
                </div>
                <div onClick={() => vscode.postMessage({ command: 'openArchive' })}>
                    Open SARIF logs archive
                </div>
            </div>;
        }

        const {logs, keywords, annotations} = store;
        const {showFilterPopup, detailsPaneHeight, chartsMode} = this;
        const activeTableStore = store.selectedTab.get().store;
        const allCollapsed = activeTableStore?.groupsFilteredSorted.every(group => !group.expanded) ?? false;
        const selectedRow = store.selection.get();
        const selected = selectedRow instanceof RowItem && selectedRow.item;
        return <FilterKeywordContext.Provider value={keywords ?? ''}>
            <div className="svListPane">
                <TabPanel selection={store.selectedTab}
                    extras={<>
                        <div className="flexFill"></div>
                        <div className="svFilterCombo">
                            <input type="text" placeholder="Filter results" value={store.keywords}
                                onChange={e => store.keywords = e.target.value}
                                onKeyDown={e => { if (e.key === 'Escape') { store.keywords = ''; } } }/>
                            <Icon name="filter" title="Filter Options" onMouseDown={e => e.stopPropagation()} onClick={() => showFilterPopup.set(!showFilterPopup.get())} />
                        </div>
                        <Icon name={allCollapsed ? 'expand-all' : 'collapse-all'}
                            title={allCollapsed ? 'Expand All' : 'Collapse All'}
                            visible={!!activeTableStore}
                            onClick={() => activeTableStore?.groupsFilteredSorted.forEach(group => group.expanded = allCollapsed) } />
                        <Icon name="close-all"
                            title="Close All Logs"
                            visible={!activeTableStore}
                            onClick={() => vscode.postMessage({ command: 'closeAllLogs' })} />
                        <Icon name="folder-opened" title="Open Log" onClick={() => vscode.postMessage({ command: 'open' })} />
                        <Icon name='cloud-upload'
                            title='Upload annotations'
                            visible={annotations.get().length===0}
                            onClick={() => {vscode.postMessage({ command: 'readAnnotations' });}} />
                        <Icon name='cloud-download'
                            title='Download annotations'
                            visible={annotations.get().length>0}
                            onClick={() =>
                                vscode.postMessage({ command: 'writeAnnotations', data: JSON.stringify(annotations.get()) })} />
                        <label className="switch">
                            <div>
                                <input type="checkbox"
                                    onChange={function(e){
                                        chartsMode.set(e.target.checked);
                                    }}></input>
                                <span className="slider round"></span>
                            </div>
                        </label>
                    </>}>
                    <Tab name={store.tabs[0]} count={store.resultTableStoreByLocation.groupsFilteredSorted.length}>
                        {chartsMode.get() && !selected ?
                            <Chart store={store.resultTableStoreByLocation} />
                            :(<ResultTable store={store.resultTableStoreByLocation} onClearFilters={() => store.clearFilters()}
                                renderGroup={(title: string) => {
                                    const {pathname} = new URL(title, 'file:');
                                    return <>
                                        <span>{pathname.file || 'No Location'}</span>
                                        <span className="ellipsis svSecondary">{pathname.path}</span>
                                    </>;
                                }} />)
                        }
                    </Tab>
                    <Tab name={store.tabs[1]} count={store.resultTableStoreByRule.groupsFilteredSorted.length}>
                        {chartsMode.get() && !selected ?
                            <Chart store={store.resultTableStoreByRule} />
                            :
                            <ResultTable store={store.resultTableStoreByRule} onClearFilters={() => store.clearFilters()}
                                renderGroup={(rule: ReportingDescriptor | undefined) => {
                                    return <>
                                        <span>{rule?.name ?? '—'}</span>
                                        <span className="ellipsis svSecondary">{rule?.id ?? '—'}</span>
                                    </>;
                                }} />
                        }
                    </Tab>
                    <Tab name={store.tabs[2]} count={logs.length}>
                        <div className="svLogsPane">
                            {logs.map((log, i) => {
                                const {pathname} = new URL(log._uri);
                                return <div key={i} className="svListItem">
                                    <div>{pathname.file}</div>
                                    <div className="ellipsis svSecondary">{decodeFileUri(log._uri)}</div>
                                    <Icon name="close" title="Close Log"
                                        onClick={() => vscode.postMessage({ command: 'closeLog', uri: log._uri })} />
                                </div>;
                            })}
                        </div>
                    </Tab>
                    <Tab name={store.tabs[3]} count={store.resultTableStoreByTool.groupsFilteredSorted.length}>
                        <ResultTable store={store.resultTableStoreByTool} onClearFilters={() => store.clearFilters()}
                            renderGroup={(tool: string | undefined) => {
                                return <>
                                    <span>{tool ?? '—'}</span>
                                    <span className="ellipsis svSecondary">{tool ?? '—'}</span>
                                </>;
                            }} />
                    </Tab>
                    <Tab name={store.tabs[4]} count={store.resultTableStoreByLevel.groupsFilteredSorted.length}>
                        <ResultTable store={store.resultTableStoreByLevel} onClearFilters={() => store.clearFilters()}
                            renderGroup={(level: Result.level | undefined) => {
                                return <>
                                    <span>{level ?? '—'}</span>
                                    <span className="ellipsis svSecondary">{level ?? '—'}</span>
                                </>;
                            }} />
                    </Tab>
                    <Tab name={store.tabs[5]} count={store.resultTableStoreByKind.groupsFilteredSorted.length}>
                        <ResultTable store={store.resultTableStoreByKind} onClearFilters={() => store.clearFilters()}
                            renderGroup={(kind: Result.kind | undefined) => {
                                return <>
                                    <span>{kind ?? '—'}</span>
                                    <span className="ellipsis svSecondary">{kind ?? '—'}</span>
                                </>;
                            }} />
                    </Tab>
                    <Tab name='burn dowm chart'>
                        <BurndownChart store={store.resultTableStoreByRule}></BurndownChart>
                    </Tab>
                    <Tab name='compare'>
                        <DropMenu builds={builds}></DropMenu>
                    </Tab>
                </TabPanel>
            </div>
            <div className="svResizer">
                <ResizeHandle size={detailsPaneHeight} />
            </div>
            <Details result={selected} height={detailsPaneHeight} annotations={annotations} />
            <Popover show={showFilterPopup} style={{ top: 35, right: 8 + 35 + 35 + 8 }}>
                {Object.entries(store.filtersRow).map(([name, state]) => <Fragment key={name}>
                    <div className="svPopoverTitle">{name}</div>
                    {Object.keys(state).map(name => <Checkrow key={name} label={name} state={state} />)}
                </Fragment>)}
                <div className="svPopoverDivider" />
                {Object.entries(store.filtersColumn).map(([name, state]) => <Fragment key={name}>
                    <div className="svPopoverTitle">{name}</div>
                    {Object.keys(state).map(name => <Checkrow key={name} label={name} state={state} />)}
                </Fragment>)}
            </Popover>
        </FilterKeywordContext.Provider>;
    }

    componentDidMount() {
        addEventListener('message', this.props.store.onMessage);
    }

    componentWillUnmount() {
        removeEventListener('message', this.props.store.onMessage);
    }
}
