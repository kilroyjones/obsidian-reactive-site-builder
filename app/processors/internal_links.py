"""
Class: Links

Description:

    This is a plugin/processor that loaded with the Builder class (builder.py)
    It looks for links within markdown files and formatted in the Obsidian/Roam
    style and links them to others within the vault. 

    This is internal links, meaning links within the vault. Extenal links are 
    handled by the markdown renderer. 

Methods:
    __get_link
    __process_matches
    run

Issues:
    - Would like to remove the hard formmated svelte links by adding a config
      file that loads the link format. 
    - One other possible issue is overlaps with other "link" like structures. 
"""

import re


class InternalLinks:
    def __init__(self, markdown_pages):
        self.markdown_pages = markdown_pages

    def __get_link(self, link_title):
        """
        Parameters:
            link_title: The value inside the link (ie. the path) [[ link_title ]]
        """
        link = '<a href="/{}">{}</a>'
        for page in self.markdown_pages:
            if (
                link_title == page.markdown_link
                or link_title == page.markdown_relative_path
            ):
                return link.format(page.output_path, link_title)
        return None

    def __process_matches(self, content, matches):
        """
        Parameters:
            content: The content of the markdown page.
            matches: All links within the page.
        """
        for match in matches:
            to_replace = match[0].strip()
            link_title = match[1].strip()
            link = self.__get_link(link_title)
            if link:
                content = content.replace(to_replace, link)
        return content

    def __get_all_possible_links(self, content):
        """
        Parameters:
            content: The content of the Markdown page.

        Finds all links while avoid images (!)
        """
        return re.findall("[^$!](\[\[(.*?)\]\])", content)

    def run(self):
        for page in self.markdown_pages:
            matches = self.__get_all_possible_links(page.content)
            if len(matches) > 0:
                page.content = self.__process_matches(page.content, matches)
        return self.markdown_pages
