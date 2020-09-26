import logging
from datetime import datetime
from pathlib import Path
import os

from kivy.app import App
from kivy.uix.widget import Widget
from kivy.uix.label import Label
from kivy.uix.image import Image
from kivy.uix.button import Button
from kivy.uix.gridlayout import GridLayout
from kivy.uix.stacklayout import StackLayout

import texts


# class StartGame(Widget):
#     layout = GridLayout(cols=15, rows=3)
#     for i in range(15 * 3):
#         layout.add_widget(Button(text=f'{i}', size_hint_x=None))


# class MyGrid(GridLayout):
#
#     def __init__(self, **kwargs):
#         cols = 5
#         super().__init__(cols=cols)
#         for i in range(cols):
#             if not i & 1:
#                 self.add_widget(Label(text='side', size_hint=(0.1, None)))
#             else:
#                 self.half = GridLayout(rows=3)
#                 self.u_row = GridLayout(cols=6)
#                 for j in range(6):
#                     self.u_row.add_widget(Button(text=f'u {j}'))
#                 self.half.add_widget(self.u_row)
#                 self.half.add_widget(Label(text='Dice place', size_hint=(None, 0.25)))
#                 self.b_row = GridLayout(cols=6)
#                 for j in range(6):
#                     self.b_row.add_widget(Button(text=f'b {j}'))
#                 self.half.add_widget(self.b_row)
#                 self.add_widget(self.half)


class Board(Widget):
    pass


class NardApp(App):
    title = texts.english['title']
    # wimg = Image(source='images/board.png')

    def build(self):
        return Board()


if __name__ == '__main__':
    NardApp().run()
