"""
Class: SiteRender

Description:

   This takes in the profile and rendered content and builds the site from it. It will
   create a menu, move assets and add headers (CSS) as found in the template folder.

Methods:
   copy_assets
   save_site
    __get_header
    __get_page_template
    __get_navigation_menu

Issues:

"""
import os
import logging
import re
import shutil
from pathlib import Path


class SiteBuilder:
    def __init__(self, profile, render, build_path):
        """
        Parameters:
            profile: from SiteProfile, contains project file overview
            render: from SiteRender and contains the rendered individual page content
            build_path: where the final generated site will be saved
        """
        self.profile = profile
        self.render = render
        self.build_path = build_path

    def copy_assets(self):
        """
        Copy all assets from the assets folder, including the primary stylesheet,
        replacing spaces with underscores to avoid issues with the url.
        """

        for asset_source in self.profile.asset_paths:
            asset_dest = os.path.relpath(asset_source, self.profile.source)
            asset_dest = asset_dest.replace(" ", "_")
            asset_dest = Path(os.path.join(self.build_path, asset_dest))
            asset_dest.parent.mkdir(exist_ok=True, parents=True)
            try: 
                shutil.copy(asset_source, asset_dest)
            except Exception: 
                logging.exception("Error copying ")

        try: 
            css_source = os.path.join(self.profile.source, '.theme/page.css')
            css_dest = os.path.join(self.build_path, 'assets/page.css')
            shutil.copy(css_source, css_dest)
        except Exception: 
            logging.exception("Error copying page.css to asssets folder!")

    def save_site(self):
        """
        This uses the page.html template and adds the head information along with the
        menu. It then writes these files out to the build folder.
        """
        header = self.__get_header()
        menu = self.__get_navigation_menu(self.render.pages)
        page_template = self.__get_page_template(os.path.join(self.profile.source, '.theme/page.html'))
        page_template = re.sub("{{\s*header\s*}}", header, page_template)

        for page in self.render.pages:
            path = Path(os.path.join(self.build_path, page.output_path))
            path.parent.mkdir(exist_ok=True, parents=True)
            try: 
                with open(path, "w") as f:
                    html = re.sub("{{\s*menu\s*}}", menu, page_template)
                    html = re.sub("{{\s*body\s*}}", page.rendered, html)
                    f.write(html)
            except Exception: 
                logging.exception("Error opening output file ({}) for writing!".format(page.path))

    def __get_header(self):
        """
        TODO:
            - Need to add these sorts elsewhere instead of hardcoding them.
        """
        return '<link rel="stylesheet" type="text/css" href="/assets/page.css">'

    def __get_page_template(self, filename):
        """
        Parameters:
            - filename: reads in the template to be used.
        TODO:
            - Provide proper error messages
        """
        try:
            with open(filename) as f:
                return f.read()
        except Exception:
            logging.exception("Error reading page.html template")

    def __get_navigation_menu(self, pages):
        """
        Parameters:
            - Takes in the list of rendered pages.

        If the homepage is with a folder at the 'root' level of the Obsidian vault it
        creates a menu item for it.
        """
        menu = []
        menu_item = '<div class="navigation-item"><a href="/{}">{}</a></div>'
        homepage = ''
        for page in pages:
            if page.is_navigation_item:
                menu.append(menu_item.format(page.output_path, page.section_title))
            if page.is_homepage:
                homepage = '<div class="navigation-item homepage"><a href="/{}">Home</a></div>'
                homepage = homepage.format(page.output_path)
        return homepage + "\n".join(reversed(menu))
