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

    const file_2 = 'samples/commit_2/clang_tidy.sarif';
    const response_2 = await fetch(file_2);
    const log_2 = await response_2.json();
    log_2._uri = `file:///home/m/repos/dashboard/${file_2}`;
    log_2._commit = 'commit_1';
    store.logs.push(log_2);

    async function loadfiles(params)  {
        const array = ['copyright.sarif', 'cpplint.sarif', 'uncrustify.sarif'];
        for (let index = 0; index < array.length; index++) {
            const file_4 = 'samples/commit_1/'+ array[index];
            const response_4 = await fetch(file_4);
            const log_4 = await response_4.json();
            log_4._uri = `/home/m/repos/dashboard/samples/commit_1/${array[index]}`;
            log_4._commit = 'commit_1';
            store.logs.push(log_4);
        }
    }
    await loadfiles()


    document.body.classList.add('pageIndex') // Alternatively 'pageDetailsLayouts'.

    ReactDOM.render(
        React.createElement(Index, {store}), // Alternatively 'DetailsLayouts'.
        document.getElementById('root'),
    );
})();
