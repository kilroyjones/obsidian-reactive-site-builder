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
        self.filename = self.__get_filename()
        self.markdown_link = self.__get_markdown_link()
        self.markdown_relative_path = self.__get_markdown_relative_path()
        self.output_path = self.__get_output_path()
        self.is_homepage = self.__is_homepage()
        self.is_base_homepage = self.__is_base_homepage()

    def __get_filename(self):
        return self.path.split("/")[-1].strip()

    def __get_markdown_link(self):
        return self.filename.strip()[:-3]

    def __get_markdown_relative_path(self):
        index = self.path.index(self.section)
        return self.path[index:][:-3]

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
        # print(self.is_quiz)
