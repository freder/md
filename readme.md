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
    - links
    - backlinks
    - tagging, tag management
    - [x] frontmatter
    - visualization
        - [x] graph
        - [ ] make nodes 'pinnable' (to be able to mix manual and automatic layout)
    - versioning (using git)
- todo lists:
    - implement an existing notation?
        - research state of the art
    - expressing dependencies
    - graphical representation
- vscode plugin
    - wiki
        - graph view
        - side bar:
            - tags list
            - backlinks
        - commands:
            - (fuzzy) insert tag
            - insert links (with autocomplete)
        - refactoring tools:
            - updating links, when file gets renamed
            - extracting section of a file to new file, and inserting a link to new file
            - rename / replace tags
            - refactor directory structure (s.th. like `dired`)
    - todo lists
        - custom "perspectives" (filtered views)