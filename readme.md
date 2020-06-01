```
node index.js ./test-data
serve -o ./web
```


## mission

- building composable tools for working with markdown files
- enabling more advanced workflows, while dealing with flat files only
- creating the building blocks for a vscode extension

## ideas
- wiki-like:
    - links, backlinks
    - tagging, tag management
    - tools for refactoring
        - updating links, when file gets renamed
        - extracting section of a file to new file, and inserting a link to new file
    - possibility to embed (parts of) other files
        - making each atomic element referenceable
    - versioning (using git)
- todo lists:
    - expressing dependencies
- data / API:
    - represent everything as a graph