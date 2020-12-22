# """
# Compiles svelte routes
# """


# class Routes:
#     def __init__(self, profile);
#         self.profile = profile

#     def run(self):
#         with open("./app/svelte-site/site_template/App.svelte") as f:
#             app_svelte = f.read()

#         routes = ""
#         imports = ""
#         sidebar = ""
#         for section in self.sections:
#             section_capped = section.capitalize()
#             routes += '"/' + section + '": ' + section_capped + ",\n"
#             imports += (
#                 "import "
#                 + section_capped
#                 + ' from "./content/'
#                 + section_capped
#                 + '.svelte";'
#                 + "\n"
#             )
#             sidebar += (
#                 '<a href="/'
#                 + section
#                 + '" '
#                 + "use:link use:active>"
#                 + section_capped
#                 + "</a><br>"
#                 + "\n"
#             )

#         for section in self.sections:
#             section_capped = section.capitalize()
#             for page in self.section_pages[section]:
#                 page = page[:-3].replace(" ", "_")
#                 page_capped = page.capitalize()
#                 page_with_section = page_capped + "_" + section_capped
#                 routes += (
#                     '"/' + section + "/" + page + '": ' + page_with_section + ",\n"
#                 )
#                 imports += (
#                     "import "
#                     + page_with_section
#                     + ' from "./content/'
#                     + section
#                     + "/"
#                     + page_with_section
#                     + '.svelte";'
#                     + "\n"
#                 )

#         app_svelte = app_svelte.replace("//$$$IMPORTS$$$", imports)
#         app_svelte = app_svelte.replace("//$$$ROUTES$$$", routes)
#         app_svelte = app_svelte.replace("$$$SIDEBAR$$$", sidebar)
#         with open("./app/svelte-site/src/App.svelte", "w") as f:
#             f.write(app_svelte)
