import sarif_om
import json
from airium import Airium

class HtmlWriter:
    def __init__(self, _html_path:str = "dashboard.html"):
        self._html_path = _html_path
        self.initialize_html()   

    def initialize_html(self):
        self._a = Airium()
        self._a('<!DOCTYPE html>')
        with self._a.html(lang="en"):
            with self._a.head():
                self._a.meta(charset="utf-8")
                self._a.title(_t="Sapce-ROS dashboard")

            with self._a.body():
                with self._a.h3(id="id23409231", klass='main_header'):
                    self._a("Hello World.")

    def write(self):
        with open(self._html_path, 'wb') as f:
            f.write(bytes(self._a))

class SarifParser:
    def __init__(self):
        pass
    
    def read_sarif(file_path:str):
        with open(file_path) as f:
            sarif_json = json.load(f)
            sarif = SarifLog(sarif_json)
            print(sarif)
            pass

sarifParser = SarifParser()
sarifParser.read()

        
writer = HtmlWriter()
writer.write()
