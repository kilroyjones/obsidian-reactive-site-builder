"""
Main
"""

import sys
import markdown as md
from builder import Builder
from profile import Profile
from processors.links import Links
from processors.images import Images
from processors.quizzes import Quizzes
from processors.sidenotes import Sidenotes

if __name__ == "__main__":
    print(sys.argv)
    
    # Add checks on these paths
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    course_profile = Profile(input_path) 
    print(course_profile)

    course_builder = Builder(course_profile, md, [Links])
    course_builder.build_site(output_path)
