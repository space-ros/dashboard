// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Component, Fragment } from 'react';
import { ReportingDescriptor } from 'sarif';
import 'vscode-codicons/dist/codicon.css';
import '../shared/extension';
import { Details } from './details';
import { FilterKeywordContext } from './filterKeywordContext';
import './index.scss';
import { IndexStore } from './indexStore';
import { ResultTable } from './resultTable';
import { RowItem } from './tableStore';
import { Checkrow, Icon, Popover, ResizeHandle, Tab, TabPanel } from './widgets';
import { Chart } from './chart';
import { BurnDownChart } from './burnDownChart';
import { decodeFileUri } from '../shared';

export { React };
export * as ReactDOM from 'react-dom';
export { IndexStore as Store } from './indexStore';
export { DetailsLayouts } from './details.layouts';

@observer export class Index extends Component<{ store: IndexStore, baselineStores: [IndexStore] }> {
    private showFilterPopup = observable.box(false)
    private detailsPaneHeight = observable.box(80)
    private chartsMode = observable.box(false);
    
    render() {
        const {store} = this.props;
        const { baselineStores } = this.props;
        console.log(store);
        console.log(baselineStores);
        if (!store.logs.length) {
            return <div className="svZeroData">
                <div onClick={() => vscode.postMessage({ command: 'open' })}>
                    Open SARIF log
                </div>
            </div>;
        }

        const {logs, keywords} = store;
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

                        <label className="switch">
                        <div>
                            <input type="checkbox" 
                            onChange={function(e){
                                chartsMode.set(e.target.checked);
                            }}
                            ></input>                            
                            <span className="slider round"></span>
                        </div>
                        </label>
                        <div className="svFilterCombo">
                            <input type="text" placeholder="Filter results" value={store.keywords}
                                onChange={e => store.keywords = e.target.value}
                                onKeyDown={e => { if (e.key === 'Escape') { store.keywords = ''; } } }/>
                            <Icon name="filter" title="Filter Options" onMouseDown={e => e.stopPropagation()} onClick={() => showFilterPopup.set(!showFilterPopup.get())} />
                        </div>
                    </>}>
                    <Tab name={store.tabs[0]} count={store.resultTableStoreByLocation.groupsFilteredSorted.length}>
                    {chartsMode.get() ? 
                        <>
                            <Chart store={store.resultTableStoreByLocation} count={store.resultTableStoreByLocation}
                            onClearFilters={() => store.clearFilters()}
                            renderGroup={(title: string) => {
                                const {pathname} = new URL(title, 'file:');
                                return <>
                                    <span>{pathname.file || 'No Location'}</span>
                                    <span className="ellipsis svSecondary">{pathname.path}</span>
                                </>;
                            }} />
                        </>
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
                        {chartsMode.get() ? 
                        <>
                            <Chart store={store.resultTableStoreByRule} count={store.resultTableStoreByRule}
                            onClearFilters={() => store.clearFilters()}
                            renderGroup={(title: string) => {
                                const {pathname} = new URL(title, 'file:');
                                return <>
                                    <span>{pathname.file || 'No Location'}</span>
                                    <span className="ellipsis svSecondary">{pathname.path}</span>
                                </>;
                            }} />
                        </>
                        :(<ResultTable store={store.resultTableStoreByRule} onClearFilters={() => store.clearFilters()}
                        renderGroup={(rule: ReportingDescriptor | undefined) => {
                            return <>
                                <span>{rule?.name ?? '—'}</span>
                                <span className="ellipsis svSecondary">{rule?.id ?? '—'}</span>
                            </>;
                        }} />)
                        }
                    </Tab>
                    <Tab name={store.tabs[3]} count={store.resultTableStoreByTool.groupsFilteredSorted.length}>
                    {chartsMode.get() ? 
                        <>
                            <Chart store={store.resultTableStoreByTool} count={store.resultTableStoreByTool}
                            onClearFilters={() => store.clearFilters()}
                            renderGroup={(title: string) => {
                                const {pathname} = new URL(title, 'file:');
                                return <>
                                    <span>{pathname.file || 'No Location'}</span>
                                    <span className="ellipsis svSecondary">{pathname.path}</span>
                                </>;
                            }} />
                        </>
                        :(<ResultTable store={store.resultTableStoreByTool} onClearFilters={() => store.clearFilters()}
                            renderGroup={(title: string) => {
                                const {pathname} = new URL(title, 'file:');
                                return <>
                                    <span>{pathname.file || 'No Location'}</span>
                                    <span className="ellipsis svSecondary">{pathname.path}</span>
                                </>;
                            }} />)
                        }
                    </Tab>
                    <Tab name={store.tabs[5]} count={store.resultTableStoreByLevel.groupsFilteredSorted.length}>
                    {chartsMode.get() ? 
                        <>
                            <Chart store={store.resultTableStoreByLevel} count={store.resultTableStoreByLevel}
                            onClearFilters={() => store.clearFilters()}
                            renderGroup={(title: string) => {
                                const {pathname} = new URL(title, 'file:');
                                return <>
                                    <span>{pathname.file || 'No Location'}</span>
                                    <span className="ellipsis svSecondary">{pathname.path}</span>
                                </>;
                            }} />
                        </>
                        :(<ResultTable store={store.resultTableStoreByLevel} onClearFilters={() => store.clearFilters()}
                            renderGroup={(title: string) => {
                                const {pathname} = new URL(title, 'file:');
                                return <>
                                    <span>{pathname.file || 'No Location'}</span>
                                    <span className="ellipsis svSecondary">{pathname.path}</span>
                                </>;
                            }} />)
                        }
                    </Tab>
                    <Tab name={store.tabs[6]}>
                            <>
                                <BurnDownChart baselineStores={baselineStores} store={store.resultTableStoreByRule}  />
                            </>
                    </Tab>
                </TabPanel>
            </div>
            <div className="svResizer">
                <ResizeHandle size={detailsPaneHeight} />
            </div>
            <Details result={selected} height={detailsPaneHeight} />
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
