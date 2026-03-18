import nltk
from nltk.tokenize import word_tokenize

with open("avatarSpeeches.txt", "r") as file:
    text = file.read()

words = word_tokenize(text)

print("Total words:", len(words))
print("First 20 words:", words[:20])