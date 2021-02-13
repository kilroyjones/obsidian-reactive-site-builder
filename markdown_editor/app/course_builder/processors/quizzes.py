import os
import re


class Quizzes:
    def __init__(self, markdown_pages, profile):
        self.markdown_pages = markdown_pages
        self.profile = profile

    def __render_quiz(self, quiz):
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

    def __get_quiz(self, tag_title, quiz_pages):
        for quiz in quiz_pages:
            if tag_title in quiz.markdown_relative_path:
                quiz_data = self.__render_quiz(quiz.content)
                quiz_data = "<Quiz questions={" + str(quiz_data) + "}/>"
                return quiz_data
        return None

    def __process_matches(self, page, matches, quiz_pages):
        for match in matches:
            to_replace = match[0].strip()
            tag_title = match[1].strip()
            quiz = self.__get_quiz(tag_title, quiz_pages)
            if quiz:
                page.content = page.content.replace(to_replace, quiz)
                page.add_header('import Quiz from "@/Quiz.svelte";')
        return page

    def __get_all_possible_links(self, content):
        return re.findall("[^$!](\[\[(.*?)\]\])", content)

    def __get_quiz_pages(self):
        quiz_pages = []
        for page in self.markdown_pages:
            partial_path = page.section + "/quizzes"
            if partial_path in page.path:
                quiz_pages.append(page)
        return quiz_pages

    def run(self, markdown_file=""):
        quiz_pages = self.__get_quiz_pages()
        for page in self.markdown_pages:
            matches = self.__get_all_possible_links(page.content)
            if len(matches) > 0:
                page = self.__process_matches(page, matches, quiz_pages)
        return self.markdown_pages
