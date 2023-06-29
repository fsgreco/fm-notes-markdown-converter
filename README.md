# Frontend Masters notes markdown converter

This script generates a markdown file from the notes you wrote on Frontend Masters course. It needs the exported json with your notes. 

![before and after](assets/readme-image.png)

## How to use: 
1. Clone this repository
2. Download the json file with your notes from the course platform.
3. Add the json file at the root of this project, rename it: `data.json`.
4. Launch the script with `npm start`

## Notes:

* This is an early implementation just for my convenience (an alpha at least), feedback is appreciated. 

* You can generate a version without timestamp links by passing `false` as a second argument to the function `generateMarkdown`
