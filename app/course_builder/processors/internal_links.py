"""
Class: Links

Description:

    This is a plugin/processor that loaded with the Builder class (builder.py)
    It looks for links within markdown files and formatted in the Obsidian/Roam
    style and links them to others within the same root folder. 

Methods:
    __get_svelte_path
    __process_matches
    run

Issues:
    - Would like to remove the hard formmated svelte links by adding a config
      file that loads the link format. 
    - One other possible issue is overlaps with other "link" like structures. 
"""

import os
import re


class InternalLinks:
    def __init__(self, markdown_pages, profile):
        """
        Parameters:
            markdown_pages: List of MarkdownPage objects
            profile: Single Profile object containing project properties
        """
        self.markdown_pages = markdown_pages
        self.profile = profile

    def __get_paths(self, link_title):
        """
        Parameters:
            link_title: The value inside the link (ie. the path) [[ link_title ]]

        This method loops over all the markdown pages which are not quizzes and
        replaces the gives link_title [[ link goes here ]] with a svelte style
        link.
        """
        link = '<a href="/{}.html">{}</a>'
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
            content: The content of the Markdown page.
            matches: All links within the page.

        This loops over all the matches that were found in a single markdown page
        and replaces those which are valid and link to other pages within the project
        structure. If no link is found it skips the object.
        """
        for match in matches:
            to_replace = match[0].strip()
            link_title = match[1].strip()
            new_value = self.__get_paths(link_title)
            if new_value:
                content = content.replace(to_replace, new_value)
        return content

    def __get_all_possible_links(self, content):
        """
        Parameters:
            content: The content of the Markdown page.

        Finds all links while avoiding sidenotes ($) and images (!)
        """
        return re.findall("[^$!](\[\[(.*?)\]\])", content)

    def run(self):
        """
        Parameters:
            None

        Loops through all markdown pages and finds those that contain links. It adds
        the svelte header and then processes those matches and updates the content
        of the page.
        """
        for page in self.markdown_pages:
            matches = self.__get_all_possible_links(page.content)
            if len(matches) > 0:
                page.content = self.__process_matches(page.content, matches)
        return self.markdown_pages
