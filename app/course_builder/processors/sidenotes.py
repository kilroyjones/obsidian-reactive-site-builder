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

    def __get_possible_sidenotes(self, page):
        return re.findall("(\${{(.*?)}})", page)

    def __process_matches(self, content, matches):
        for match in matches:
            to_replace = match[0].strip()
            tag_title = match[1].strip()
            sidenote = "<aside>" + tag_title + "</aside>"
            content = content.replace(to_replace, sidenote)
        return content

    def run(self):
        for page in self.markdown_pages:
            content = page.content
            matches = self.__get_possible_sidenotes(content)
            print(matches)

            if len(matches) > 0:
                page.content = self.__process_matches(content, matches)
                # print(page.content)
        return self.markdown_pages
