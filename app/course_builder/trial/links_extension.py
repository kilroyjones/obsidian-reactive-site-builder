from app.course_builder.site_render import Builder
from profile import Profile
import markdown as md
import os
from extension import LinkExtension

if __name__ == "__main__":
    course_profile = Profile(
        "/home/kilroy/code/projects/course_builder/markdown_editor/app/course",
    )
    md = md.Markdown(extensions=[LinkExtension(profile=course_profile)])

    course_builder = Builder(course_profile, md, None)
    course_builder.output_markdown(
        "/home/kilroy/code/projects/course_builder/markdown_editor/app/svelte-site"
    )
