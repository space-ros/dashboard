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
import { walkSync, walk } from '@nodelib/fs.walk';
import * as os from 'os';
import * as path from 'path';
import { Uri } from 'vscode';

export async function unpackArchive(uri: Uri) {
    const path = uri.path;

    const tmpdir = mkdtempSync(`${os.tmpdir()}/build-results-`);
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
    return processed_sarif_uris;
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

export async function sarifContents(uri: string) {
    const sarif_uris: Uri[] = [];

    walkSync(path.join(uri, 'processed')).forEach((file) => {
        if (path.extname(file.name) === '.sarif') {
            sarif_uris.push(Uri.parse(file.path));
        }
    });
    return sarif_uris;
}
