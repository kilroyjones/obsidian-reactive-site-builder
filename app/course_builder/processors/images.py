"""
Images
"""
import os
import re


class Images:
    def __init__(self, markdown_pages, profile):
        self.markdown_pages = markdown_pages
        self.profile = profile

    def __replace_image(self, content, to_replace, image):
        image = '<img src="/assets/{}" alt="{}">'.format(image, image)
        return content.replace(to_replace, image)

    def __is_image(self, image):
        suffix = image.split(".")[-1].lower()
        #TODO: Detect more images - programmatically open all files and determine type 
        suffixes = ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "svg"]
        if suffix in suffixes:
            return True
        return False

    def __process_matches(self, page, content, matches):
        for match in matches:
            to_replace = match[0].strip()
            image = match[1].strip()
            if self.__is_image(image):
                content = self.__replace_image(content, to_replace, image)
        return content

    def __get_all_possible_images(self, page):
        return re.findall("(!\[\[(.*?)\]\])", page)

    def run(self):
        for page in self.markdown_pages:
            content = page.content
            matches = self.__get_all_possible_images(content)
            if len(matches) > 0:
                page.content = self.__process_matches(page, content, matches)
        return self.markdown_pages
