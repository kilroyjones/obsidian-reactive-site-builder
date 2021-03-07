# """
# Compiles svelte routes
# """

import os


class AppHeader:
    def __init__(self, markdown_pages, profile, svelte_path):
        self.markdown_pages = markdown_pages
        self.profile = profile
        self.svelte_path = svelte_path

    def __get_app_header(self):
        source = os.path.join(self.svelte_path, "template/App.svelte")
        with open(source) as f:
            app_header = f.read()
        return app_header

    def __add_routes(self, app_header):
        routes = ""
        for path in self.profile.svelte_paths:
            routes += '"' + path + '": ' + self.profile.svelte_paths[path] + ",\n"
        return app_header.replace("$$ROUTES$$", routes)

    def __add_imports(self, app_header):
        imports = ""
        for path in self.profile.svelte_paths:
            component = self.profile.svelte_paths[path]
            imports += "import " + component + ' from "./content' + path + '.svelte";\n'
        return app_header.replace("$$IMPORTS$$", imports)

    def __add_sidebar(self, app_header):
        sidebar = ""
        template = '<a href="$$PATH$$" use:link use:active>$$TITLE$$</a><br />'
        sidebar += "<Accordion>"
        structure = {}
        for page in self.markdown_pages:
            if page.section not in structure:
                structure[page.section] = [page.filename[:-3]]
            else:
                structure[page.section].append(page.filename[:-3])

        for section in structure:
            sidebar += (
                "<Accordion.Section title={'"
                + section
                + '\'}><div class="section-content">'
            )
            for page in structure[section]:
                path = os.path.join("/", section.replace(" ", "_") + "/" + page)
                link = template.replace("$$PATH$$", path)
                link = link.replace("$$TITLE$$", page)
                sidebar += link + "\n"
            sidebar += "</div></Accordion.Section>"
        sidebar += "</Accordion>"
        return app_header.replace("$$SIDEBAR$$", sidebar)

    def run(self):
        app_header = self.__get_app_header()
        app_header = self.__add_routes(app_header)
        app_header = self.__add_imports(app_header)
        app_header = self.__add_sidebar(app_header)

        source = os.path.join(self.svelte_path, "src/App.svelte")
        with open(source, "w") as f:
            f.write(app_header)
