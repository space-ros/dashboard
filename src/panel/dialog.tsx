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
  open : IObservableValue<boolean>; result: Result; annotations : IObservableValue<{ rule: string, location: string, line: string, tool: string, message: string, link: string }[]>;}

@observer export class FormDialog extends Component<FormDialogProps> {
  private link = observable.box('http://');
  private annotaions_path = observable.box('/annotations.json');
  constructor(props: FormDialogProps) {
      super(props);
  }
  @action private append(result : Result, link : string) {
      // TODO: don't hard code append file://
      // Remove file:/ as json path breaks with special charcters
      const annotation = {'rule': result.ruleId || '', 'tool': result._log._uri.split('file://')[1] || '', 'link': link || '', location: '', line: '', message: ''};
      this.props.annotations.set(this.props.annotations.get().concat(annotation));
  }
  handleLinkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      this.link.set(event.target.value);
  }
  handlePathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      this.annotaions_path.set(event.target.value);
  }
  render() {
      return(
          <div>
              <Dialog open={this.props.open.get()} onClose={()=> this.props.open.set(false)}>
                  <DialogTitle>Annotation</DialogTitle>
                  <DialogContent>
                      <DialogContentText>
                        Add a link to the issue
                      </DialogContentText>
                      <TextField
                          autoFocus
                          margin="dense"
                          id="link"
                          label="Link"
                          type="url"
                          fullWidth
                          variant="standard"
                          onChange={this.handleLinkChange}
                          value={this.link.get()}
                      />
                      <TextField
                          autoFocus
                          margin="dense"
                          id="annotaion_path"
                          label="Annotations file path"
                          type="url"
                          fullWidth
                          variant="standard"
                          onChange={this.handlePathChange}
                          value={this.annotaions_path.get()}
                      />
                  </DialogContent>
                  <DialogActions>
                      <Button onClick={ () => this.props.open.set(false)}>Cancel</Button>
                      <Button onClick={()=> {this.props.open.set(false);this.append(this.props.result, this.link.get());}}>Annotate</Button>
                  </DialogActions>
              </Dialog>
          </div>
      );
  }
}
