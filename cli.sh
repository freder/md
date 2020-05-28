# fuzzy open file
code `fzf`

# fuzzy find files matching query
find . -type f | fzf -f 'query'

# print table(s) of contents
ag --no-numbers -i '#+ (.*)' .

# select section to jump to / display
less +"/$(ag --no-numbers --no-filename -i '#+ (.*)' file.md | fzf --reverse)" file.md

# find all tags in all files
ag --only-matching --no-filename --nonumbers -i '#[a-z]+' . \
	| awk NF \
	| sort \
	| uniq

# all tags, sorted by count
ag --only-matching --no-filename --nonumbers -i '#[a-z]+' . \
	| awk NF \
	| sort \
	| uniq -c \
	| sort --reverse

# update [[wiki]] links (when file is renamed)
gsed --in-place 's/\[\[old-name.md/\[\[new-name.md/g' *
