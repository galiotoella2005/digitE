import nltk
import nltk.corpus
# The next line downloads all the example texts used in the NLTK book at https://www.nltk.org/book !
# You can comment out the download line after the first time you do it.
nltk.download('book')
from nltk.book import *
# The next line lets us do GET requests from remote URLs on the web:
from urllib import request
# The following import lines are for plotting interactive visualizations in Python
import matplotlib
import matplotlib.pyplot as plt
import tkinter as tk
from tkinter import scrolledtext
import io
import sys
def on_button_click():
    print("Button toggled!")
    number = input("Pick a number!")
    text="*@*\n"
    print(text * int(number))
root = tk.Tk()
root.title("Hello World!") 
label = tk.Label(root, text="Go ahead! Click the button!")
label.pack()
# Make a Tkinter button give it "Click Me" text, and on clicking, trigger the function above.
button = tk.Button(root, text="Click Me", command=on_button_click)
button.pack()
# The next command generates the little tkinter interface as a little pop-up.
root.mainloop()