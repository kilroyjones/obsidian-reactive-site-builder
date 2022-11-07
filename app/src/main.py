# """
# Main
# """

import logging
import sys
from extensions.internal_links import InternalLinks
from extensions.images import Images
from extensions.sidenotes import Sidenotes
from path_check import *
from site_builder import SiteBuilder
from site_profile import SiteProfile
from site_render import SiteRender

logger = logging.getLogger(__name__)

def main():
    if len(sys.argv) != 3:
        print("vault_to_site: incorrect number of arguments.")
        print("Use: python main.py <vault-path> <output-path>")
        quit()

    input_path = sys.argv[1]
    build_path = sys.argv[2]

    if not does_vault_path_exist(input_path):
        quit('')
        
    if not is_valid_vault(input_path):
        quit()

    prepare_build_path(build_path)

    profile = SiteProfile(input_path)
    render = SiteRender(profile, [Images, InternalLinks, Sidenotes])
    builder = SiteBuilder(profile, render, build_path)
    builder.copy_assets()
    builder.save_site()
