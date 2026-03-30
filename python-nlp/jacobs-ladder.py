# --- imports ---
import nltk
from nltk.tokenize import word_tokenize
from nltk import FreqDist
from nltk.text import Text
import matplotlib.pyplot as plt

# --- load files ---
with open("jacobs-ladder-script.txt", "r", encoding="utf-8") as f:
    jacob_text = f.read()

with open("outputLinkText.txt", "r", encoding="utf-8") as f:
    sh_text = f.read()

# --- tokenize ---
jacob_tokens = word_tokenize(jacob_text.lower())
sh_tokens = word_tokenize(sh_text.lower())

# --- frequency distributions ---
jacob_freq = FreqDist(jacob_tokens)
sh_freq = FreqDist(sh_tokens)

print("\nTop 20 words in Jacob's Ladder:\n")
print(jacob_freq.most_common(20))

print("\nTop 20 words in Silent Hill 2:\n")
print(sh_freq.most_common(20))

# --- shared vocabulary ---
jacob_vocab = set(jacob_tokens)
sh_vocab = set(sh_tokens)

common_words = jacob_vocab.intersection(sh_vocab)

print("\nSome shared words:\n")
print(list(common_words)[:50])

# --- unique words ---
print("\nUnique to Jacob's Ladder:\n")
print(list(jacob_vocab - sh_vocab)[:50])

print("\nUnique to Silent Hill 2:\n")
print(list(sh_vocab - jacob_vocab)[:50])

# --- theme comparison ---
themes = ["guilt", "death", "memory", "pain", "dream", "hell"]

print("\nTheme counts:\n")
for word in themes:
    print(f"{word}:")
    print("  Jacob:", jacob_freq[word])
    print("  SH2:", sh_freq[word])

# --- dispersion plots ---
jacob_text_nltk = Text(jacob_tokens)
sh_text_nltk = Text(sh_tokens)

words_to_track = ["guilt", "death", "memory", "mary", "james"]

print("\nShowing dispersion plot for Jacob's Ladder...")
jacob_text_nltk.dispersion_plot(words_to_track)
plt.show()

print("\nShowing dispersion plot for Silent Hill 2...")
sh_text_nltk.dispersion_plot(words_to_track)
plt.show()