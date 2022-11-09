"""
Class: Page 

Description:

    Used to represent each individual markdown page.

Methods:
    __get_section_title
    __get_markdown_link
    __get_markdown_relative_path
    __get_output_path
    __is_index
    __is_navigation_item
    __is_homepage

Issues:
    - See is_homepage function

"""
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
        self.section_title = self.section.name
        self.filename = Path(self.path).name
        self.markdown_link = self.__get_markdown_link()
        self.markdown_relative_path = self.__get_markdown_relative_path()
        self.output_path = self.__get_output_path()
        self.is_index = self.__is_index()
        self.is_navigation_item = self.__is_navigation_item()
        self.is_homepage = self.__is_homepage()

    def __get_markdown_link(self):
        return self.filename.strip()[:-3]

    def __get_markdown_relative_path(self):
        # print(self.path, self.source)
        # print('test', str(os.path.relpath(self.path, self.source))[:-3])
        return str(os.path.relpath(self.path, self.source))[:-3]

    def __get_output_path(self):
        return self.markdown_relative_path.replace(" ", "_") + ".html"

    def __is_index(self):
        if self.filename.lower() == "index.md":
            return True
        return False

    def __is_navigation_item(self):
        """
        If it's an index.md in one of the folders at the root level then it 
        gets a navigation link.
        """
        if self.is_index:
            path = Path(os.path.relpath(self.path, self.source))
            if len(path.parents) == 2:
                return True
        return False

    def __is_homepage(self):
        """
        If the index.md file as at the root level then it's our homepage.

        Issues: 
            - This is a really bad way of doing this since it checks all files. 
        """
        if self.is_index:
            path = Path(os.path.relpath(self.path, self.source))
            if len(path.parents) == 1:
                return True
        return False

    def display(self):
        """
        Used for debugging
        """
        print("Section:", self.section)
        print("Path:", self.path)
        print("Output path:", self.output_path)
        print("MD link:", self.markdown_link)
        print("MD rel link:", self.markdown_relative_path)
        print("Filename:", self.filename)
        print("Is homepage:", self.is_index)
        print("Is base homepage:", self.is_navigation_item)
        print("Content:", self.content)
        print("Rendered:", self.rendered)
