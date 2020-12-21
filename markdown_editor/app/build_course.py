import markdown as md
import prettierfier
import shutil
import os
import re


class BuildCourse:
    def __init__(self, source_path, destination_path):
        self.source_path = source_path
        self.destination_path = destination_path
        self.sections = []
        self.section_pages = {}
        self.all_page_paths = []
        self.load()

    def load(self):
        files = os.listdir(self.source_path)
        for item in files:
            file_path = os.path.join(self.source_path, item)
            if os.path.isdir(file_path) and str(item + ".md") in files:
                self.section_pages[item] = os.listdir(
                    os.path.join(self.source_path, item)
                )
                self.sections.append(item)
                self.all_page_paths.append(item)
                self.all_page_paths += [
                    item + "/" + page[:-3].replace(" ", "_")
                    for page in os.listdir(os.path.join(self.source_path, item))
                ]

    def create(self):
        for section in self.section_pages:
            source = os.path.join(self.source_path, section + ".md")
            destination = os.path.join(
                self.destination_path, section.capitalize() + ".svelte"
            )

            self.convert_page(section, source, destination)
            self.clean_directory(self.destination_path, section)

            for page in self.section_pages[section]:
                source = os.path.join(self.source_path, section, page)
                destination = os.path.join(
                    self.destination_path,
                    section,
                    page[:-3].capitalize().replace(" ", "_")
                    + "_"
                    + section.capitalize()
                    + ".svelte",
                )
                self.convert_page(section, source, destination)

    def convert_page(self, section, source, destination):
        page = ""
        with open(source) as f:
            page = md.markdown(f.read())
            page = self.parse_page_links(section, page)
        with open(destination, "w") as f:
            f.write('<script> import { link } from "svelte-spa-router"; </script>')
            f.write(prettierfier.prettify_html(page))

    def clean_directory(self, destination_path, section):
        path = os.path.join(destination_path, section)
        if os.path.exists(path):
            shutil.rmtree(path)
        os.mkdir(path)

    def parse_page_links(self, section, page_content):
        matches = re.findall("(\[\[(.*?)\]\])", page_content)

        for match in matches:
            md, link = match[0].strip(), match[1].strip()
            title = link
            if link in self.section_pages:
                pass
            elif "/" not in link:
                title = link
                link = section + "/" + link.replace(" ", "_")
            if link in self.all_page_paths:
                page_content = page_content.replace(
                    md, '<a href="/' + link + '" use:link>' + title + "</a>"
                )
        return page_content

    def create_routes(self):
        with open("./app/svelte-site/site_template/App.svelte") as f:
            app_svelte = f.read()

        routes = ""
        imports = ""
        sidebar = ""
        for section in self.sections:
            section_capped = section.capitalize()
            routes += '"/' + section + '": ' + section_capped + ",\n"
            imports += (
                "import "
                + section_capped
                + ' from "./content/'
                + section_capped
                + '.svelte";'
                + "\n"
            )
            sidebar += (
                '<a href="/'
                + section
                + '" '
                + "use:link use:active>"
                + section_capped
                + "</a><br>"
                + "\n"
            )

        for section in self.sections:
            section_capped = section.capitalize()
            for page in self.section_pages[section]:
                page = page[:-3].replace(" ", "_")
                page_capped = page.capitalize()
                page_with_section = page_capped + "_" + section_capped
                routes += (
                    '"/' + section + "/" + page + '": ' + page_with_section + ",\n"
                )
                imports += (
                    "import "
                    + page_with_section
                    + ' from "./content/'
                    + section
                    + "/"
                    + page_with_section
                    + '.svelte";'
                    + "\n"
                )

        app_svelte = app_svelte.replace("//$$$IMPORTS$$$", imports)
        app_svelte = app_svelte.replace("//$$$ROUTES$$$", routes)
        app_svelte = app_svelte.replace("$$$SIDEBAR$$$", sidebar)
        with open("./app/svelte-site/src/App.svelte", "w") as f:
            f.write(app_svelte)
