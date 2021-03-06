from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler
from selenium import webdriver
import time
import os
import logging
import urllib
import sys
import http.server
import socketserver
import threading

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler
driver = webdriver.Chrome()

def rebuild():
    web_dir = os.path.join(os.path.dirname(__file__), 'course')
    os.chdir(web_dir)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("serving at port", PORT)
        httpd.serve_forever()   

def on_created(event):
    print(f"hey, {event.src_path} has been created!")

def on_deleted(event):
    print(f"what the f**k! Someone deleted {event.src_path}!")

def on_modified(event):
    print(f"hey buddy, {event.src_path} has been modified")
    global driver
    driver.refresh()

def on_moved(event):
    print(f"ok ok ok, someone moved {event.src_path} to {event.dest_path}")

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else '.'

    patterns = "*"
    ignore_patterns = ""
    ignore_directories = False
    case_sensitive = True
    event_handler = PatternMatchingEventHandler(patterns, ignore_patterns, ignore_directories, case_sensitive)
    event_handler.on_created = on_created
    event_handler.on_deleted = on_deleted
    event_handler.on_modified = on_modified
    event_handler.on_moved = on_moved


    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()
    web_server = threading.Thread(target=rebuild)
    web_server.start()
    time.sleep(1)
    driver.get("http://localhost:8000")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
    web_server.join()