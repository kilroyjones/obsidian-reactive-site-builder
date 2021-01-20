"""
Links
"""
import os
import re


class Links:
    def __init__(self, markdown_pages, profile):
        self.markdown_pages = markdown_pages
        self.profile = profile

    def __replace_links(self, content, path, to_replace, title):
        svelte_path = path.replace(" ", "_")
        link = '<a href="/' + svelte_path + '" use:link>' + title + "</a>"
        return content.replace(to_replace, link)

    def __get_path(self, page, tag_title):
        for section in self.profile.section_pages:
            for page_path in self.profile.section_pages[section]:
                if tag_title + ".md" in page_path:
                    page_path = page_path.replace(str(self.profile.source) + "/", "")
                    if page_path[-3:] == ".md":
                        return page_path[:-3]
                    return page_path
        return "/"

    def __process_matches(self, page, content, matches):
        for match in matches:
            to_replace = match[0].strip()
            tag_title = match[1].strip()
            path = self.__get_path(page, tag_title)
            content = self.__replace_links(content, path, to_replace, tag_title)
        return content

    def __get_all_possible_links(self, page):
        return re.findall("[^!](\[\[(.*?)\]\])", page)

    def __append_svelte_header(self, page):
        header = '<script> import { link } from "svelte-spa-router"; </script>'
        return header + "\n" + page

    def run(self):
        for page in self.markdown_pages:
            content = self.markdown_pages[page]
            matches = self.__get_all_possible_links(content)
            if len(matches) > 0:
                content = self.__append_svelte_header(content)
                content = self.__process_matches(page, content, matches)
                self.markdown_pages[page] = content
        return self.markdown_pages
