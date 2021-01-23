with open("quiz1.md") as f:
    lines = f.readlines()

questions = {}
correct = {}
current_question = ""

for line in lines:
    line = line.strip()
    if line[:2].lower() == "q:":
        current_question = line[2:].strip()
        questions[current_question] = []
        correct[current_question] = []
    if line[:3] == "():" or line[:4] == "( ):":
        questions[current_question].append(line[3:])
    elif line[:4].lower() == "(x):":
        questions[current_question].append(line[4:])
        correct[current_question].append(line[4:].strip())

print(questions)
print(correct)