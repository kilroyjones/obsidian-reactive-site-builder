"""
Class: SiteRender 

Description:

    This class is in charge of rendering the markdown and running through the 
    processors. Its primary purpose is to create a list of pages (Page class as
    found in page.py) which can be compiled into the site by the SiteRender class. 

Methods:
    __render
    __get_markdown
    __read_file
    __run_processors
    __render_html

Issues:
    - Probably should clean up some of the naming scheme (output_markdown)
"""

import logging
import markdown as md
from page import Page


class SiteRender:
    def __init__(self, profile, processors):
        """
        Parameters:
            profile: from SiteProfile, contains project file overview
            processors: A list of classes that will be run on the markdown (plugins)
        """
        self.profile = profile
        self.processors = processors
        self.pages = self.__render()

    def __render(self):
        """
        Rendering the individual page content
        """
        pages = self.__get_markdown()
        pages = self.__run_processors(pages)
        return self.__render_html(pages)

    def __get_markdown(self):
        """
        Reads from the root markdown folder and builds a dictionary with the
        path as the key and the markdown content as the value.
        """
        pages = []
        for section in self.profile.sections:
            for path in self.profile.sections[section]:
                pages.append(
                    Page(
                        self.profile.source,
                        section=section,
                        content=self.__read_file(path),
                        path=path,
                    )
                )
        return pages

    def __read_file(self, source):
        """
        Parameters:
            source: Path to a markdown file

        Reads in a markdown file and returns it as a single string.
        """
        try:
            with open(source) as f:
                return f.read()
        except Exception:
            logging.exception("Error reading the markdown file.")
            return "[Error processing this file]"

    def __run_processors(self, pages):
        """
        Parameters:
            markdown_pages: dictionary of markdown pages (Page - page.py)
        """
        for Processor in self.processors:
            processor = Processor(pages)
            pages = processor.run()
        return pages

    def __render_html(self, markdown_pages):
        for page in markdown_pages:
            page.rendered = md.markdown(page.content)
        return markdown_pages
