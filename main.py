import random

from kivy.app import App
from kivy.uix.widget import Widget
from kivy.properties import StringProperty
from kivy.config import Config

import texts


class Board(Widget):
    dice = StringProperty()

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.dice = None

    def roll_dice(self):
        self.dice = f'{random.randint(1, 6)} {random.randint(1, 6)}'


class NardApp(App):
    title = texts.english['title']

    def build(self):
        Config.set('graphics', 'width', '630')
        Config.set('graphics', 'height', '600')
        return Board()


if __name__ == '__main__':

    NardApp().run()
