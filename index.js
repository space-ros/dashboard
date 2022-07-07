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
                'Action': true
            },
        },
    };

    // for (let index = 0; index < array.length; index++) {
    //     const element = array[index];
        
    // }
    const state = localStorage.getItem('state');
    const store = new Store(JSON.parse(state) ?? defaultState, true);
    const file = 'samples/commit_1/cppcheck.sarif';
    const response = await fetch(file);
    const log = await response.json();
    log._uri = `/home/m/repos/dashboard/${file}`;
    log._commit = 'commit_1';
    store.logs.push(log);

    const run_3 = 'samples/commit_2/clang_tidy.sarif';
    const response_3 = await fetch(run_3);
    const log_3 = await response_3.json();
    log_3._uri = `/home/m/repos/dashboard/${run_3}`;
    log_3._commit = 'commit_2';
    store.logs.push(log_3);

    const file_2 = 'samples/commit_1/clang_tidy.sarif';
    const response_2 = await fetch(file_2);
    const log_2 = await response_2.json();
    log_2._uri = `file:///home/m/repos/dashboard/${file_2}`;
    log_2._commit = 'commit_1';
    store.logs.push(log_2);

    document.body.classList.add('pageIndex') // Alternatively 'pageDetailsLayouts'.

    ReactDOM.render(
        React.createElement(Index, {store}), // Alternatively 'DetailsLayouts'.
        document.getElementById('root'),
    );
})();
