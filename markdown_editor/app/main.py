import markdown as md
import prettierfier
import shutil
import os


def get_section_files(section_path):
    return os.listdir(section_path)

def get_sections(course_path):
    sections = {}
    files = os.listdir(course_path)
    for item in files:
        if os.path.isdir(course_path + '/' + item) and str(item + ".md") in files:
            sections[item] = get_section_files(course_path + '/' + item)
    return sections

def convert_page(source, destination):
    '''
    The way the HTML formatting is done is odd. Need to find another source that does a better job. 
    '''
    page = ''
    with open(source) as f:
       page = md.markdown(f.read())
    with open(destination, 'w') as f:
        f.write(prettierfier.prettify_html(page))

def output_course(course_path, sections):
    for section in sections:
        source = course_path + '/' + section + '.md'
        destination = './app/public/' + section + '.md'
        convert_page(source, destination)

        dir = './app/public/' + section
        if os.path.exists(dir):
            shutil.rmtree(dir)
        os.mkdir(dir) 

        for page in sections[section]:
            source = course_path + '/' + section + '/' + page
            destination = './app/public/' + section + '/' + page[:-3] + '.html'
            convert_page(source, destination)


if __name__ == "__main__":
    course_path = './app/course'
    sections = get_sections(course_path) 
    output_course(course_path, sections)


