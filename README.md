# Vault to site

A program to convert Obsidian vaults into a static site. You can see an example of finished site with the default theme [here](https://vault2site.pages.dev/). At the moment only the basic features of Obsidian are implemented and the program will fail to render certain things correctly, such as resizing an image as shown below.

```markdown
![[image.jpg|size]]
```

You can put these in as issues on [github](https://github.com/kilroyjones/vault2site) as you find them and when I have the time I'll work on adding them. Or, you can fork it and build it out how you want.

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

## Usage

To convert your vault you should first include the **.themes** folder from the **demo_vault** folder in this repo into the root folder of your Obsidian vault. The **.themes** folder contains two files:

```text
.themes
  ├─ page.css
  ├─ page.html

```

The above folder will not be visible from within Obsidian, as it hide files starting with periods by default.

## Modifying the theme

The current theme is easily modified by changing the CSS (page.css), but the **page.html** file, when modified, should still contain the items **{{header}}**, **{{menu}}**, and **{{body}}** or the program won't run.

## Add extensions

Currently working on allowing external extensions.
