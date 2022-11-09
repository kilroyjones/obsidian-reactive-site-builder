## Installation

### Using pip

This is the easiest way.

```bash
pip install vault2site
```

Then just use as you would a normal console app:

```
vault2site <vault path> <output path>
```

### From source

This assumes you'll be installing it to a virtual environment.

```bash
git clone https://github.com/kilroyjones/vault2site
cd vault2site
virtualenv -p python3 venv
. venv/bin/activate
pip install -r requirements.txt
```

From this point you can run the program as follows:

```bash
python app/vault2site/main.py <vault path> <output path>
```

Or, alternatively you can use pip and install it:

```bash
cd app
pip install .
```

Then, same as using pip you can run it as:

```
vault2site <vault path> <output path>
```