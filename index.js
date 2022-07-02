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
                'Baseline': false,
                'Suppression': false,
                'Rule': false,
            },
        },
    };

    const state = localStorage.getItem('state');
    const store = new Store(JSON.parse(state) ?? defaultState, true);
    const file = 'samples/cppcheck.sarif';
    const response = await fetch(file);
    const log = await response.json();
    log._uri = `file:///Users/username/projects/${file}`;
    store.logs.push(log);

    const state_2 = localStorage.getItem('state');
    const store_2 = new Store(JSON.parse(state_2) ?? defaultState, true);
    const file_2 = 'samples/clang_tidy.sarif';
    const response_2 = await fetch(file_2);
    const log_2 = await response_2.json();
    log_2._uri = `file:///Users/username/projects/${file_2}`;
    store.logs.push(log_2);
    document.body.classList.add('pageIndex') // Alternatively 'pageDetailsLayouts'.

    ReactDOM.render(
        React.createElement(Index, {store}), // Alternatively 'DetailsLayouts'.
        document.getElementById('root'),
    );
})();
