"""
Links

Issues:
- Overrite question links - either priority quizzes or exclude them here (or create a way to exclude when importing the library)
"""
import os
import re


class Links:
    def __init__(self, markdown_pages, profile):
        self.markdown_pages = markdown_pages
        self.profile = profile

    def __get_svelte_path(self, tag_title):
        for page in self.markdown_pages:
            if (
                tag_title == self.markdown_pages[page].markdown_link
                or tag_title == self.markdown_pages[page].markdown_relative_path
            ):
                return (
                    '<a href="/'
                    + self.markdown_pages[page].svelte_path
                    + '" use:link>'
                    + tag_title
                    + "</a>"
                )
        return "/"

    def __process_matches(self, page, content, matches):
        for match in matches:
            to_replace = match[0].strip()
            tag_title = match[1].strip()
            content = content.replace(to_replace, self.__get_svelte_path(tag_title))
        return content

    def __get_all_possible_links(self, page):
        return re.findall("[^$!](\[\[(.*?)\]\])", page)

    def run(self):
        for page in self.markdown_pages:
            content = self.markdown_pages[page].content
            matches = self.__get_all_possible_links(content)
            if len(matches) > 0:
                self.markdown_pages[page].add_header(
                    'import { link } from "svelte-spa-router";'
                )
                content = self.__process_matches(page, content, matches)
                self.markdown_pages[page].update_page(content)
        return self.markdown_pages
