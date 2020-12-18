import markdown as md
import prettierfier
import shutil
import os


class BuildCourse:

    def __init__(self, source_path):
        self.source_path = source_path 
        self.sections = self.get_sections()

    def get_section_files(self, section_path):
        return os.listdir(section_path)

    def get_sections(self):
        sections = {}
        files = os.listdir(self.source_path)
        for item in files:
            if os.path.isdir(self.source_path + '/' + item) and str(item + ".md") in files:
                sections[item] = self.get_section_files(self.source_path + '/' + item)
        return sections

    def build_links(page):
        pass

    def convert_page(self, source, destination):
        '''
        The way the HTML formatting is done is odd. Need to find another source that does a better job. 
        '''
        page = ''
        with open(source) as f:
            page = md.markdown(f.read())
        with open(destination, 'w') as f:
            f.write(prettierfier.prettify_html(page))
    
    def clean_directory(self, destination_path, section):
        dir = destination_path + '/' + section
        if os.path.exists(dir):
            shutil.rmtree(dir)
        os.mkdir(dir) 

    def output_course(self, destination_path):
        for section in self.sections:
            source = self.source_path + '/' + section + '.md'
            destination = destination_path + '/' + section + '.md'
            self.convert_page(source, destination)
            self.clean_directory(destination_path, section)

            for page in self.sections[section]:
                source = self.source_path + '/' + section + '/' + page
                destination = destination_path + '/' + section + '/' + page[:-3] + '.html'
                self.convert_page(source, destination)


if __name__ == "__main__":
    course = BuildCourse('./app/course')
    course.output_course('./app/public')

