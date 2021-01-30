import os
import re


class Quizzes:
    def __init__(self, markdown_pages, profile):
        self.markdown_pages = markdown_pages
        self.profile = profile

    def __get_quiz_data(self, quiz):
        questions = []
        question_counter = -1
        question = {"question": "", "answers": [], "correct": []}

        for line in quiz.split("\n"):
            line = line.strip()
            if line[:2].lower() == "q:":
                question_counter += 1
                questions.append({"question": "", "answers": [], "correct": []})
                questions[question_counter]["question"] = line[3:]
            elif re.match("\(\s*\)\s*:", line):
                line = line.split(":")
                line = "".join(line[1:])
                questions[question_counter]["answers"].append(line)
                questions[question_counter]["correct"].append(0)
            elif re.match("\(\s*[xX]\s*\)\s*:", line):
                line = line.split(":")
                line = "".join(line[1:])
                questions[question_counter]["answers"].append(line)
                questions[question_counter]["correct"].append(1)
        return questions

    def __get_all_possible_links(self, page):
        return re.findall("[^!](\[\[(.*?)\]\])", page)

    def __add_svelte_header(self, page):
        return '<script>import Quiz from "@/Quiz.svelte";</script>\n' + page

    def __process_matches(self, matches, page, quiz_data):
        page = self.__add_svelte_header(page)
        quiz_data = "<Quiz questions={" + str(quiz_data) + "}/>"
        for match in matches:
            to_replace = match[0].strip()
            page = page.replace(to_replace, quiz_data)
        return page

    def __add_quiz(self, section, quiz_data):
        for path in self.profile.section_pages[section]:
            page = self.markdown_pages[path]
            matches = self.__get_all_possible_links(page)
            self.markdown_pages[path] = self.__process_matches(matches, page, quiz_data)

    def run(self):
        for quiz_path, section in self.profile.quizzes_paths:
            quiz = self.markdown_pages[quiz_path]
            quiz_data = self.__get_quiz_data(quiz)
            self.__add_quiz(section, quiz_data)
        return self.markdown_pages


if __name__ == "__main__":
    with open("quiz1.md") as f:
        lines = f.readlines()
