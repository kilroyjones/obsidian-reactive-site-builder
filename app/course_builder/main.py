"""
Main
"""

import markdown as md
from builder import Builder
from profile import Profile
from processors.links import Links
from processors.images import Images
from processors.quizzes import Quizzes
from processors.sidenotes import Sidenotes

if __name__ == "__main__":
    import os

    course_profile = Profile(
        "/home/kilroy/Code/Projects/course_builder/app/course",
    )
    course_builder = Builder(course_profile, md, [Quizzes, Links, Images, Sidenotes])
    course_builder.output_markdown(
        "/home/kilroy/Code/Projects/course_builder/app/svelte-site"
    )
