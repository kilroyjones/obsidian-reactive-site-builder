"""
Class: Sidenotes

Description:

    Creates sidenotes along the right side. See the global.css for the styling 
    of the aside tag.  

Methods:


Issues:
    - Probably should clean up some of the naming scheme (output_markdown)
"""
import os
import re


class Sidenotes:
    def __init__(self, markdown_pages, profile):
        self.markdown_pages = markdown_pages
        self.profile = profile

    def __get_all_possible_sidenotes(self, page):
        return re.findall("(\$\[\[(.*?)\]\])", page)

    def __process_matches(self, content, matches):
        for match in matches:
            to_replace = match[0].strip()
            tag_title = match[1].strip()
            sidenote = "<aside>" + tag_title + "</aside>"
        return content.replace(to_replace, sidenote)

    def run(self):
        for page in self.markdown_pages:
            content = page.content
            matches = self.__get_all_possible_sidenotes(content)
            if len(matches) > 0:
                page.content = self.__process_matches(content, matches)
        return self.markdown_pages
