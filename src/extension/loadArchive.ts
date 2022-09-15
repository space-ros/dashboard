/// <reference path="jsonSourceMap.d.ts" />
import { readFileSync } from 'fs'
import { mkdtemp, stat } from 'fs/promises'
import { Uri, window, workspace } from 'vscode';

export async function unpackArchive(uri: Uri) {

    const archive_stats = await stat(uri);
    if (archive_stats.isFile()) {
        throw new Error('uri is not a file.');
    }
}
