# Vault to site

A program to convert Obsidian vaults into a static site. At the moment only the basic features are implemented and the program will fail to render certain things correctly, such as resizing an image as shown below.

```markdown
![[image.jpg|size]]
```

You can put these in as issues as you find them and when I have the time I'll work on adding them. Or, you can fork it and built it out how you want.

## Installation

Clone the repo

### Using pip

### With the repo

## Usage

To convert your vault you should first include the **.themes** folder from the **demo_vault** folder in this repo into the root folder of your Obsidian vault. The **.themes** folder contains two files:

```text
.themes
  ├─ page.css
  ├─ page.html

```

The above folder will not be visible from within Obsidian, as it hide files starting with periods by default.

## Modifying the theme

The current theme is just something simple for myself. You can modify the CSS however you feel without difficulty, but the **page.html** file should contain the items **{{header}}**, **{{menu}}**, and **{{body}}** or the program won't run.

## Add extensions

Currently working on allowing external extensions.
