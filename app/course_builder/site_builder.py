"""
Class: SiteBuilder

Description:

    This takes in the site profile and rendered pages and outputs the site 
    to the specified path. It also connects the rendered pages and generates
    the menu system.
    
Methods:

Issues:

"""
import os
import shutil
import re
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
        self.__copy_assets()
        self.__save_site()

    def __copy_assets(self):
        """
        Copy all assets from the assets folder, including the primary stylesheet,
        replacing spaces with underscores to avoid issues with the url.

        TODO:
            - Provide proper error handling
        """
        shutil.copy("./templates/css/page.css", self.build_path + "/assets/page.css")
        for asset_source in self.profile.asset_paths:
            asset_dest = os.path.relpath(asset_source, self.profile.source).replace(
                " ", "_"
            )
            asset_dest = Path(os.path.join(self.build_path, asset_dest))
            asset_dest.parent.mkdir(exist_ok=True, parents=True)
            shutil.copy(asset_source, asset_dest)

    def __save_site(self):
        """
        This uses the page.html template and adds the head information along with the
        menu. It then writes these files out to the build folder.

        TODO:
            - Provide proper error handling
        """
        header = self.__get_header()
        page_template = self.__get_page_template("./templates/page.html")
        menu = self.__get_navigation_menu(self.render.pages)

        # fix with regex
        page_template = re.sub("{{\s*header\s*}}", header, page_template)
        for page in self.render.pages:
            path = Path(os.path.join(self.build_path, page.output_path))
            path.parent.mkdir(exist_ok=True, parents=True)
            with open(path, "w") as f:
                html = re.sub("{{\s*menu\s*}}", menu, page_template)
                html = re.sub("{{\s*body\s*}}", page.rendered, html)
                f.write(html)

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
        except Exception as e:
            print("[get_header] -", e)

    def __get_navigation_menu(self, pages):
        """
        Parameters:
            - Takes in the list of rendered pages.

        If the homepage is with a folder at the 'root' level of the Obsidian vault it
        creates a  menu item for it.
        """
        menu = []
        menu_item = '<div class="navigation-item"><a href="/{}">{}</a></div>'
        for page in pages:
            if page.is_base_homepage:
                menu.append(menu_item.format(page.output_path, page.section_title))
        return "\n".join(reversed(menu))
