from markdown.extensions import Extension
from markdown.inlinepatterns import InlineProcessor
import xml.etree.ElementTree as etree
import os
import re


# class Links:
#     def __init__(self, markdown_pages, profile):
#         self.markdown_pages = markdown_pages
#         self.profile = profile

#     def __replace_links(self, content, path, to_replace, title):
#         svelte_path = path.replace(" ", "_")
#         link = '<a href="/' + svelte_path + '" use:link>' + title + "</a>"
#         return content.replace(to_replace, link)

#     def __process_matches(self, page, content, matches):
#         for match in matches:
#             to_replace = match[0].strip()
#             tag_title = match[1].strip()
#             path = self.__get_path(page, tag_title)
#             content = self.__replace_links(content, path, to_replace, tag_title)
#         return content

#     def run(self):
#         for page in self.markdown_pages:
#             content = self.markdown_pages[page].page
#             matches = self.__get_all_possible_links(content)
#             if len(matches) > 0:
#                 self.markdown_pages[page].add_header(
#                     'import { link } from "svelte-spa-router";'
#                 )
#                 content = self.__process_matches(page, content, matches)
#                 self.markdown_pages[page].update_page(content)
#         return self.markdown_pages


class LinksProcessor(InlineProcessor):
    def __init__(self, pattern, config):
        self.profile = config.get("profile", False)[0]
        InlineProcessor.__init__(self, pattern)

    def __get_path(self, page, tag_title):
        for section in self.profile.section_pages:
            for page_path in self.profile.section_pages[section]:
                if tag_title + ".md" in page_path:
                    page_path = page_path.replace(str(self.profile.source) + "/", "")
                    if page_path[-3:] == ".md":
                        return page_path[:-3]
                    return page_path
        return "/"

    def handleMatch(self, m, data):
        el = etree.Element("del")
        el.text = m.group(1)
        return el, m.start(0), m.end(0)


class LinkExtension(Extension):
    def __init__(self, **kwargs):
        self.config = {
            "profile": [kwargs["profile"], "course profile"],
        }
        super(LinkExtension, self).__init__(**kwargs)

    def extendMarkdown(self, md):
        inks = LinksProcessor(r"[^!$](\[\[[^!](.*?)\]\])", self.config)
        md.inlinePatterns.register(links, "links", 175)


def makeExtension(*args, **kwargs):
    return LinkExtension(**kwargs)
