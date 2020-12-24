"""
Main
"""

import markdown as md
from builder import Builder
from profile import Profile

if __name__ == "__main__":
    course_profile = Profile("./app/course")
    course_builder = Builder(course_profile, md, [])
    course_builder.output_markdown("./app/svelte-site")
