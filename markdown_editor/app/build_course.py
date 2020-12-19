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
        self.load()

    def load(self):
        files = os.listdir(self.source_path)
        for item in files:
            file_path = os.path.join(self.source_path, item)
            if os.path.isdir(file_path) and str(item + ".md") in files:
                self.section_pages[item] = os.listdir(os.path.join(self.source_path, item))
                self.sections.append(item)

    def create(self):
        for section in self.section_pages:
            source = os.path.join(self.source_path, section + '.md')
            destination = os.path.join(self.destination_path, section.capitalize() + '.svelte')

            self.convert_page(source, destination)
            self.clean_directory(self.destination_path, section)

            for page in self.section_pages[section]:
                source = os.path.join(self.source_path, section, page)
                destination = os.path.join(self.destination_path, section, page[:-3].capitalize().replace(' ', '_') + '_' + section.capitalize() + '.svelte')
                self.convert_page(source, destination)
            
            # create_links(section, sections[section], source_path)

    def convert_page(self, source, destination):
        page = ''
        with open(source) as f:
            page = md.markdown(f.read())
        with open(destination, 'w') as f:
            f.write(prettierfier.prettify_html(page))

    def clean_directory(self, destination_path, section):
        path = os.path.join(destination_path, section)
        if os.path.exists(path):
            shutil.rmtree(path)
        os.mkdir(path) 

    # def link_page(page, section):
    #     matches = re.findall("(\[\[(.*?)\]\])", page)
    #     for match in matches: 
    #         match = match.strip() 
    #         if match in pages: 
    #             page.replace(matches[0], "<a href=./" + section)


                
    def create_routes(self):
        with open('./app/svelte-site/site_template/App.svelte') as f:
            app_svelte = f.read()
        
        routes = ''
        imports = ''
        sidebar = ''
        for section in self.sections:
            section_capped = section.capitalize()
            routes += '\"/' + section + '\": ' + section_capped + ',\n'
            imports += 'import ' + section_capped + ' from \"./content/' + section_capped + '.svelte\";' + '\n'
            sidebar += '<a href=\"/' + section + '\" ' + 'use:link use:active>' + section_capped + '</a>' + '\n'

        for section in self.sections:
            for page in self.section_pages[section]:
                page = page[:-3].replace(' ', '_')
                page_capped = page.capitalize()
                page_with_section = page_capped + '_' + section_capped
                routes += '\"/' + section + '/' + page + '\": ' + page_with_section  + ',\n'
                imports += 'import ' + page_with_section + ' from \"./content/' + section + '/' + page_with_section + '.svelte\";' + '\n'

        app_svelte = app_svelte.replace('//$$$IMPORTS$$$', imports)
        app_svelte = app_svelte.replace('//$$$ROUTES$$$', routes)
        app_svelte = app_svelte.replace('$$$SIDEBAR$$$', sidebar)
        with open('./app/svelte-site/src/App.svelte', 'w') as f:
            f.write(app_svelte)



        


          
            


# def build(source_path, destination_path):
#    source_path = source_path
#    destination_path = destination_path 
#    create()
   