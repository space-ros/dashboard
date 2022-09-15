/// <reference path="jsonSourceMap.d.ts" />
import { mkdtempSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { walkSync } from '@nodelib/fs.walk';
import * as os from 'os';
import * as path from 'path';
import { Uri, } from 'vscode';

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

export async function processedSarifContents(uri: Uri) {
    const unpacked_path = await unpackArchive(uri);
    const processed_sarif_uris: string[] = [];

    walkSync(path.join(unpacked_path, 'processed')).forEach((file) => {
        if (path.extname(file.name) === '.sarif') {
            processed_sarif_uris.push(`file://${path.join(unpacked_path, 'processed', file.path)}`);
        }
    });
    return processed_sarif_uris;
}