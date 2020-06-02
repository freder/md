```
node index.js ./test-data
serve -o ./web
```


## mission
- building composable pieces of functionality for working with markdown files
- enabling more advanced workflows, while dealing with flat files only
- tying it together in a vscode extension

## ideas
- data:
    - represent everything as a graph
        - [x] inter-document links
        - [ ] documents themselves
- flat file wiki:
    - [x] links
    - [x] backlinks
    - [x] find broken links
    - [tags](https://github.com/freder/md/issues/3)
    - [x] frontmatter
    - refactoring:
        - [updating links, when file gets renamed](https://github.com/freder/md/issues/2)
        - rename / replace tags
    - visualization
        - [x] graph
        - [ ] [make nodes 'pinnable' (to be able to mix manual and automatic layout)](https://github.com/freder/md/issues/2)
        - highlight node's edges on hover
        - show subset of graph
            - "radius" filter tool: use scrollwheel to adjust the number of max. "hops" from the central node
    - versioning (using git): either automatic or manually
- todo lists:
    - implement an existing notation?
        - research state of the art
            - https://www.taskpaper.com/
            - https://margin.love/#/
            - https://jtree.treenotation.org/designer/
    - expressing dependencies
    - graphical representation
- vscode plugin
    - wiki
        - graph view
        - editor
            - navigating links
            - link preview
        - side bar:
            - tags list
            - backlinks (with context)
        - commands:
            - (fuzzy) insert tag
            - insert links (with autocomplete)
            - refactor directory structure (s.th. like `dired`)
            - extracting section of a file to new file, and inserting a link to new file
    - todo lists
        - custom "perspectives" (filtered views)
