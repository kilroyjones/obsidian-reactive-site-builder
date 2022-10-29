"""
Main
"""

import sys
import markdown as md
from builder import Builder
from profile import Profile
from processors.internal_links import InternalLinks
from processors.images import Images
from processors.quizzes import Quizzes
from processors.sidenotes import Sidenotes

if __name__ == "__main__":
    
    # Add checks on these paths
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    profile = Profile(input_path) 

    builder = Builder(profile, md, [Images, InternalLinks, Sidenotes])
    builder.build_site(output_path)
