import nltk
from nltk.text import Text
from nltk.tokenize import word_tokenize
import matplotlib.pyplot as plt

nltk.download('punkt')


with open("avatarSpeeches.txt", "r", encoding="utf-8") as f:
    raw = f.read()


tokens = word_tokenize(raw)


text = Text(tokens)


lexical_diversity = len(set(tokens)) / len(tokens)
print("Lexical Diversity:", lexical_diversity)


fdist = nltk.FreqDist(tokens)
print("Most Common Words:", fdist.most_common(10))


text.similar("love")


fdist.plot(20)
plt.show()