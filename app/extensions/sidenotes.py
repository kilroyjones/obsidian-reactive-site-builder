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


def __get_possible_sidenotes(content):
    """
    Sidenotes are creating in Obsidian using the pattern ${{ place note here }}
    """
    return re.findall("(\${{(.*?)}})", content)

def __process_matches(content, matches):
    """
    Hacky bit here is closing a p tag and opening again. Since aside tags break the 
    original p tag, if there is one, it'll cause the browser to try and close the one
    that started the paragraph. The closing one then becomes <p></p>, leaving the
    remaining portion of the paragraph unformatted. 
    """
    for match in matches:
        to_replace = match[0].strip()
        tag_title = match[1].strip()
        sidenote = "</p><aside>" + tag_title + "</aside><p>"
        content = content.replace(to_replace, sidenote)
    return content

def run(page):
    content = page.rendered
    matches = __get_possible_sidenotes(content)
    if len(matches) > 0:
        page.rendered = __process_matches(content, matches)
    return page
