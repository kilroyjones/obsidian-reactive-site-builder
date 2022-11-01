"""
Class: Images

Description:

   This takes in the profile and rendered content and builds the site from it. It will
   create a menu, move assets and add headers (CSS) as found in the template folder.

Methods:
    __copy_assets
    __save_site
    __get_header
    __get_page_template
    __get_navigation_menu

Issues:
    - Doesn't support resized images
    - Doesn't support images in subfolders (see moving assets in SiteBuilder)
    - Needs to programmatically detect image types

"""
import re
from pathlib import Path


class Images:
    def __init__(self, markdown_pages):
        self.markdown_pages = markdown_pages

    def __replace_image(self, content, to_replace, image):
        """
        We need the first check and addition of the "assets/" due to the way Obsidian 
        handles images, leaving some with the full path and others without. 
        """
        if not re.search(r"assets.*", image):
            image = "assets/" + image
        image = '<img src="/{}" alt="{}">'.format(image, image)
        return content.replace(to_replace, image)

    def __is_image(self, image):
        """
        TODO: 
            - Add support for programmatic detection of image types.
        """
        suffix = Path(image).suffix[1:]
        suffixes = ["jpg", "jpeg", "png", "gif", "bmp", "tiff", 
                    "svg", "webp", "svg", "avif", "ico", "apng"]
        if suffix.lower() in suffixes:
            return True
        return False

    def __process_matches(self, content, matches):
        for match in matches:
            to_replace = match[0].strip()
            image = match[1].strip()
            if self.__is_image(image):
                content = self.__replace_image(content, to_replace, image)
        return content

    def __get_all_possible_images(self, page):
        """
        Get all images in the format ![[ image name here ]]
        """
        return re.findall("(!\[\[(.*?)\]\])", page)

    def run(self):
        for page in self.markdown_pages:
            content = page.content
            matches = self.__get_all_possible_images(content)
            if len(matches) > 0:
                page.content = self.__process_matches(content, matches)
        return self.markdown_pages
