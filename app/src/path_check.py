import logging
import os
import sys
from pathlib import Path

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