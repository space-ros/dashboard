// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';
import { IObservableValue } from 'mobx/lib/internal';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface FormDialogProps {
    open : IObservableValue<boolean>; link : IObservableValue<string>;}

@observer export class FormDialog extends React.Component<FormDialogProps> {
    constructor(props: FormDialogProps) {
        super(props);
    }
    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.link.set(event.target.value);
    }
    render() {
        return(
            <div>
                <Dialog open={this.props.open.get()} onClose={()=> this.props.open.set(false)}>
                    <DialogTitle>Open annotations</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Upload annotation file
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Path"
                            type="url"
                            fullWidth
                            variant="standard"
                            onChange={this.handleChange}
                            value={this.props.link.get()}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={ () => this.props.open.set(false)}>Cancel</Button>
                        <Button onClick={()=> {this.props.open.set(false); vscode.postMessage({ command: 'readAnnotations', data: JSON.stringify(this.props.link.get()) }); }}>Load</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}