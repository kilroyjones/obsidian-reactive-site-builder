"""
Class: Sidenotes

Description:

    Creates sidenotes along the right side. See the global.css for the styling 
    of the aside tag.  

Methods:
    __get_possible_sidenotes
    __process_matches
    run

"""
import re


class Sidenotes:
    def __init__(self, markdown_pages):
        self.markdown_pages = markdown_pages

    def __get_possible_sidenotes(self, page):
        """
        Sidenotes are creating in Obsidian using the pattern ${{ place note here }}
        """
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
            matches = self.__get_possible_sidenotes(page.content)
            if len(matches) > 0:
                page.content = self.__process_matches(page.content, matches)
        return self.markdown_pages
