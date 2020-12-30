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

import os
from pathlib import Path


class Profile:
    def __init__(self, source):
        """
        Parameters:
            source: base folder of the project
        """
        self.source = Path(source)
        self.sections = self.get_sections()
        self.section_pages = self.get_section_pages()
        self.svelte_paths = self.get_svelte_paths()
        self.assets_paths = self.get_asset_paths()

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
                section_pages[section] = []
                section_path = os.path.join(self.source, section)
                for file_path in Path(section_path).rglob("*.md"):
                    section_pages[section].append(file_path)
            return section_pages

        except OSError as e:
            print(e)
            print("get_section_pages: Unable to read files from the given folder")

    def get_svelte_paths(self):
        """
        Gets the svelte routes with the capitalized svelte components for building
        the App.svelte file.

        Issues: Use os walk to get full tree and scan that way.
        """
        try:
            svelte_paths = {}
            for section in self.section_pages:
                svelte_section = section.replace(" ", "_")
                svelte_paths["/" + svelte_section] = svelte_section.capitalize()
                for page in self.section_pages[section]:
                    route = str(page).replace(str(self.source), "")[:-3]
                    route = route.replace(" ", "_")
                    page = str(route[1:]).replace("/", "_")
                    svelte_paths[route] = page.capitalize()
            return svelte_paths

        except OSError as e:
            print(e)
            print("get_svelte_routes: Unable to read the source folder for listdir")

    def get_asset_paths(self):
        """
        Gets the svelte routes with the capitalized svelte components for building
        the App.svelte file.

        Issues: Use os walk to get full tree and scan that way.
        """
        try:
            assets_paths = {}
            path = os.path.join(self.source, "assets")
            for file_path in Path(path).rglob("*"):
                asset_path = str(file_path).replace(str(path) + "/", "")
                assets_paths[file_path] = asset_path
            return assets_paths

        except OSError as e:
            print(e)
            print("get_svelte_routes: Unable to read the source folder for listdir")


if __name__ == "__main__":
    course_profile = Profile("./app/course")
    print("\nSections ------------")
    print(course_profile.sections)

    print("\nSection Pages ------------")
    print(course_profile.section_pages)

    print("\nSvelte Paths ------------")
    print(course_profile.svelte_paths)

    print("\nAssests Paths ------------")
    print(course_profile.assets_paths)
