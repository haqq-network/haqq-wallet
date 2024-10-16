import sys
from mobx import observable, action

class AppState(object):
    @observable
    name = ''
    
    def __init__(self, color_theme):
        self._color_theme = color_theme
        
    @action.bound
    def greeting(self, name):
        print(f"Hey {name}")

if __name__ == '__main__':
    appState = AppState('blue')  # Initialize with a default theme
    
    if len(sys.argv) > 1:
        appState.greeting(sys.argv[1])
