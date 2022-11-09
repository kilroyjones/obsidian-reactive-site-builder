"""
Class: Links

Description:

    This is a plugin/processor that loaded with the Builder class (builder.py)
    It looks for links within markdown files and formatted in the Obsidian/Roam
    style and links them to others within the vault. 

    This is internal links, meaning links within the vault. Extenal links are 
    handled by the markdown renderer. 

Methods:
    __process_matches
    run

Issues:
    - Would like to remove the hard formmated svelte links by adding a config
      file that loads the link format. 
    - One other possible issue is overlaps with other "link" like structures. 
"""

import re

def __process_matches(page, content, matches):
    """
    Parameters:
        content: The content of the markdown page.
        matches: All links within the page.
    """
    url = '<a href="/{}.html">{}</a>'
    for match in matches:
        to_replace = match[0].strip()
        href = match[1].strip()
        content = content.replace(to_replace, url.format(href, href))
    return content

def __get_all_possible_links(content):
    """
    Parameters:
        content: The content of the Markdown page.

    Finds all links while avoid images (!)
    """
    return re.findall("[^$!](\[\[(.*?)\]\])", content)

def run(page):
    content = page.rendered
    matches = __get_all_possible_links(content)
    if len(matches) > 0:
        page.rendered = __process_matches(page, content, matches)
    return page 
