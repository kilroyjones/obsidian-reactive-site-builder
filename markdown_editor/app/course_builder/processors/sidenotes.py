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
            content = self.markdown_pages[page].page
            matches = self.__get_all_possible_sidenotes(content)
            if len(matches) > 0:
                content = self.__process_matches(content, matches)
                self.markdown_pages[page].update_page(content)
        return self.markdown_pages
