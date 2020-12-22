"""
Class:  profile

Description:

Methods:

Issues:
"""

import os
import prettierfier
import shutil


class Builder:
    def __init__(self, profile, markdown, processors):
        self.profile = profile
        self.md = markdown
        self.processors = processors

    def read_file(self, source):
        try:
            with open(source) as f:
                return f.read()
        except OSError as e:
            print(e)
            print("read_file: File not found")

    def get_markdown(self):
        pages = {}
        for path in self.profile.page_paths:
            source = os.path.join(self.profile.source, path)
            pages[path] = self.read_file(source)
        return pages

    def get_html(self, pages):
        html = {}
        for path in pages:
            source = pages[path]
            html[path] = self.md.markdown(source)
        return html

    def create_folders(self, destination):
        for section in self.profile.sections:
            folder = os.path.join(destination, section)
            if os.path.exists(folder):
                shutil.rmtree(folder)
            os.mkdir(folder)

    def save_as_svelte(self, destination, html):
        for path in html:
            svelte_file = os.path.join(destination, path.replace(" ", "_"))
            with open(svelte_file, "w") as f:
                f.write(html[path])

    def output_markdown(self, destination):
        pages = self.get_markdown()
        html = self.get_html(pages)
       self.create_folders(destination)
        self.save_as_svelte(destination, html)

