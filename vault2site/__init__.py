"""
Main
"""

import logging
import os
import sys
import markdown as md
from pathlib import Path
from extensions.internal_links import InternalLinks
from extensions.images import Images
from extensions.sidenotes import Sidenotes
from site_builder import SiteBuilder
from site_profile import SiteProfile
from site_render import SiteRender

logger = logging.getLogger(__name__)

def does_vault_path_exist(path):
    path = Path(path) 
    if not path.exists():
        logger.error("ERROR: Cannot find the vault path {}.".format(path))
        return False
    return True 

def is_valid_vault(path):
    theme_path = Path(os.path.join(path, '.theme'))
    if not theme_path.exists():
        logger.error("ERROR: Cannont find theme folder (.theme) in the vault root.")
        return False

    page_path = Path(os.path.join(theme_path, 'page.html'))
    css_path = Path(os.path.join(theme_path, 'page.css'))
    if not page_path.exists() or not css_path.exists():
        logger.error("ERROR: Theme folder (.theme) at vault root must contain the template (page.html) and the stylesheet (page.css).")
        return False
    return True

def prepare_build_path(path):
    path = Path(path)
    if not path.exists():
        path.parent.mkdir(exist_ok=True, parents=True)

if __name__ == "__main__":

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
