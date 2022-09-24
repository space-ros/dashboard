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
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField'; 
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';
import { StepIcon } from '@mui/material';

export { React };
export * as ReactDOM from 'react-dom';
export { IndexStore as Store } from './indexStore';
export { DetailsLayouts } from './details.layouts';

const emails = ['username@gmail.com', 'user02@gmail.com'];

localStorage.setItem('queries', "");

export interface SimpleDialogProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value: string) => {
    onClose(value);
  };

  const queries = JSON.parse(localStorage.getItem("queries") || "") 

//   return (
//     <div>
//         <Dialog onClose={handleClose} open={open}>
//         <DialogTitle>Select a query to annotate</DialogTitle>
//         <List sx={{ pt: 0 }}>
//         {queries.map((email) => (
//             <ListItem button onClick={() => handleListItemClick(email)} key={email}>
//                 <ListItemAvatar>
//                 <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
//                 </Avatar>
//                 </ListItemAvatar>
//                 <ListItemText primary={email} />
//                 <TextField id="outlined-basic" label="Outlined" variant="outlined" />
//             </ListItem>
//             ))}
//         </List>
//         </Dialog>
//     </div>
//   );
  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Annotation</DialogTitle>
         <List sx={{ pt: 0 }}>
         {queries.map((email) => (
             <ListItem button onClick={() => handleListItemClick(email)} key={email}>
                <ListItemAvatar>
                <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                 </Avatar>
                 </ListItemAvatar>
                 <ListItemText primary={email} />
            </ListItem>
             ))}
         </List>
        <DialogContent>
          <DialogContentText>
            Issue link
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="link"
            type="email"
            fullWidth
            variant="standard"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Annotate XX issues</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default function SimpleDialogDemo() {
  const [open, setOpen] = React.useState(true);
//   const [selectedQuery, setSelectedQuery] = React.useState(queries[0]);
  const [selectedValue, setSelectedValue] = React.useState(emails[1]);

  const handleClose = (value: string) => {
    setOpen(false);
    setSelectedValue(value);
  };

  return (
    <div>
      <SimpleDialog
        selectedValue={selectedValue}
        open={open}
        onClose={handleClose}
      />
    </div>
  );
}


@observer export class Index extends Component<{ store: IndexStore, baselineStores: [IndexStore] }> {
    private showFilterPopup = observable.box(false)
    private detailsPaneHeight = observable.box(120)
    private chartsMode = observable.box(false);
    private annotationDialog = observable.box(false);
    public queries = observable.box([]);

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
        const {showFilterPopup, detailsPaneHeight, chartsMode, annotationDialog} = this;
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
                        <label className="switch">
                        <div>
                            <input type="checkbox" 
                            onChange={function(e){
                                chartsMode.set(e.target.checked);
                            }}></input>                            
                            <span className="slider round"></span>
                        </div>
                        </label>
                        <Button onClick={function(e){annotationDialog.set(true);}}>Annotate</Button>
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
                    {annotationDialog.get() ?
                        <>
                            <SimpleDialogDemo/>
                        </>    
                    :(null)}
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
