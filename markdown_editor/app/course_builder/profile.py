"""
Class: profile

Description:

    Contains all information about the course being parsed. The source folder 
    should be the base folder of the project and conform to the Obsidian 
    format. 

Methods:
    get_sections
    get_section_pages
    get_page_paths

Issues:
    - Currently only works with one level under each section, so nested
      folders will not be included.
    
    - Assets folder not yet included.

"""

import os


class Profile:
    def __init__(self, source):
        """
        Parameters:
            source: base folder of the project
        """
        self.source = source
        self.sections = self.get_sections()
        self.section_pages = self.get_section_pages()
        self.page_paths = self.get_page_paths()

    def get_sections(self):
        """
        Gets all folders which are not the asset folder. These files should
        contain markdown to be rendered.
        """
        try:
            sections = []
            items = os.listdir(self.source)
            for item in items:
                item_with_path = os.path.join(self.source, item)
                if os.path.isdir(item_with_path) and str(item + ".md") in items:
                    sections.append(item)
            return sections

        except OSError as e:
            print(e)
            print("get_sections: Unable to open the source folder " + self.source)

    def get_section_pages(self):
        """
        Gets all the pages within the sections and returns a dictionary where
        the key is the section folder and the contents are the markdown page
        files.

        Known issues: This process only returns file immediately in the folder
        and is not recursive.
        """
        try:
            section_pages = {}
            for section in self.sections:
                pages_path = os.path.join(self.source, section)
                section_pages[section] = os.listdir(pages_path)
            return section_pages
        except OSError as e:
            print(e)
            print("get_section_pages: Unable to read files from the given folder")

    def get_page_paths(self):
        """
        Gets all markdown file paths. These paths are with respect to the base
        course folder.
        """
        try:
            page_paths = []
            for section in self.sections:
                pages_path = os.path.join(self.source, section)
                page_paths.append(section + ".md")
                for page in os.listdir(pages_path):
                    page = page.replace(" ", "_")
                    page_paths.append(os.path.join(section, page))
            return page_paths
        except OSError as e:
            print(e)
            print("get_path_pages: Unable to read file from the given folder")


if __name__ == "__main__":
    course_profile = Profile("../course")
    print(course_profile.sections)
    print(course_profile.section_pages)
    print(course_profile.page_paths)
