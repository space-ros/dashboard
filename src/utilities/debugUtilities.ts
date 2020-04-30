/*!
 * Copyright (c) Microsoft Corporation. All Rights Reserved.
 */

export const debugMode: boolean = startedInDebugMode();

export const testMode: boolean = startedInTestMode();

/**
 * A helper for detecting whether the extension was started in a test.
 */
function startedInTestMode(): boolean {
    return process.execArgv.some((arg) => /^--extensionTestsPath=?/.test(arg));
}

/**
 * A helper for detecting whether the extension was started in debug mode.
 * Borrowed from: https://github.com/Microsoft/vscode-languageserver-node/blob/db0f0f8c06b89923f96a8a5aebc8a4b5bb3018ad/client/src/main.ts#L217
 */
function startedInDebugMode(): boolean {
    return process.execArgv.some((arg) => /^--debug=?/.test(arg) || /^--debug-brk=?/.test(arg) || /^--inspect=?/.test(arg) || /^--inspect-brk=?/.test(arg));
}