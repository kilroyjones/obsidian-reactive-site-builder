"""
Main
"""

import sys
import markdown as md
from site_builder import SiteBuilder
from site_profile import SiteProfile
from site_render import SiteRender
from processors.internal_links import InternalLinks
from processors.images import Images
from processors.sidenotes import Sidenotes

def check_input_path(input_path):
    pass

def check_build_path(built_path):
    pass

if __name__ == "__main__":

    # Add checks on these paths
    if len(sys.argv != 2):
        print("vault_to_site: incorrect number of arguments.")
        print("Use: python main.py <vault-path> <output-path>")
        exit()
    

    input_path = sys.argv[1]
    build_path = sys.argv[2]
    profile = SiteProfile(input_path)
    render = SiteRender(profile, [Images, InternalLinks, Sidenotes])
    builder = SiteBuilder(profile, render, build_path)
