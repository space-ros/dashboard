/// <reference path="jsonSourceMap.d.ts" />
import { mkdtempSync, readFileSync, statSync } from 'fs';
import { execSync, chdir, cwd } from 'process';
import * as os from 'os';
import { Uri, window, workspace } from 'vscode';

export async function unpackArchive(uri: Uri) {

    if (uri.scheme !== 'file') {
        throw new Error('Archive must be a local file:// url.');
    }
    const path = uri.path;

    const archive_stats = statSync(path);
    if (archive_stats.isFile()) {
        throw new Error(`${path} is not a file.`);
    }
    const tmpdir = mkdtempSync(`${os.tmpdir()}/build-results-`);
    execSync(`tar -C ${tmpdir} -xf ${path}`);
    return tmpdir;
}
