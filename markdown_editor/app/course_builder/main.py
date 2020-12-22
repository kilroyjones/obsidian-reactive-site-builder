"""
Main
"""

import markdown as md
from builder import Builder

# from processors.routes import Routes
from profile import Profile

if __name__ == "__main__":
    course_profile = Profile("../course")
    course_builder = Builder(course_profile, md, [])
    course_builder.output_markdown("../svelte-site/src/content")
