"""
Class: SiteRender 

Description:

    This class is in charge of rendering the markdown and running through the 
    extensions. Its primary purpose is to create a list of pages (Page class as
    found in page.py) which can be compiled into the site by the SiteRender class. 

Methods:
    __render
    __build_pages
    __read_file
    __render_html

Issues:
    - Probably should clean up some of the naming scheme (output_markdown)
"""

import logging
import markdown as md
from page import Page


class SiteRender:
    def __init__(self, profile, extensions):
        """
        Parameters:
            profile: from SiteProfile, contains project file overview
            extensions: A list of classes that will be run on the markdown (plugins)
        """
        self.profile = profile
        self.extensions = extensions 
        self.pages = self.__render()

    def __render(self):
        """
        Rendering the individual page content
        """
        pages = self.__build_pages()
        for page in pages:
            page.rendered = md.markdown(page.content, extensions=['fenced_code', 'codehilite', 'sane_lists'])
            page = self.__run_extensions(page) 
        return pages

        # for i in range(len(pages)):
        #     pages[i].rendered = md.markdown(pages[i].content, extensions=['fenced_code', 'codehilite', 'sane_lists'])
        #     pages[i] = self.__run_extension(pages[i]) 

    def __build_pages(self):
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

    def __run_extensions(self, page):
        """
        Parameters:
            Page: A single Page object 
        """
        for extension in self.extensions:
            page = extension.run(page)
        return page

