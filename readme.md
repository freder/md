## run

- requirements:
    - `ag`
    - gnu `sed`

```
node src/index.js test-data
yarn run vis
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
	    - [x] file-level (frontmatter)
	    - [ ] per section
    - [x] frontmatter
    - refactoring:
        - [x] updating links, when file gets renamed
        - [x] updating links, when directory gets renamed / moved
        - [x] extracting section of a file to new file, and inserting a link to new file
        - [x] rename / replace (frontmatter) tags
    - visualization
        - [x] basic graph visualiztion
        - [x] make nodes 'pinnable' (to be able to mix manual and automatic layout)
        - [x] zoom / pan
    - versioning (using git): either automatic or manually
    - static site generator?
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
            - extract selection to new file
    - todo lists
        - custom "perspectives" (filtered views)
