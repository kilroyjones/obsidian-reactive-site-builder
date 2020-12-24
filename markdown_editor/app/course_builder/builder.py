"""
Class:  profile

Description:

Methods:

Issues:
"""

import os

# import prettierfier
import shutil
from processors.app_header import AppHeader


class Builder:
    def __init__(self, profile, markdown, processors):
        self.profile = profile
        self.md = markdown
        self.processors = processors

    def __read_file(self, source):
        try:
            with open(source) as f:
                return f.read()
        except OSError as e:
            print(e)
            print("read_file: File not found")

    def __get_markdown(self):
        pages = {}
        for path in self.profile.markdown_paths:
            source = os.path.join(self.profile.source, path)
            pages[path] = self.__read_file(source)
        return pages

    def __get_html(self, pages):
        html = {}
        for path in pages:
            source = pages[path]
            html[path] = self.md.markdown(source)
        return html

    def __create_folders(self, svelte_path):
        for section in self.profile.sections:
            section = section.replace(" ", "_")
            folder = os.path.join(svelte_path, "src/content", section)

            print(os.getcwd(), folder)
            if os.path.exists(folder):
                shutil.rmtree(folder)
            os.mkdir(folder)

    def __save_as_svelte(self, destination, html):
        for path in html:
            svelte_file = os.path.join(
                destination, "src/content", path.replace(" ", "_")
            )
            svelte_file = svelte_file[:-3] + ".svelte"
            with open(svelte_file, "w") as f:
                f.write(html[path])

    def setup_svelte(self, pages, params):
        app_header = AppHeader(pages, params)
        app_header.run()

    def output_markdown(self, svelte_path):
        markdown_pages = self.__get_markdown()
        self.setup_svelte(markdown_pages, [self.profile, svelte_path])
        html = self.__get_html(markdown_pages)
        self.__create_folders(svelte_path)
        self.__save_as_svelte(svelte_path, html)
