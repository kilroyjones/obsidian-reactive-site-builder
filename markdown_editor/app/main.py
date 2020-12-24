from build_course import BuildCourse

if __name__ == "__main__":
    source_path = "./app/course"
    destination_path = "./app/svelte-site/src/content"
    bc = BuildCourse(source_path, destination_path)
    bc.create()
    bc.create_routes()
