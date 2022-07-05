// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

(async () => {
    const defaultState = { // Some duplicated from shared/index
        version: 0,
        filtersRow: {
            Level: {
                'Error': true,
                'Warning': true,
                'Note': true,
                'None': true,
            },
            Baseline: {
                'New': true,
                'Unchanged': true,
                'Updated': true,
                'Absent': false,
            },
            Suppression: {
                'Not Suppressed': true,
                'Suppressed': false,
            },
        },
        filtersColumn: {
            Columns: {
                'Baseline': true,
                'Suppression': true,
                'Rule': true,
            },
        },
    };

    const state = localStorage.getItem('state');
    const store = new Store(JSON.parse(state) ?? defaultState, true);
    const file = 'samples/commit_1/cppcheck.sarif';
    const response = await fetch(file);
    const log = await response.json();
    log._uri = `file:///Users/username/projects/${file}`;
    log._commit = 'commit_1';
    store.logs.push(log);

    const run_3 = 'samples/commit_2/cppcheck.sarif';
    const response_3 = await fetch(run_3);
    const log_3 = await response_3.json();
    log_3._uri = `file:///Users/username/projects/${file}`;
    log_3._commit = 'commit_2';
    store.logs.push(log_3);

    const file_2 = 'samples/commit_1/clang_tidy.sarif';
    const response_2 = await fetch(file_2);
    const log_2 = await response_2.json();
    log_2._uri = `file:///Users/username/projects/${file_2}`;
    log_2._commit = 'commit_1';
    store.logs.push(log_2);
    document.body.classList.add('pageIndex') // Alternatively 'pageDetailsLayouts'.

    ReactDOM.render(
        React.createElement(Index, {store}), // Alternatively 'DetailsLayouts'.
        document.getElementById('root'),
    );
})();
