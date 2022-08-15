# SpaceROS  dashboard

A [Visual Studio Code](https://code.visualstudio.com/) [extension] (WIP), and a standalone web application for viewing and analysing [SARIF](https://sarifweb.azurewebsites.net/) logs.

![overview](README.webapp.png)


## Usage
## Standalone web application
### Prerequest
Node v16 or higher is recommended.


### Installtion 
`npm run prestart`
### Run
| Command | Comments |
| --- | --- |
| `npm run server` | Run the `Panel` standalone at `http://localhost:8000`. Auto-refreshes. |


Consuming sarif files (temp solution until connected with colcon)

The build results should be placed in `samples/commit_<commit_index>`
The final commit results is viewed, and the results of the other commits are consumed to line the burndown chart.

At the moment only three `sarif` results are proccesed `['cpplint.sarif', 'cppcheck.sarif', 'clang_tidy.sarif']`, add more to the array in `index.js` 

TODO:

- [ ] Automate colcon connection to dashboard
- [ ] Automate files to be proccesed
- [ ] Forward port the standalone application changes to the VSCode extention
- [ ] Make the burndown chart more flex (configurable points per week, different points for each issue type) 
 