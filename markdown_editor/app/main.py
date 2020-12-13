import markdown as md
from TestExtension import DelExtension, BoxExtension

# md.markdown(text, extensions=[DelExtension(option='value')])

with open('course/test.md') as f:
    doc = f.read()
    md.markdown(doc, extensions=[DelExtension(), BoxExtension()])


