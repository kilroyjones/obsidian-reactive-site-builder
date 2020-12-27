"""
Main
"""

import markdown as md
from builder import Builder
from profile import Profile
from processors.links import Links

if __name__ == "__main__":
    course_profile = Profile("./app/course")
    course_builder = Builder(course_profile, md, [Links])
    course_builder.output_markdown("./app/svelte-site")
