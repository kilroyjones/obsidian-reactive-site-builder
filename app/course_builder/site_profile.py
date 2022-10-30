"""
Class: Profile

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
      - RESOLVED: Should be fixed at this point
     
    
    - Assets folder not yet included.
      - RESOLVED: Assets included as assets_paths

"""
#
# from genericpath import isfile
import os

# import glob
from pathlib import Path


class SiteProfile:
    def __init__(self, source):
        """
        Parameters:
            source: base folder of the project
        """
        self.source = source
        self.sections = self.get_sections()
        self.section_pages = self.get_section_pages()
        self.markdown_paths = self.get_markdown_paths()
        self.asset_paths = self.get_assets_paths()
        # self.quizzes_paths = self.get_quizzes_paths() # Currently unsupported:q

    def get_sections(self):
        """
        Gets all folders which are not the asset folder. These files should
        contain markdown to be rendered.
        """
        try:
            sections = []
            for section in os.listdir(self.source):
                section_path = os.path.join(self.source, section)
                if os.path.isdir(section_path):
                    if "index.md" in os.listdir(section_path):
                        sections.append(section)
            return sections

        except Exception as e:
            print("[get_sections]", e)

    def get_section_pages(self):
        """
        Gets all the pages within the sections and returns a dictionary where
        the key is the section folder and the contents are the markdown page
        files.

        Issues:
            - This process only returns file immediately in the folder and is not recursive.
                - [RESOLVED]
        """
        try:
            section_pages = {}
            for section in self.sections:
                section_path = os.path.join(self.source, section)
                section_pages[section] = []
                for file_path in Path(section_path).rglob("*.md"):
                    section_pages[section].append(str(file_path))
            return section_pages

        except Exception as e:
            print("[get_section_pages]", e)

    def get_markdown_paths(self):
        """
        Gets the paths of the file as key with the markdown file name as the value.

        Issues:
            - Rewrite to use os walk to get full tree and scan that way?
        """
        try:
            paths = {}
            for section in self.section_pages:
                for page in self.section_pages[section]:
                    route = str(page).replace(" ", "_")
                    page = os.path.basename(route)
                    paths[route] = page
            return paths

        except Exception as e:
            print("[get_paths]", e)

    def get_assets_paths(self):
        """
        Gets the assets paths as key with the filename name as value.

        Issues: Use os walk to get full tree and scan that way.
        """
        try:
            asset_paths = {}
            path = os.path.join(self.source, "assets")
            for asset_path in Path(path).rglob("*"):
                asset = os.path.relpath(asset_path, path)
                if os.path.isfile(asset_path):
                    asset_paths[str(asset_path)] = asset
            return asset_paths

        except Exception as e:
            print("[get_assets_paths]", e)


if __name__ == "__main__":
    course_profile = SiteProfile("../course")
    print("\nSections ------------")
    print(course_profile.sections)

    print("\nSection Pages ------------")
    print(course_profile.section_pages)

    print("\Markdown paths ------------")
    print(course_profile.markdown_paths)

    print("\nAssests Paths ------------")
    print(course_profile.asset_paths)


    for section in course_profile.section_pages:
        print(section)
        for d in course_profile.section_pages[section]: 
            print('\t', d)
    # Currently not including this
    # print("\Quizzes Paths ------------")
    # print(course_profile.quizzes_paths)
