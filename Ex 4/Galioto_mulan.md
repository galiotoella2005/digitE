# MULAN regex

Step 1:
- Find: .+
- Replace: ```<screenplay>\0</screenplay>```

Step 2:
- Find: (\n\s*\n)(.+?)(?=\n\s*\n)
- Replace: ```$1<sp>$2</sp>```

Extra help from class: Selects all and wraps each chunk in text
- (.+?)(\n\n)
- ```<sp>\1</sp>``` or ```<sp>$1</sp>$2```