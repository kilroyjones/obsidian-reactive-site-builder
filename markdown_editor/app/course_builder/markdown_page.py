class MarkdownPage:
    def __init__(self, section, content, path):
        self.section = section
        self.content = content
        self.path = path
        self.headers = []
        self.filename = self.__get_filename()
        self.markdown_link = self.__get_markdown_link()
        self.markdown_relative_path = self.__get_markdown_relative_path()
        self.svelte_path = self.__get_svelte_path()
        self.is_homepage = self.__is_homepage()
        self.is_quiz = self.__is_quiz()

    def add_header(self, header):
        if header not in self.headers:
            self.headers.append(header)

    def update_page(self, content):
        self.content = content

    def __get_filename(self):
        return self.path.split("/")[-1].strip()

    def __get_markdown_link(self):
        return self.filename.strip()[:-3]

    def __get_markdown_relative_path(self):
        index = self.path.index(self.section)
        return self.path[index:][:-3]

    def __is_homepage(self):
        if self.filename.lower() == "home.md":
            return True
        return False

    def __is_quiz(self):
        partial_path = self.section + "/quizzes"
        if partial_path in self.path:
            return True
        return False

    def __get_svelte_path(self):
        return self.markdown_relative_path.replace(" ", "_")

    def display(self):
        print(self.section)
        # print(self.content)
        print(self.path)
        print(self.svelte_path)
        print("l", self.markdown_link)
        print("r", self.markdown_relative_path)
        print(self.headers)
        print(self.filename)
        print(self.is_homepage)
        print(self.is_quiz)