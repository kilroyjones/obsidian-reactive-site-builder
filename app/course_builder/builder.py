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
    save_as_svelte
    setup_svelte
    run_processors
    output_markdown

Issues:
    - Probably should clean up some of the naming scheme (output_markdown)
"""

import os
import shutil
from pathlib import Path
from processors.app_header import AppHeader
from markdown_page import MarkdownPage


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

    def build_site(self, build_path):
        """
        Parameters:
            output_path: destination folder 


        Primary function for the builder.
        """
        markdown_pages = self.__get_markdown()
        self.__copy_assets(build_path)
        # self.__(markdown_pages, self.profile, output_path)
        # markdown_pages = self.__run_processors(markdown_pages)
        # html = self.__get_html(markdown_pages)
        # self.__save_as_svelte(svelte_path, html)

    def __setup_svelte(self, markdown_pages, profile, svelte_path):
        """
        Parameters:
            pages: Markdown pages
            params: List with profile and svelte_path at the moment.
                additional options could be sent later.

        Used to set up the svelte project.

        Issue:
            - This should be rolled into the "processors" at some point.
        """
        app_header = AppHeader(markdown_pages, profile, svelte_path)
        app_header.run()

    def __get_markdown(self):
        """
        Reads from the root markdown folder and builds a dictionary with the
        path as the key and the markdown content as the value.
        """
        markdown_pages = []
        for section in self.profile.sections:
            for path in self.profile.section_pages[section]:
                markdown_pages.append(
                    MarkdownPage(
                        section=section, content=self.__read_file(path), path=path
                    )
                )
        return markdown_pages

    def __read_file(self, source):
        """
        Parameters:
            source: Path to a markdown file

        Reads in a markdown file and returns it as a single string.
        """
        try:
            with open(source) as f:
                return f.read()
        except Exception as e:
            print('[__read_file]', e)

    def __copy_assets(self, build_path):
        for asset_source in self.profile.asset_paths:
            asset_dest = os.path.relpath(asset_source, self.profile.source).replace(' ', '_')
            asset_dest = Path(os.path.join(build_path, asset_dest))
            asset_dest.parent.mkdir(exist_ok=True, parents=True)
            shutil.copy(asset_source, asset_dest)

    def __get_html(self, markdown_pages):
        """
        Converts all the markdown to html and returns a dictionary where the
        key is the path to the original markdown and the value is the html.
        """
        html = {}
        for page in markdown_pages:
            source = page.content
            source = self.__add_headers(source, page.headers)
            path = Path(str(page.path).replace(".md", ".html"))
            html[str(path)] = self.md.markdown(source)
        return html

    def __save_as_svelte(self, destination, html):
        """
        Parameters:
            destination: Root folder for existing svelte project
            html: Writes out the svelte files to the content folder

        Saves the svelte project. This requires an existing svelte project
        to write to. It overwrites the App.svelte file at a later point.
        """
        for path in html:
            file_path = Path(str(path).replace(str(self.profile.source) + "/", ""))
            base = os.path.join(destination, "src/content")
            svelte_path = os.path.join(base, file_path)
            svelte_path = svelte_path.replace(".html", ".svelte")
            svelte_path = svelte_path.replace(" ", "_")
            if not os.path.exists(os.path.dirname(svelte_path)):
                try:
                    os.makedirs(os.path.dirname(svelte_path))
                except OSError as e:
                    if e.errno != errno.EEXIST:
                        print(e)
                        print("save_as_svelte: Error creating base folders")
                    print(e)
            try:
                with open(svelte_path, "w") as f:
                    f.write(html[path])
            except OSError as e:
                print(e)
                print("save_as_svelte: file does not exist")


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


