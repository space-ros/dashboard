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
import { mkdtempSync } from 'fs';
import { execSync } from 'child_process';
import { walkSync } from '@nodelib/fs.walk';
import * as os from 'os';
import * as path from 'path';
import { Uri } from 'vscode';
import * as diff from 'diff';
import { Log, Result as LogResult } from 'sarif';
import { compareSync, Options, Result } from 'dir-compare';

export async function unpackArchive(uri: Uri) {
    const path = uri.path;
    if (path.indexOf('tar')===-1){
        return '' as string;
    }
    const buildName = uri.path.substring(uri.path.lastIndexOf('/'));
    const tmpdir = mkdtempSync(`${os.tmpdir()}/${buildName}`);
    execSync(`tar -C ${tmpdir} -xf ${path}`);
    return tmpdir;
}

export async function unpackedSarifContents(uri: Uri) {
    const unpacked_path = await unpackArchive(uri);
    const processed_sarif_uris: Uri[] = [];

    walkSync(path.join(unpacked_path, 'processed')).forEach((file) => {
        if (path.extname(file.name) === '.sarif') {
            processed_sarif_uris.push(Uri.parse(file.path));
        }
    });
    // TODO MH add interface for this return type
    return {'uris': processed_sarif_uris, 'path': unpacked_path};
}

export async function unpackAllBuilds(uri: Uri) {
    const build_sarif_uris: Map<string, Uri[]> = new Map<string, Uri[]>();
    walkSync(uri.path).forEach(async (archive) => {
        const unpacked_path = await unpackArchive(Uri.parse(archive.path));
        const uris = await sarifContents(unpacked_path);
        build_sarif_uris.set(archive.path, uris);
    });
    return build_sarif_uris;
}

function equalResult(lr: LogResult, rr: LogResult) : boolean {
    // the bug is here
    // this produces false negatives
    if (lr.ruleId === rr.ruleId && lr._region?.startLine === rr._region?.startLine &&  lr._uri === rr._uri ){
        return true;
    }
    return false;
}

export function compareResults(leftLogResult: LogResult[], rightLogResult: LogResult[]) {
    const l : LogResult[] = [];
    const r : LogResult[] = [];
    leftLogResult.forEach((lr) => {
        let onlyLeft = true;
        rightLogResult.forEach(rr => {
            // If Result exists on both arrays dont add to left
            if(equalResult(lr, rr)){
                onlyLeft = false;
                return;
            }
        });
        if (onlyLeft){l.push(lr);}
    });
    rightLogResult.forEach((rr) => {
        let onlyRight = true;
        leftLogResult.forEach(lr => {
            if(equalResult(lr, rr)){
                onlyRight = false;
                return;
            }
        });
        if (onlyRight){r.push(rr);}
    });
    return {l, r};
}

export async function compareBuilds(latestBuildlogs: Log[], buildlogs: Log[]) {
    const result = diff.diffArrays(latestBuildlogs, buildlogs);
    return result;
}

export async function compareBuildsResults(latestBuildlogs: LogResult[], buildlogs: LogResult[]) {
    const result = diff.diffArrays(latestBuildlogs, buildlogs);
    return result;
}

export async function compareArchives(leftBuildUri : Uri, rightBuildUri : Uri) {
    const options : Options = { compareSize: true, compareContent: true };
    let rightBuildUnpackedUri :string = rightBuildUri.path;
    let leftBuildUnpackedUri :string = leftBuildUri.path;
    if (rightBuildUri.path.indexOf('tmp') === -1){
        rightBuildUnpackedUri = await unpackArchive(rightBuildUri);
    }
    if (leftBuildUri.path.indexOf('tmp') === -1){
        leftBuildUnpackedUri = await unpackArchive(leftBuildUri);
    }
    const result: Result = compareSync(path.join(leftBuildUnpackedUri, 'processed'), path.join(rightBuildUnpackedUri, 'processed'), options);
    return result;
}

export async function listAllBuilds(uri: Uri) {
    // List all archive names in uri
    const builds: string[] = [];
    walkSync(uri.path).forEach(async (archive) => {
        if(archive.path.indexOf('latest_build')===-1){
            builds.push(archive.path);
        }
    });
    return builds;
}

export async function sarifContents(uri: string) {
    const sarif_uris: Uri[] = [];

    walkSync(path.join(uri, 'processed')).forEach((file) => {
        if (path.extname(file.name) === '.sarif') {
            sarif_uris.push(Uri.parse(file.path));
        }
    });
    return sarif_uris;
}
