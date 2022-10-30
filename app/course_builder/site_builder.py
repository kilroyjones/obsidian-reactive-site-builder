from distutils.command.build import build
import os
import shutil
from pathlib import Path


class SiteBuilder:
    def __init__(self, profile, render, build_path):
        self.profile = profile
        self.render = render
        self.build_path = build_path
        self.__copy_assets()
        self.__save_site()

    def __copy_assets(self):
        for asset_source in self.profile.asset_paths:
            asset_dest = os.path.relpath(asset_source, self.profile.source).replace(
                " ", "_"
            )
            asset_dest = Path(os.path.join(self.build_path, asset_dest))
            asset_dest.parent.mkdir(exist_ok=True, parents=True)
            shutil.copy(asset_source, asset_dest)

    def __save_site(self):
        # menu = __get_menu(pages)
        header = self.__get_header()
        page_template = self.__get_page_template("./templates/page.html")
        shutil.copy("./templates/css/page.css", self.build_path + "/assets/page.css")
        menu = self.__get_menu(self.render.pages)
        print(menu)


        # fix with regex
        page_template = page_template.replace("{{header}}", header)
        for page in self.render.pages:
            path = Path(os.path.join(self.build_path, page.output_path))
            path.parent.mkdir(exist_ok=True, parents=True)
            with open(path, "w") as f:
                html = page_template.replace("{{menu}}", menu)
                html = html.replace("{{body}}", page.rendered)
                f.write(html)
                # f.write(page_template.replace("{{body}}", page.rendered))

    def __get_header(self):
        return '<link rel="stylesheet" type="text/css" href="/assets/page.css">'

    def __get_page_template(self, filename):
        try:
            with open(filename) as f:
                return f.read()
        except Exception as e:
            print("[get_header] -", e)

    def __get_menu(self, pages):
        menu = []
        menu_item = '<div class="navigation-item"><a href="/{}">{}</a></div>'
        for page in pages:
            if page.is_base_homepage:
                menu.append(menu_item.format(page.output_path, page.section))
        return '\n'.join(reversed(menu))