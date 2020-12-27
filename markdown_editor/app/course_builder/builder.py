"""
Class: Builder

Description:

    This is the main folder for the course builder. It mainly sets up the 
    folders in the svelte project, gets loads the markdown files, and 
    outputs the html. 

Methods:
    read_file
    get_markdown
    get_html
    create_folders
    save_as_svelte
    setup_svelte
    run_processors
    output_markdown

Issues:
    - Probably should clean up some of the naming scheme (output_markdown)
"""

import os
import shutil
from processors.app_header import AppHeader


class Builder:
    def __init__(self, profile, markdown, processors):
        """
        Parameters:
            profile: Create in profile.py a contains project data
            markdown: Is the markdown processor
            processors: A list of classes that will be run on the markdown (plugins)
        """
        self.profile = profile
        self.md = markdown
        self.processors = processors

    def __read_file(self, source):
        """
        Parameters:
            source: Path to a markdown file

        Reads in a markdown file and returns it as a single string.
        """
        try:
            with open(source) as f:
                return f.read()
        except OSError as e:
            print(e)
            print("read_file: File not found")

    def __get_markdown(self):
        """
        Reads from the root markdown folder and builds a dictionary with the
        path as the key and the markdown content as the value.
        """
        pages = {}
        for path in self.profile.markdown_paths:
            source = os.path.join(self.profile.source, path)
            pages[path] = self.__read_file(source)
        return pages

    def __get_html(self, markdown_pages):
        """
        Converts all the markdown to html and returns a dictionary where the
        key is the path to the original markdown and the value is the html.
        """
        html = {}
        for path in markdown_pages:
            source = markdown_pages[path]
            html[path] = self.md.markdown(source)
        return html

    def __create_folders(self, svelte_path):
        """
        Parameters:
            svelte_path: The location for the svelte project

        Creates the svelte project section folders from the markdown
        folders.

        Issues:
             - Will need to be fixed if dealing with nested folders.
        """
        for section in self.profile.sections:
            section = section.replace(" ", "_")
            folder = os.path.join(svelte_path, "src/content", section)
            if os.path.exists(folder):
                shutil.rmtree(folder)
            os.mkdir(folder)

    def __save_as_svelte(self, destination, html):
        """
        Parameters:
            destination: Root folder for existing svelte project
            html: Writes out the svelte files to the content folder

        Saves the svelte project. This requires an existing svelte project
        to write to. It overwrites the App.svelte file at a later point.
        """
        for path in html:
            svelte_file = os.path.join(
                destination, "src/content", path.replace(" ", "_")
            )
            svelte_file = svelte_file[:-3] + ".svelte"
            with open(svelte_file, "w") as f:
                f.write(html[path])

    def __setup_svelte(self, markdown_pages, params):
        """
        Parameters:
            pages: Markdown pages
            params: List with profile and svelte_path at the moment.
                additional options could be sent later.

        Used to set up the svelte project.

        Issue:
            - This should be rolled into the "processors" at some point.
        """
        app_header = AppHeader(markdown_pages, params)
        app_header.run()

    def __run_processors(self, markdown_pages):
        """
        Parameters:
            markdown_pages: dictionary of markdown pages

        Loops through the processors and executes them using the run method.
        """
        for Processor in self.processors:
            processor = Processor(markdown_pages, self.profile)
            markdown_pages = processor.run()
        return markdown_pages

    def output_markdown(self, svelte_path):
        """
        Parameters:
            svelte_path: location of an existing svelte project

        Primary function for the builder.
        """
        markdown_pages = self.__get_markdown()
        markdown_pages = self.__run_processors(markdown_pages)
        self.__setup_svelte(markdown_pages, [self.profile, svelte_path])
        html = self.__get_html(markdown_pages)
        self.__create_folders(svelte_path)
        self.__save_as_svelte(svelte_path, html)
