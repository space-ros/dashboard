/*
 * Copyright (C) 2022 Open Source Robotics Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import * as React from 'react';
import { action, IObservableValue, observable } from 'mobx';
import { observer } from 'mobx-react';
import { Component } from 'react';
import { Result } from 'sarif';
import './index.scss';
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
