# MULAN regex

Step 1:
- Find: .+
- Replace: ```<screenplay>\0</screenplay>```

Step 2:
- Find: (\n\s*\n)(.+?)(?=\n\s*\n)
- Replace: ```$1<sp>$2</sp>```
