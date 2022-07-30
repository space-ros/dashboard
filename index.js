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

    const state = localStorage.getItem('state');
    const store = new Store(JSON.parse(state) ?? defaultState, true);
    const array = ['cpplint.sarif', 'cppcheck.sarif', 'clang_tidy.sarif'];

    async function loadLogs()  {
        for (let index = 0; index < array.length; index++) {
            const file = 'samples/commit_1/'+ array[index];
            const response = await fetch(file);
            const log = await response.json();
            log._uri = `/home/m/repos/dashboard/samples/commit_1/${array[index]}`;
            log._commit = 'commit_1';
            store.logs.push(log);
        }
    }

    async function loadBaslineLogs()  {
        for (let index = 0; index < array.length; index++) {
            const file_4 = 'samples/commit_2/'+ array[index];
            const response_4 = await fetch(file_4);
            const log_4 = await response_4.json();
            log_4._uri = `/home/m/repos/dashboard/samples/commit_2/${array[index]}`;
            log_4._commit = 'commit_2';
            store.baselineLogs.push(log_4);
        }
    }

    await loadLogs()
    await loadBaslineLogs()

    document.body.classList.add('pageIndex') // Alternatively 'pageDetailsLayouts'.

    ReactDOM.render(
        React.createElement(Index, {store}), // Alternatively 'DetailsLayouts'.
        document.getElementById('root'),
    );
})();
