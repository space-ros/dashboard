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
    const baselineStore = new Store(JSON.parse(state) ?? defaultState, true);
    const array = ['cpplint.sarif', 'cppcheck.sarif', 'clang_tidy.sarif'];
    const baselines = 4;
    let baselineStores = [];
    const baselineFolder = "samples/commit_";

    for (let index = 1; index < baselines; index++) {
        const baselineStore = new Store(JSON.parse(state) ?? defaultState, true);
        await loadLogs(baselineStore, baselineFolder+index.toString()+"/"); // too add other params
        baselineStores.push(baselineStore);
    }
    async function loadLogs(store, basePath)  {
        for (let index = 0; index < array.length; index++) {
            const file = basePath + array[index];
            const response = await fetch(file);
            const log = await response.json();
            log._uri = file;
            // log_4._commit = 'commit_2';
            store.logs.push(log);
        }
    }
    await loadLogs(store, baselineFolder + "1/");
    document.body.classList.add('pageIndex') // Alternatively 'pageDetailsLayouts'.
    ReactDOM.render(
        React.createElement(Index, {store, baselineStores}), // Alternatively 'DetailsLayouts'.
        document.getElementById('root'),
    );
})();
