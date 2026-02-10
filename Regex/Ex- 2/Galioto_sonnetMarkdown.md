# Sonnet Markdown

Step 1: Find: ```^+```  Replace: nothing (didn't work)

Step 2: Find: ```\n\n``` Replace: ```\n```

Step 3: Find: .+ Replace: ```<line>\0</line>```

Step 4: Find: ```<line>([IVXLC]+)</line>``` Replace: ```<sonnet number="\1"></sonnet>```