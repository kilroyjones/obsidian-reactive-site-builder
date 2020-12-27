"""
Links
"""
import os
import re


class Links:
    def __init__(self, pages, profile):
        self.pages = pages
        self.profile = profile

    def __replace(self, page, markdown_path, to_replace, title):
        svelte_path = markdown_path.replace(" ", "_")[:-3]
        link = '<a href="/' + svelte_path + '" use:link>' + title + "</a>"
        print(to_replace, link)
        self.pages[page] = self.pages[page].replace(to_replace, link)

    def __process_matches(self, page, matches):
        for match in matches:
            to_replace = match[0].strip()
            title = match[1].strip()
            markdown_path = match[1].strip() + ".md"
            if markdown_path in self.profile.markdown_paths:
                self.__replace(page, markdown_path, to_replace, title)
            else:
                for section in self.profile.section_pages:
                    if markdown_path in self.profile.section_pages[section]:
                        markdown_path = os.path.join(section, markdown_path)
                        self.__replace(page, markdown_path, to_replace, title)

    def run(self):
        header = '<script> import { link } from "svelte-spa-router"; </script>'
        for page in self.pages:
            matches = re.findall("(\[\[(.*?)\]\])", self.pages[page])
            self.pages[page] = header + "\n" + self.pages[page]
            self.__process_matches(page, matches)
        return self.pages
