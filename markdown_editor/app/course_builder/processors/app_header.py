# """
# Compiles svelte routes
# """

import os


class AppHeader:
    def __init__(self, pages, params):
        self.pages = pages
        self.profile = params[0]
        self.source = params[1]

    def __get_app_header(self):
        source = os.path.join(self.source, "template/App.svelte")
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
        for section in self.profile.sections:
            path = os.path.join("/", section.replace(" ", "_"))
            link = template.replace("$$PATH$$", path)
            link = link.replace("$$TITLE$$", section)
            sidebar += link + '"\n'
        return app_header.replace("$$SIDEBAR$$", sidebar)

    def run(self):
        app_header = self.__get_app_header()
        app_header = self.__add_routes(app_header)
        app_header = self.__add_imports(app_header)
        app_header = self.__add_sidebar(app_header)

        source = os.path.join(self.source, "src/App.svelte")
        with open(source, "w") as f:
            f.write(app_header)
