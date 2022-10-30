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

import markdown as md
from page import Page


class SiteRender:
    def __init__(self, profile, processors):
        """
        Parameters:
            profile: Create in profile.py a contains project data
            markdown: Is the markdown processor
            processors: A list of classes that will be run on the markdown (plugins)
        """
        self.profile = profile
        self.processors = processors
        self.pages = self.__render()

    def __render(self):
        """
        Parameters:
            output_path: destination folder


        Primary function for the builder.
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
            for path in self.profile.section_pages[section]:
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
        except Exception as e:
            print("[__read_file]", e)

    def __run_processors(self, pages):
        """
        Parameters:
            markdown_pages: dictionary of markdown pages

        Loops through the processors and executes them using the run method.
        """
        for Processor in self.processors:
            processor = Processor(pages, self.profile)
            pages = processor.run()
        return pages 

    def __render_html(self, markdown_pages):
        """
        Converts all the markdown to html and updates the markdown_pages object.
        """
        print(md)
        print(markdown_pages)
        for page in markdown_pages:
            page.rendered = md.markdown(page.content)
        return markdown_pages
