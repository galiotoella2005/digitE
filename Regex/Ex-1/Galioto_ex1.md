# ~~~~~~~~My markdown for exercise 1

step 1- 
Find: &
Replace: &amp;

step 2-
Find: <
Replace: &lt;

step 3-
Find: >
Replace: &gt;

step 4-
Find:
```
^.+
```
Replace: 
```
<movie>\0</movie>
```

step 5-
Find:
```
(<movie>)(.+?)(\t)
```
Replace: 
```
\1<title>\2</title>
```

step 6- manually set a ```xml``` element around the whole document
