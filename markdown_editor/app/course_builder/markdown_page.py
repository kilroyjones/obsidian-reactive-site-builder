class MarkdownPage:
    def __init__(self, page, headers=[]):
        self.page = page
        self.headers = headers

    def add_header(self, header):
        if header not in self.headers:
            self.headers.append(header)

    def update_page(self, page):
        self.page = page
