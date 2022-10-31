import os
from pathlib import Path


class Page:
    def __init__(self, source, section, content, path):
        self.source = source
        self.section = section
        self.content = content
        self.path = path
        self.headers = []
        self.rendered = ""
        self.section_title = self.__get_section_title()
        self.filename = self.__get_filename()
        self.markdown_link = self.__get_markdown_link()
        self.markdown_relative_path = self.__get_markdown_relative_path()
        self.output_path = self.__get_output_path()
        self.is_homepage = self.__is_homepage()
        self.is_base_homepage = self.__is_base_homepage()

    def __get_filename(self):
        return Path(self.path).name

    def __get_section_title(self):
        print(self.section.name)
        return self.section.name

    def __get_markdown_link(self):
        return self.filename.strip()[:-3]

    def __get_markdown_relative_path(self):
        return str(os.path.relpath(self.path, self.source))[:-3]

    def __get_output_path(self):
        return self.markdown_relative_path.replace(" ", "_") + ".html"

    def __is_homepage(self):
        if self.filename.lower() == "index.md":
            return True
        return False

    def __is_base_homepage(self):
        if self.is_homepage:
            path = Path(os.path.relpath(self.path, self.source))
            if len(path.parents) == 2:
                return True
        return False

    def display(self):
        print("Section:", self.section)
        print("Path:", self.path)
        print("Output path:", self.output_path)
        print("MD link:", self.markdown_link)
        print("MD rel link:", self.markdown_relative_path)
        print("Filename:", self.filename)
        print("Is homepage:", self.is_homepage)
        print("Is base homepage:", self.is_base_homepage)
        print("Content:", self.content)
        print("Rendered:", self.rendered)
